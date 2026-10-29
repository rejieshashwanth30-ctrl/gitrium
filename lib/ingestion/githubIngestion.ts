import { prisma } from "@/lib/db/prisma";
import { createGitHubClient } from "@/lib/github/client";
import { fetchUserRepositories } from "@/lib/github/repositories";
import { fetchRepositoryLanguages } from "@/lib/github/languages";
import { fetchRepositoryCommits } from "@/lib/github/commits";
import { fetchRepositoryPullRequests } from "@/lib/github/pullRequests";
import { detectTechnologiesFromRepository } from "@/lib/analysis/technologyAnalysis";
import { decryptToken } from "@/lib/security/encryption";

export interface SyncResult {
  repositoriesCount: number;
  commitsCount: number;
  pullRequestsCount: number;
  technologiesCount: number;
  syncedAt: Date;
  status: "COMPLETE" | "PARTIAL" | "FAILED" | "RATE_LIMITED";
  coverage: {
    repositories: "COMPLETE" | "PARTIAL" | "FAILED";
    commits: "COMPLETE" | "PARTIAL" | "FAILED";
    pullRequests: "COMPLETE" | "PARTIAL" | "FAILED";
    languages: "COMPLETE" | "PARTIAL" | "FAILED";
  };
  errors?: string[];
}

/**
 * Ingests and synchronizes real GitHub data for an authenticated user.
 * Normalizes and stores evidence while preventing duplicates and handling partial failures.
 */
export async function syncUserGitHubData(
  userId: string,
  githubAccessToken?: string
): Promise<SyncResult> {
  const syncedAt = new Date();
  const errors: string[] = [];

  // Coverage tracking
  const coverage: SyncResult["coverage"] = {
    repositories: "FAILED",
    commits: "FAILED",
    pullRequests: "FAILED",
    languages: "FAILED",
  };

  // If token is encrypted, decrypt it for internal API communication
  let token = githubAccessToken;
  if (token && token.includes(":")) {
    token = decryptToken(token);
  }

  // If token not provided directly, retrieve from stored GitHubAccount
  if (!token) {
    try {
      const ghAccount = await prisma.gitHubAccount.findUnique({
        where: { userId },
        select: { accessToken: true },
      });
      if (ghAccount?.accessToken) {
        token = decryptToken(ghAccount.accessToken);
      }
    } catch {
      // Proceed with unauthenticated or public rate limits
    }
  }

  const octokit = createGitHubClient(token);

  // 1. Fetch user repositories (pagination handled inside fetchUserRepositories)
  let repos: Awaited<ReturnType<typeof fetchUserRepositories>> = [];
  try {
    repos = await fetchUserRepositories(octokit, 3);
    coverage.repositories = repos.length > 0 ? "COMPLETE" : "PARTIAL";
  } catch (err: any) {
    const isRateLimited = err?.status === 403 || err?.status === 429;
    errors.push(isRateLimited ? "GitHub API rate limit exceeded during repository fetch" : "Repository fetch failed");
    return {
      repositoriesCount: 0,
      commitsCount: 0,
      pullRequestsCount: 0,
      technologiesCount: 0,
      syncedAt,
      status: isRateLimited ? "RATE_LIMITED" : "FAILED",
      coverage,
      errors,
    };
  }

  let totalCommits = 0;
  let totalPRs = 0;
  let totalTechnologies = 0;
  let commitFailures = 0;
  let prFailures = 0;
  let languageFailures = 0;

  for (const repoData of repos) {
    const [owner, repoName] = repoData.fullName.split("/");

    // 2. Fetch languages
    let languages: Awaited<ReturnType<typeof fetchRepositoryLanguages>> = [];
    try {
      languages = await fetchRepositoryLanguages(octokit, owner, repoName);
    } catch {
      languageFailures++;
    }

    // 3. Detect technologies deterministically
    const technologies = detectTechnologiesFromRepository(repoData.name, languages);
    totalTechnologies += technologies.length;

    try {
      // 4. Safe upsert Repository record with deduplication
      const repository = await prisma.repository.upsert({
        where: {
          userId_githubRepoId: {
            userId,
            githubRepoId: repoData.githubRepoId,
          },
        },
        update: {
          name: repoData.name,
          fullName: repoData.fullName,
          description: repoData.description,
          isPrivate: repoData.isPrivate,
          isFork: repoData.isFork,
          primaryLanguage: repoData.primaryLanguage,
          stars: repoData.stars,
          forks: repoData.forks,
          watchers: repoData.watchers,
          openIssues: repoData.openIssues,
          defaultBranch: repoData.defaultBranch,
          repoUrl: repoData.repoUrl,
          updatedAt: repoData.updatedAt,
          pushedAt: repoData.pushedAt,
          analysisStatus: "completed",
        },
        create: {
          userId,
          githubRepoId: repoData.githubRepoId,
          name: repoData.name,
          fullName: repoData.fullName,
          description: repoData.description,
          isPrivate: repoData.isPrivate,
          isFork: repoData.isFork,
          primaryLanguage: repoData.primaryLanguage,
          stars: repoData.stars,
          forks: repoData.forks,
          watchers: repoData.watchers,
          openIssues: repoData.openIssues,
          defaultBranch: repoData.defaultBranch,
          repoUrl: repoData.repoUrl,
          createdAt: repoData.createdAt,
          updatedAt: repoData.updatedAt,
          pushedAt: repoData.pushedAt,
          analysisStatus: "completed",
        },
      });

      // 5. Upsert Languages
      for (const lang of languages) {
        await prisma.repositoryLanguage.upsert({
          where: {
            repositoryId_name: {
              repositoryId: repository.id,
              name: lang.name,
            },
          },
          update: {
            bytes: lang.bytes,
            percentage: lang.percentage,
          },
          create: {
            repositoryId: repository.id,
            name: lang.name,
            bytes: lang.bytes,
            percentage: lang.percentage,
          },
        });
      }

      // 6. Upsert Technologies
      for (const tech of technologies) {
        await prisma.repositoryTechnology.upsert({
          where: {
            repositoryId_name: {
              repositoryId: repository.id,
              name: tech.name,
            },
          },
          update: {
            category: tech.category,
            confidence: tech.confidence,
          },
          create: {
            repositoryId: repository.id,
            name: tech.name,
            category: tech.category,
            confidence: tech.confidence,
          },
        });
      }

      // 7. Fetch Commits (for active non-fork repositories)
      if (!repoData.isFork) {
        try {
          const commits = await fetchRepositoryCommits(octokit, owner, repoName, 25);
          totalCommits += commits.length;

          for (const commit of commits) {
            await prisma.commit.upsert({
              where: {
                repositoryId_sha: {
                  repositoryId: repository.id,
                  sha: commit.sha,
                },
              },
              update: {
                message: commit.message,
                authorName: commit.authorName,
                authorDate: commit.authorDate,
              },
              create: {
                repositoryId: repository.id,
                sha: commit.sha,
                message: commit.message,
                authorName: commit.authorName,
                authorEmail: commit.authorEmail,
                authorDate: commit.authorDate,
                filesChanged: commit.filesChanged,
                additions: commit.additions,
                deletions: commit.deletions,
                isMergeCommit: commit.isMergeCommit,
              },
            });
          }
        } catch {
          commitFailures++;
        }

        // 8. Fetch PRs
        try {
          const prs = await fetchRepositoryPullRequests(octokit, owner, repoName, 15);
          totalPRs += prs.length;

          for (const pr of prs) {
            await prisma.pullRequest.upsert({
              where: {
                repositoryId_number: {
                  repositoryId: repository.id,
                  number: pr.number,
                },
              },
              update: {
                title: pr.title,
                state: pr.state,
                mergedAt: pr.mergedAt,
              },
              create: {
                repositoryId: repository.id,
                number: pr.number,
                title: pr.title,
                state: pr.state,
                createdAt: pr.createdAt,
                mergedAt: pr.mergedAt,
                author: pr.author,
                reviewsCount: pr.reviewsCount,
                commentsCount: pr.commentsCount,
              },
            });
          }
        } catch {
          prFailures++;
        }
      }
    } catch (dbErr: any) {
      console.warn(`Database write skipped for ${repoData.fullName}:`, dbErr?.message || dbErr);
    }
  }

  // Update profile status safely
  try {
    await prisma.userProfile.update({
      where: { id: userId },
      data: {
        githubConnected: true,
        updatedAt: syncedAt,
      },
    });
  } catch {
    // Database connection pending
  }

  // Determine coverage
  coverage.languages = languageFailures === 0 ? "COMPLETE" : languageFailures < repos.length ? "PARTIAL" : "FAILED";
  coverage.commits = commitFailures === 0 ? "COMPLETE" : commitFailures < repos.length ? "PARTIAL" : "FAILED";
  coverage.pullRequests = prFailures === 0 ? "COMPLETE" : prFailures < repos.length ? "PARTIAL" : "FAILED";

  const isPartial = commitFailures > 0 || prFailures > 0 || languageFailures > 0;

  return {
    repositoriesCount: repos.length,
    commitsCount: totalCommits,
    pullRequestsCount: totalPRs,
    technologiesCount: totalTechnologies,
    syncedAt,
    status: isPartial ? "PARTIAL" : "COMPLETE",
    coverage,
    errors: errors.length > 0 ? errors : undefined,
  };
}
