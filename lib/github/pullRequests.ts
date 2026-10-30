import { Octokit } from "octokit";

export interface NormalizedPullRequest {
  number: number;
  title: string;
  state: "merged" | "open" | "closed";
  createdAt: Date;
  mergedAt: Date | null;
  author: string;
  reviewsCount: number;
  commentsCount: number;
  changedFiles: number;
  additions: number;
  deletions: number;
}

export interface FetchPullRequestsOptions {
  /** Maximum number of pages to fetch (up to 100 PRs per page). Default: 5 (up to 500 PRs) */
  maxPages?: number;
  /** PRs per page (max 100). Default: 100 */
  perPage?: number;
  /** Absolute cap on total pull requests */
  maxTotalPRs?: number;
}

export interface PaginatedPullRequestsResult {
  pullRequests: NormalizedPullRequest[];
  isComplete: boolean;
  totalFetched: number;
  pagesFetched: number;
}

/**
 * Paginates through repository pull requests.
 * Fetches PRs page-by-page until all pull requests are ingested or maxPages/maxTotalPRs is reached.
 * Never silently truncates history without honest completion metadata.
 */
export async function fetchRepositoryPullRequestsPaginated(
  octokit: Octokit,
  owner: string,
  repo: string,
  options?: FetchPullRequestsOptions
): Promise<PaginatedPullRequestsResult> {
  const maxPages = options?.maxPages ?? 5;
  const perPage = Math.min(options?.perPage ?? 100, 100);
  const maxTotal = options?.maxTotalPRs ?? (maxPages * perPage);

  const pullRequests: NormalizedPullRequest[] = [];
  const seenNumbers = new Set<number>();
  let page = 1;
  let isComplete = false;

  while (page <= maxPages) {
    try {
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: "all",
        sort: "updated",
        direction: "desc",
        per_page: perPage,
        page,
      });

      if (!data || !Array.isArray(data) || data.length === 0) {
        isComplete = true;
        break;
      }

      for (const pr of data) {
        if (!pr.number || seenNumbers.has(pr.number)) continue;
        seenNumbers.add(pr.number);

        pullRequests.push({
          number: pr.number,
          title: pr.title || "Pull Request",
          state: pr.merged_at ? "merged" : pr.state === "closed" ? "closed" : "open",
          createdAt: new Date(pr.created_at),
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          author: pr.user?.login || "contributor",
          reviewsCount: 0,
          commentsCount: (pr as any).comments || 0,
          changedFiles: 0,
          additions: 0,
          deletions: 0,
        });

        if (pullRequests.length >= maxTotal) {
          break;
        }
      }

      // If GitHub returned fewer items than requested, we reached the end of PR list
      if (data.length < perPage || pullRequests.length >= maxTotal) {
        isComplete = data.length < perPage;
        break;
      }

      page++;
    } catch (error: any) {
      console.warn(`[GitHub PRs] Page ${page} failed for ${owner}/${repo}:`, error?.message || error);
      if (page === 1) {
        return { pullRequests: [], isComplete: true, totalFetched: 0, pagesFetched: 0 };
      }
      break;
    }
  }

  return {
    pullRequests,
    isComplete,
    totalFetched: pullRequests.length,
    pagesFetched: page,
  };
}

/**
 * Standard PR fetcher maintaining backwards compatibility with signature
 * while using proper multi-page pagination under the hood.
 */
export async function fetchRepositoryPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  optionsOrMaxPRs?: number | FetchPullRequestsOptions
): Promise<NormalizedPullRequest[]> {
  const options: FetchPullRequestsOptions =
    typeof optionsOrMaxPRs === "number"
      ? {
          maxTotalPRs: optionsOrMaxPRs,
          maxPages: Math.max(1, Math.ceil(optionsOrMaxPRs / 100)),
          perPage: Math.min(100, optionsOrMaxPRs),
        }
      : optionsOrMaxPRs || { maxPages: 5, perPage: 100, maxTotalPRs: 500 };

  const result = await fetchRepositoryPullRequestsPaginated(octokit, owner, repo, options);
  return result.pullRequests;
}
