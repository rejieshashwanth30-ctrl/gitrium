/**
 * ADYK Gitrium — GitHub Access Token Verification Service
 * Verifies that a GitHub OAuth access token is valid and active by querying
 * GitHub's authenticated /user endpoint before persisting or starting ingestion.
 */

export interface GitHubTokenVerification {
  valid: boolean;
  status: number;
  user?: {
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string | null;
    email: string | null;
  };
  scopes?: string[];
  error?: "EXPIRED" | "REVOKED" | "RATE_LIMITED" | "NETWORK_ERROR" | "INVALID";
  errorMessage?: string;
}

export async function verifyGitHubAccessToken(
  token: string
): Promise<GitHubTokenVerification> {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return {
      valid: false,
      status: 400,
      error: "INVALID",
      errorMessage: "No access token provided",
    };
  }

  const cleanToken = token.trim();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Gitrium-Evidence-Vault/1.4",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const scopesHeader = res.headers.get("x-oauth-scopes") || "";
    const scopes = scopesHeader
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (res.status === 200) {
      const data = await res.json();
      return {
        valid: true,
        status: 200,
        user: {
          id: String(data.id),
          login: data.login,
          name: data.name || data.login,
          avatarUrl: data.avatar_url || null,
          email: data.email || null,
        },
        scopes,
      };
    }

    if (res.status === 401) {
      return {
        valid: false,
        status: 401,
        error: "EXPIRED",
        errorMessage: "GitHub access token has expired or been revoked.",
        scopes,
      };
    }

    if (res.status === 403 || res.status === 429) {
      return {
        valid: false,
        status: res.status,
        error: "RATE_LIMITED",
        errorMessage: "GitHub API rate limit exceeded.",
        scopes,
      };
    }

    return {
      valid: false,
      status: res.status,
      error: "INVALID",
      errorMessage: `GitHub verification failed with HTTP ${res.status}`,
      scopes,
    };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return {
        valid: false,
        status: 408,
        error: "NETWORK_ERROR",
        errorMessage: "GitHub API verification request timed out.",
      };
    }
    return {
      valid: false,
      status: 500,
      error: "NETWORK_ERROR",
      errorMessage: err?.message || "Failed to reach GitHub API.",
    };
  }
}
