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

export async function fetchRepositoryPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  maxPRs = 30
): Promise<NormalizedPullRequest[]> {
  try {
    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: maxPRs,
    });

    if (!data || !Array.isArray(data)) return [];

    return data.map((pr) => ({
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
    }));
  } catch (error) {
    console.warn(`Could not fetch PRs for ${owner}/${repo}:`, error);
    return [];
  }
}
