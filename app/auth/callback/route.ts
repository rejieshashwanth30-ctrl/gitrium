import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile, invalidateUserProfileCache } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/encryption";
import { verifyGitHubAccessToken } from "@/lib/github/verifyToken";
import { syncUserGitHubData } from "@/lib/ingestion/githubIngestion";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Safe redirect path validation (protect against open redirects)
  const rawNext = searchParams.get("next") ?? "/select-repositories";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/select-repositories";

  // 1. Handle cancelled authorization or OAuth error from provider
  if (error) {
    console.warn("[OAuth Callback] Authorization error from provider:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/github-connect?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // 2. Exchange authorization code for Supabase session
  if (code) {
    try {
      const supabase = createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.user) {
        console.error("[OAuth Callback] Exchange code for session failed:", exchangeError?.message);
        return NextResponse.redirect(
          `${origin}/github-connect?error=exchange_failed`
        );
      }

      const profile = await ensureUserProfile(data.user);
      if (!profile) {
        return NextResponse.redirect(`${origin}/github-connect?error=profile_not_found`);
      }

      const providerToken = data.session?.provider_token;

      // 3. Verify the token directly with GitHub API before persisting
      if (providerToken) {
        console.log("[OAuth Callback] Verifying GitHub provider_token with GitHub API...");
        const verification = await verifyGitHubAccessToken(providerToken);

        if (verification.valid && verification.user) {
          console.log(`[OAuth Callback] GitHub token verified for @${verification.user.login} (ID: ${verification.user.id})`);
          const encryptedToken = encryptToken(providerToken);

          // Persist verified GitHub Account
          await prisma.gitHubAccount.upsert({
            where: { userId: profile.id },
            update: {
              githubId: verification.user.id,
              username: verification.user.login,
              profileUrl: `https://github.com/${verification.user.login}`,
              avatarUrl: verification.user.avatarUrl || null,
              accessToken: encryptedToken,
              connectionStatus: "connected",
              updatedAt: new Date(),
            },
            create: {
              userId: profile.id,
              githubId: verification.user.id,
              username: verification.user.login,
              profileUrl: `https://github.com/${verification.user.login}`,
              avatarUrl: verification.user.avatarUrl || null,
              accessToken: encryptedToken,
              connectionStatus: "connected",
            },
          });

          // Mark user profile as connected
          await prisma.userProfile.update({
            where: { id: profile.id },
            data: {
              githubConnected: true,
              githubUsername: verification.user.login,
              avatarUrl: verification.user.avatarUrl || profile.avatarUrl,
            },
          });
          invalidateUserProfileCache(profile.id);

          // 4. Automatically trigger initial repository ingestion right after connection
          try {
            console.log(`[OAuth Callback] Triggering initial repository ingestion for @${verification.user.login}...`);
            await syncUserGitHubData(profile.id, providerToken);
          } catch (syncErr: any) {
            console.warn("[OAuth Callback] Initial sync will be retried on select-repositories:", syncErr?.message);
          }

          return NextResponse.redirect(`${origin}${next}`);
        } else {
          console.error("[OAuth Callback] Token verification failed:", verification.error, verification.errorMessage);
          return NextResponse.redirect(
            `${origin}/github-connect?error=invalid_token`
          );
        }
      } else {
        // Provider token was not attached in this session exchange.
        // Check if an existing valid token exists for this profile
        const existingAccount = await prisma.gitHubAccount.findUnique({
          where: { userId: profile.id },
        });

        if (existingAccount?.accessToken) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        console.warn("[OAuth Callback] No provider_token received from Supabase OAuth exchange.");
        return NextResponse.redirect(`${origin}/github-connect?error=no_provider_token`);
      }
    } catch (err: any) {
      console.error("[OAuth Callback] Unexpected error during callback processing:", err);
      return NextResponse.redirect(`${origin}/github-connect?error=callback_error`);
    }
  }

  // 5. Fallback for returning sessions
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await ensureUserProfile(user);
      if (profile) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    return NextResponse.redirect(`${origin}/github-connect`);
  } catch (err) {
    console.error("[OAuth Callback] General callback fallback error:", err);
    return NextResponse.redirect(`${origin}/github-connect`);
  }
}
