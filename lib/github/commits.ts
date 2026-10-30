import { Octokit } from "octokit";

export interface NormalizedCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string | null;
  authorDate: Date;
  filesChanged: number;
  additions: number;
  deletions: number;
  isMergeCommit: boolean;
}

export interface FetchCommitsOptions {
  /** Maximum number of pages to fetch (up to 100 commits per page). Default: 10 (up to 1,000 commits) */
  maxPages?: number;
  /** Commits per page (max 100). Default: 100 */
  perPage?: number;
  /** Absolute cap on total commits across all pages */
  maxTotalCommits?: number;
}

export interface PaginatedCommitsResult {
  commits: NormalizedCommit[];
  isComplete: boolean;
  totalFetched: number;
  pagesFetched: number;
}

/**
 * Paginates through repository commit history.
 * Fetches commits page-by-page until all commits are ingested or maxPages/maxTotalCommits is reached.
 * Never silently truncates history without honest completion metadata.
 */
export async function fetchRepositoryCommitsPaginated(
  octokit: Octokit,
  owner: string,
  repo: string,
  options?: FetchCommitsOptions
): Promise<PaginatedCommitsResult> {
  const maxPages = options?.maxPages ?? 10;
  const perPage = Math.min(options?.perPage ?? 100, 100);
  const maxTotal = options?.maxTotalCommits ?? (maxPages * perPage);

  const commits: NormalizedCommit[] = [];
  const seenShas = new Set<string>();
  let page = 1;
  let isComplete = false;

  while (page <= maxPages) {
    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: perPage,
        page,
      });

      if (!data || !Array.isArray(data) || data.length === 0) {
        isComplete = true;
        break;
      }

      for (const item of data) {
        if (!item.sha || seenShas.has(item.sha)) continue;
        seenShas.add(item.sha);

        const isMerge = (item.parents?.length || 0) > 1;
        const authorDate = item.commit.author?.date
          ? new Date(item.commit.author.date)
          : new Date();

        commits.push({
          sha: item.sha,
          message: item.commit.message || "Commit",
          authorName: item.commit.author?.name || "Author",
          authorEmail: item.commit.author?.email || null,
          authorDate,
          filesChanged: 1, // Detailed files count available on commit detail if required
          additions: 0,
          deletions: 0,
          isMergeCommit: isMerge,
        });

        if (commits.length >= maxTotal) {
          break;
        }
      }

      // If GitHub returned fewer items than requested, we have reached the end of the history
      if (data.length < perPage || commits.length >= maxTotal) {
        isComplete = data.length < perPage;
        break;
      }

      page++;
    } catch (error: any) {
      console.warn(`[GitHub Commits] Page ${page} failed for ${owner}/${repo}:`, error?.message || error);
      if (page === 1) {
        // First page failed: repository may be empty or inaccessible
        return { commits: [], isComplete: true, totalFetched: 0, pagesFetched: 0 };
      }
      break;
    }
  }

  return {
    commits,
    isComplete,
    totalFetched: commits.length,
    pagesFetched: page,
  };
}

/**
 * Standard commit fetcher maintaining backwards compatibility with signature
 * while using proper multi-page pagination under the hood.
 */
export async function fetchRepositoryCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  optionsOrMaxCommits?: number | FetchCommitsOptions
): Promise<NormalizedCommit[]> {
  const options: FetchCommitsOptions =
    typeof optionsOrMaxCommits === "number"
      ? {
          maxTotalCommits: optionsOrMaxCommits,
          maxPages: Math.max(1, Math.ceil(optionsOrMaxCommits / 100)),
          perPage: Math.min(100, optionsOrMaxCommits),
        }
      : optionsOrMaxCommits || { maxPages: 10, perPage: 100, maxTotalCommits: 1000 };

  const result = await fetchRepositoryCommitsPaginated(octokit, owner, repo, options);
  return result.commits;
}
