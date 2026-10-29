import { Octokit } from "octokit";

export interface NormalizedLanguage {
  name: string;
  bytes: number;
  percentage: number;
}

export async function fetchRepositoryLanguages(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<NormalizedLanguage[]> {
  try {
    const { data } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    const totalBytes = Object.values(data).reduce((acc, bytes) => acc + (bytes as number), 0);
    if (totalBytes === 0) return [];

    return Object.entries(data).map(([name, bytes]) => ({
      name,
      bytes: bytes as number,
      percentage: Number((((bytes as number) / totalBytes) * 100).toFixed(1)),
    }));
  } catch (error) {
    console.warn(`Could not fetch languages for ${owner}/${repo}:`, error);
    return [];
  }
}

