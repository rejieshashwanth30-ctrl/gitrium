import { Octokit } from "octokit";

export function createGitHubClient(accessToken?: string): Octokit {
  return new Octokit({
    auth: accessToken || undefined,
  });
}

