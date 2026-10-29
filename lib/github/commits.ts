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

export async function fetchRepositoryCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  maxCommits = 50
): Promise<NormalizedCommit[]> {
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: maxCommits,
    });

    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => {
      const isMerge = (item.parents?.length || 0) > 1;
      const authorDate = item.commit.author?.date
        ? new Date(item.commit.author.date)
        : new Date();

      return {
        sha: item.sha,
        message: item.commit.message || "Commit",
        authorName: item.commit.author?.name || "Author",
        authorEmail: item.commit.author?.email || null,
        authorDate,
        filesChanged: 1, // Detailed files count available on commit detail
        additions: 0,
        deletions: 0,
        isMergeCommit: isMerge,
      };
    });
  } catch (error) {
    console.warn(`Could not fetch commits for ${owner}/${repo}:`, error);
    return [];
  }
}

