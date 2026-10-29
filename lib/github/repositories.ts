import { Octokit } from "octokit";

export interface NormalizedRepository {
  githubRepoId: string;
  name: string;
  fullName: string;
  description: string | null;
  isPrivate: boolean;
  isFork: boolean;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string;
  repoUrl: string;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date | null;
}

export async function fetchUserRepositories(
  octokit: Octokit,
  maxPages = 3
): Promise<NormalizedRepository[]> {
  const repositories: NormalizedRepository[] = [];
  let page = 1;

  while (page <= maxPages) {
    try {
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: "all",
        affiliation: "owner,collaborator",
        sort: "updated",
        direction: "desc",
        per_page: 50,
        page,
      });

      if (!response.data || response.data.length === 0) {
        break;
      }

      for (const repo of response.data) {
        repositories.push({
          githubRepoId: repo.id.toString(),
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          isPrivate: repo.private,
          isFork: repo.fork,
          primaryLanguage: repo.language,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          watchers: repo.watchers_count || 0,
          openIssues: repo.open_issues_count || 0,
          defaultBranch: repo.default_branch || "main",
          repoUrl: repo.html_url,
          createdAt: new Date(repo.created_at || Date.now()),
          updatedAt: new Date(repo.updated_at || Date.now()),
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
        });
      }

      if (response.data.length < 50) {
        break;
      }

      page++;
    } catch (error: unknown) {
      console.error(`Error fetching page ${page} of repositories:`, error);
      break;
    }
  }

  return repositories;
}

