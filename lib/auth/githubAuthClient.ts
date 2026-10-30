/**
 * ADYK Gitrium — GitHub OAuth Client Helper
 * Connects GitHub through Supabase Auth with appropriate scopes (read:user, user:email, repo),
 * ensuring the OAuth flow, scopes, and session tokens are properly established.
 */

import { createClient } from "@/utils/supabase/client";

export async function initiateGitHubConnect(callbackPath = "/select-repositories"): Promise<void> {
  const origin = window.location.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(callbackPath)}`;

  // 1. Primary path: Supabase SSR Auth (configured with Supabase callback URL)
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes: "read:user user:email repo",
      },
    });

    if (!error && data?.url) {
      window.location.href = data.url;
      return;
    }
  } catch (supabaseErr) {
    console.warn("Supabase OAuth client initiation fallback:", supabaseErr);
  }

  // 2. Fallback to server route
  window.location.href = `/api/auth/github?next=${encodeURIComponent(callbackPath)}`;
}
