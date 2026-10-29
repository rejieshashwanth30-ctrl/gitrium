/**
 * ADYK Gitrium — GitHub OAuth Client Helper
 * Seamlessly connects GitHub through Supabase Auth (with Neon Auth fallback),
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
    console.warn("Supabase OAuth initiation fallback:", supabaseErr);
  }

  // 2. Fallback path: Neon Auth
  const neonAuthUrl =
    process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
    "https://ep-wispy-cherry-b477ye05.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth";

  try {
    const res = await fetch(`${neonAuthUrl}/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        provider: "github",
        callbackURL: redirectTo,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    }
  } catch (neonErr) {
    console.warn("Neon Auth initiation fallback:", neonErr);
  }

  // 3. Fallback to server route
  window.location.href = `/api/auth/github?next=${encodeURIComponent(callbackPath)}`;
}
