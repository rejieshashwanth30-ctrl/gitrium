/**
 * ADYK Gitrium — GitHub OAuth Client Helper
 * Connects GitHub through Supabase Auth with appropriate scopes (read:user, user:email, repo),
 * ensuring the OAuth flow, scopes, and session tokens are properly established.
 * Supports active session identity linking and forces fresh consent to avoid stale/revoked token reuse.
 */

import { createClient } from "@/utils/supabase/client";

export async function initiateGitHubConnect(callbackPath = "/select-repositories"): Promise<void> {
  const origin = window.location.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(callbackPath)}`;
  const scopes = "read:user user:email repo";

  const supabase = createClient();

  // 1. Check if user already has an active Supabase session
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // User is already authenticated: attempt identity linking first
      const { data: linkData, error: linkError } = await supabase.auth.linkIdentity({
        provider: "github",
        options: {
          redirectTo,
          scopes,
        },
      });

      if (!linkError && linkData?.url) {
        window.location.href = linkData.url;
        return;
      }

      if (linkError) {
        console.warn("[OAuth Client] linkIdentity notice, falling back to signInWithOAuth:", linkError.message);
      }
    }
  } catch (err) {
    console.warn("[OAuth Client] Session check fallback:", err);
  }

  // 2. Standard OAuth sign-in with forced consent to ensure GitHub issues a fresh access token
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        scopes,
        queryParams: {
          prompt: "consent",
        },
      },
    });

    if (!error && data?.url) {
      window.location.href = data.url;
      return;
    }

    if (error) {
      console.error("[OAuth Client] signInWithOAuth returned error:", error.message);
    }
  } catch (supabaseErr) {
    console.warn("[OAuth Client] Supabase OAuth client initiation fallback:", supabaseErr);
  }

  // 3. Fallback to server route
  window.location.href = `/api/auth/github?next=${encodeURIComponent(callbackPath)}`;
}
