import { prisma } from "@/lib/db/prisma";
import { createGitHubClient } from "@/lib/github/client";
import { fetchUserRepositories, NormalizedRepository } from "@/lib/github/repositories";
import { fetchRepositoryLanguages, NormalizedLanguage } from "@/lib/github/languages";
import { fetchRepositoryCommits, NormalizedCommit } from "@/lib/github/commits";
import { fetchRepositoryPullRequests, NormalizedPullRequest } from "@/lib/github/pullRequests";
import { detectTechnologiesFromRepository } from "@/lib/analysis/technologyAnalysis";
import { decryptToken } from "@/lib/security/encryption";
import { verifyGitHubAccessToken } from "@/lib/github/verifyToken";
import { invalidateUserProfileCache } from "@/lib/auth/profileService";

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

// In-memory concurrency guard to prevent duplicate concurrent sync jobs for the same user
const activeSyncJobs = new Map<string, Promise<SyncResult>>();

/**
 * Ingests and synchronizes real GitHub data for an authenticated user.
 * Normalizes and stores evidence while preventing duplicates and handling partial failures.
 */
export async function syncUserGitHubData(
  userId: string,
  githubAccessToken?: string
): Promise<SyncResult> {
  // Concurrency guard: return existing in-flight job if one is already running
  if (activeSyncJobs.has(userId)) {
    console.log(`[GitHub Sync] In-flight sync already active for user ${userId}, awaiting existing job.`);
    return activeSyncJobs.get(userId)!;
  }

  const syncPromise = executeSync(userId, githubAccessToken).finally(() => {
    activeSyncJobs.delete(userId);
  });

  activeSyncJobs.set(userId, syncPromise);
  return syncPromise;
}

async function executeSync(
  userId: string,
  githubAccessToken?: string
): Promise<SyncResult> {
  const syncedAt = new Date();
  const errors: string[] = [];

  let syncRunId: string | null = null;
  try {
    const pendingRun = await prisma.syncRun.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { startedAt: "desc" },
    });

    if (pendingRun) {
      syncRunId = pendingRun.id;
      await prisma.syncRun.update({
        where: { id: syncRunId },
        data: { status: "SYNCING", startedAt: new Date() },
      });
    } else {
      const newRun = await prisma.syncRun.create({
        data: { userId, status: "SYNCING" },
      });
      syncRunId = newRun.id;
    }
  } catch (runErr: any) {
    console.warn("[GitHub Sync] SyncRun init notice:", runErr?.message);
  }

  const coverage: SyncResult["coverage"] = {
    repositories: "FAILED",
    commits: "FAILED",
    pullRequests: "FAILED",
    languages: "FAILED",
  };

  // 1. Resolve access token
  let token = githubAccessToken;
  if (token && token.includes(":")) {
    token = decryptToken(token);
  }

  if (!token) {
    try {
      const ghAccount = await prisma.gitHubAccount.findUnique({
        where: { userId },
        select: { accessToken: true },
      });
      if (ghAccount?.accessToken) {
        token = decryptToken(ghAccount.accessToken);
      }
    } catch (err: any) {
      console.warn("[GitHub Sync] Database account token lookup failed:", err?.message);
    }
  }

  if (!token) {
    return {
      repositoriesCount: 0,
      commitsCount: 0,
      pullRequestsCount: 0,
      technologiesCount: 0,
      syncedAt,
      status: "FAILED",
      coverage,
      errors: ["No GitHub access token found. Please connect your GitHub account."],
    };
  }

  // 2. Validate token against GitHub API authenticated endpoint
  console.log(`[GitHub Sync] Verifying access token against GitHub API for user ${userId}...`);
  const verification = await verifyGitHubAccessToken(token);

  if (!verification.valid) {
    console.error(`[GitHub Sync] Token verification failed: ${verification.error} - ${verification.errorMessage}`);
    
    // Mark connection status as expired/disconnected in database
    try {
      await prisma.gitHubAccount.updateMany({
        where: { userId },
        data: { connectionStatus: "expired", updatedAt: new Date() },
      });
      await prisma.userProfile.update({
        where: { id: userId },
        data: { githubConnected: false, updatedAt: new Date() },
      });
      invalidateUserProfileCache(userId);
    } catch {
      // Ignore database cleanup errors
    }

    if (syncRunId) {
      await prisma.syncRun.update({
        where: { id: syncRunId },
        data: {
          status: verification.error === "RATE_LIMITED" ? "RATE_LIMITED" : "TOKEN_EXPIRED",
          completedAt: new Date(),
          errorCode: verification.error,
          errorMessageSafe: verification.errorMessage || "Token validation failed",
        },
      }).catch(() => {});
    }

    return {
      repositoriesCount: 0,
      commitsCount: 0,
      pullRequestsCount: 0,
      technologiesCount: 0,
      syncedAt,
      status: verification.error === "RATE_LIMITED" ? "RATE_LIMITED" : "FAILED",
      coverage,
      errors: [verification.errorMessage || "GitHub authorization expired. Please reconnect your GitHub account."],
    };
  }

  console.log(`[GitHub Sync] Token verified successfully for @${verification.user?.login} (ID: ${verification.user?.id})`);

  // Ensure GitHubAccount is kept up to date with verified username and identity
  try {
    if (verification.user) {
      await prisma.gitHubAccount.updateMany({
        where: { userId },
        data: {
          username: verification.user.login,
          githubId: verification.user.id,
          avatarUrl: verification.user.avatarUrl,
          connectionStatus: "connected",
          updatedAt: new Date(),
        },
      });
    }
  } catch {
    // Non-fatal
  }

  const octokit = createGitHubClient(token);

  // 3. Fetch user repositories (paginated up to 10 pages / 1,000 repositories, 100/page)
  let repos: NormalizedRepository[] = [];
  try {
    repos = await fetchUserRepositories(octokit, 10);
    coverage.repositories = repos.length > 0 ? "COMPLETE" : "COMPLETE"; // 0 repos is a valid empty set
    console.log(`[GitHub Sync] Fetched ${repos.length} repositories from GitHub for @${verification.user?.login}`);
  } catch (err: any) {
    const isRateLimited = err?.status === 403 || err?.status === 429;
    const errorMsg = isRateLimited
      ? "GitHub API rate limit exceeded during repository fetch"
      : err?.message || "Repository fetch failed";
    errors.push(errorMsg);
    console.error(`[GitHub Sync] Failed to fetch repositories:`, errorMsg);
    if (syncRunId) {
      await prisma.syncRun.update({
        where: { id: syncRunId },
        data: {
          status: isRateLimited ? "RATE_LIMITED" : "FAILED",
          completedAt: new Date(),
          errorCode: isRateLimited ? "RATE_LIMITED" : "REPO_FETCH_FAILED",
          errorMessageSafe: errorMsg,
        },
      }).catch(() => {});
    }

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

  if (repos.length === 0) {
    return {
      repositoriesCount: 0,
      commitsCount: 0,
      pullRequestsCount: 0,
      technologiesCount: 0,
      syncedAt,
      status: "COMPLETE",
      coverage: {
        repositories: "COMPLETE",
        commits: "COMPLETE",
        pullRequests: "COMPLETE",
        languages: "COMPLETE",
      },
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

    // 4. Fetch languages from GitHub
    let languages: NormalizedLanguage[] = [];
    try {
      languages = await fetchRepositoryLanguages(octokit, owner, repoName);
    } catch {
      languageFailures++;
    }

    // 5. Detect technologies deterministically
    const technologies = detectTechnologiesFromRepository(repoData.name, languages);
    totalTechnologies += technologies.length;

    try {
      // 6. Safe upsert Repository record with deduplication
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

      // 7. Upsert Languages
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

      // 8. Upsert Technologies
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

      // 9. Fetch Commits (paginated up to 10 pages / 1,000 commits per repository)
      let repoCommitsCount = 0;
      if (!repoData.isFork) {
        try {
          const commits: NormalizedCommit[] = await fetchRepositoryCommits(octokit, owner, repoName, {
            maxPages: 10,
            perPage: 100,
            maxTotalCommits: 1000,
          });
          repoCommitsCount = commits.length;
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

        // 10. Fetch PRs (paginated up to 5 pages / 500 PRs per repository)
        let repoPRsCount = 0;
        try {
          const prs: NormalizedPullRequest[] = await fetchRepositoryPullRequests(octokit, owner, repoName, {
            maxPages: 5,
            perPage: 100,
            maxTotalPRs: 500,
          });
          repoPRsCount = prs.length;
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

        // Update repository counters with exact database row counts for 100% data integrity
        const [totalRepoCommits, totalRepoPRs] = await Promise.all([
          prisma.commit.count({ where: { repositoryId: repository.id } }),
          prisma.pullRequest.count({ where: { repositoryId: repository.id } }),
        ]);

        await prisma.repository.update({
          where: { id: repository.id },
          data: {
            commitCount: totalRepoCommits,
            prCount: totalRepoPRs,
          },
        });
      }
    } catch (dbErr: any) {
      console.warn(`[GitHub Sync] Database write skipped for ${repoData.fullName}:`, dbErr?.message || dbErr);
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
    invalidateUserProfileCache(userId);
  } catch {
    // Non-fatal
  }

  coverage.languages = languageFailures === 0 ? "COMPLETE" : languageFailures < repos.length ? "PARTIAL" : "FAILED";
  coverage.commits = commitFailures === 0 ? "COMPLETE" : commitFailures < repos.length ? "PARTIAL" : "FAILED";
  coverage.pullRequests = prFailures === 0 ? "COMPLETE" : prFailures < repos.length ? "PARTIAL" : "FAILED";

  const isPartial = commitFailures > 0 || prFailures > 0 || languageFailures > 0;

  if (syncRunId) {
    await prisma.syncRun.update({
      where: { id: syncRunId },
      data: {
        status: isPartial ? "PARTIAL" : "COMPLETED",
        completedAt: new Date(),
        repositoriesProcessed: repos.length,
        commitsProcessed: totalCommits,
        pullRequestsProcessed: totalPRs,
        errorCode: isPartial ? "PARTIAL_SUCCESS" : null,
        errorMessageSafe: errors.length > 0 ? errors.join("; ") : null,
      },
    }).catch(() => {});
  }

  console.log(`[GitHub Sync] Successfully synchronized ${repos.length} repos, ${totalCommits} commits, ${totalPRs} PRs.`);

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
