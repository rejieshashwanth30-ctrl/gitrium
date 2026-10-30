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

export interface FetchRepositoriesOptions {
  /** Maximum number of pages to fetch (up to 100 repositories per page). Default: 10 (up to 1,000 repositories) */
  maxPages?: number;
  /** Repositories per page (max 100). Default: 100 */
  perPage?: number;
}

export interface PaginatedRepositoriesResult {
  repositories: NormalizedRepository[];
  isComplete: boolean;
  totalFetched: number;
  pagesFetched: number;
}

/**
 * Paginates through authenticated user repositories.
 * Fetches repos page-by-page (100 per page) up to maxPages.
 * Distinguishes complete vs truncated results with isComplete flag.
 */
export async function fetchUserRepositoriesPaginated(
  octokit: Octokit,
  options?: FetchRepositoriesOptions
): Promise<PaginatedRepositoriesResult> {
  const maxPages = options?.maxPages ?? 10;
  const perPage = Math.min(options?.perPage ?? 100, 100);

  const repositories: NormalizedRepository[] = [];
  const seenIds = new Set<string>();
  let page = 1;
  let isComplete = false;

  while (page <= maxPages) {
    try {
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: "all",
        affiliation: "owner,collaborator",
        sort: "updated",
        direction: "desc",
        per_page: perPage,
        page,
      });

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        isComplete = true;
        break;
      }

      for (const repo of response.data) {
        const repoId = repo.id.toString();
        if (seenIds.has(repoId)) continue;
        seenIds.add(repoId);

        repositories.push({
          githubRepoId: repoId,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || null,
          isPrivate: repo.private,
          isFork: repo.fork,
          primaryLanguage: repo.language || null,
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

      if (response.data.length < perPage) {
        isComplete = true;
        break;
      }

      page++;
    } catch (error: any) {
      console.error(`[GitHub Repositories] Page ${page} failed:`, error?.message || error);
      // If the very first page failed, throw so the caller knows authentication or API failed
      if (page === 1) {
        throw error;
      }
      break;
    }
  }

  return {
    repositories,
    isComplete,
    totalFetched: repositories.length,
    pagesFetched: page,
  };
}

export async function fetchUserRepositories(
  octokit: Octokit,
  maxPages = 10
): Promise<NormalizedRepository[]> {
  const result = await fetchUserRepositoriesPaginated(octokit, { maxPages, perPage: 100 });
  return result.repositories;
}
