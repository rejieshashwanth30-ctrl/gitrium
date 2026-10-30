import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile, invalidateUserProfileCache } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/encryption";
import { verifyGitHubAccessToken } from "@/lib/github/verifyToken";
import { syncUserGitHubData } from "@/lib/ingestion/githubIngestion";
import { verifyDatabaseSchema } from "@/lib/db/healthCheck";

export const dynamic = "force-dynamic";

/**
 * GET /auth/callback
 * Handles OAuth callback from Supabase / GitHub.
 * Verifies the GitHub access token against GitHub API, persists encrypted account,
 * triggers initial ingestion, and redirects safely.
 */
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
    console.warn(`[GITHUB_OAUTH] Provider error: ${error} - ${errorDescription}`);
    const errorCode = error === "access_denied" ? "access_denied" : "OAUTH_PROVIDER_ERROR";
    const descParam = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(
      `${origin}/github-connect?error=${errorCode}&error_description=${descParam}`
    );
  }

  // 2. Early database schema health check
  try {
    const schemaHealth = await verifyDatabaseSchema();
    if (!schemaHealth.healthy) {
      console.error("[GITHUB_OAUTH] Database schema verification failed:", schemaHealth.missingTables || schemaHealth.error);
      return NextResponse.redirect(
        `${origin}/github-connect?error=DATABASE_SCHEMA_MISMATCH&error_description=Database+schema+requires+synchronization`
      );
    }
  } catch (schemaErr: any) {
    console.error("[GITHUB_OAUTH] Database schema check threw:", schemaErr?.message);
    return NextResponse.redirect(
      `${origin}/github-connect?error=DATABASE_SCHEMA_MISMATCH&error_description=Database+schema+verification+error`
    );
  }

  // 3. Exchange authorization code for Supabase session
  if (code) {
    try {
      console.log("[GITHUB_OAUTH] Exchanging authorization code for session...");
      const supabase = createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.user) {
        console.error("[GITHUB_OAUTH] Code exchange failed:", exchangeError?.message);
        const desc = encodeURIComponent(exchangeError?.message || "OAuth code exchange failed");
        return NextResponse.redirect(
          `${origin}/github-connect?error=OAUTH_CODE_EXCHANGE_FAILED&error_description=${desc}`
        );
      }

      console.log(`[GITHUB_OAUTH] Session established for Supabase user ${data.user.id}`);
      const profile = await ensureUserProfile(data.user);
      if (!profile) {
        console.error("[GITHUB_OAUTH] Could not resolve UserProfile for user:", data.user.id);
        return NextResponse.redirect(
          `${origin}/github-connect?error=SUPABASE_SESSION_MISSING&error_description=Could+not+resolve+authenticated+user+profile`
        );
      }

      const providerToken = data.session?.provider_token;

      // 4. Verify the token directly with GitHub API before persisting
      if (providerToken) {
        console.log("[GITHUB_OAUTH] Verifying provider_token with GitHub API GET /user...");
        const verification = await verifyGitHubAccessToken(providerToken);

        if (verification.valid && verification.user) {
          console.log(`[GITHUB_OAUTH] Verified GitHub identity @${verification.user.login} (ID: ${verification.user.id})`);

          // Safe ownership check: prevent taking over an account bound to another user
          const existingAccount = await prisma.gitHubAccount.findUnique({
            where: { githubId: verification.user.id },
          });

          if (existingAccount && existingAccount.userId !== profile.id) {
            console.warn(`[GITHUB_OAUTH] GitHub ID ${verification.user.id} is already linked to user profile ${existingAccount.userId}`);
            return NextResponse.redirect(
              `${origin}/github-connect?error=GITHUB_ACCOUNT_ALREADY_LINKED&error_description=This+GitHub+account+is+already+linked+to+another+Gitrium+user.`
            );
          }

          const encryptedToken = encryptToken(providerToken);

          // Atomic transaction: upsert account, update user profile, and record pending SyncRun
          await prisma.$transaction(async (tx) => {
            await tx.gitHubAccount.upsert({
              where: { userId: profile.id },
              update: {
                githubId: verification.user!.id,
                username: verification.user!.login,
                profileUrl: `https://github.com/${verification.user!.login}`,
                avatarUrl: verification.user!.avatarUrl || null,
                accessToken: encryptedToken,
                connectionStatus: "connected",
                updatedAt: new Date(),
              },
              create: {
                userId: profile.id,
                githubId: verification.user!.id,
                username: verification.user!.login,
                profileUrl: `https://github.com/${verification.user!.login}`,
                avatarUrl: verification.user!.avatarUrl || null,
                accessToken: encryptedToken,
                connectionStatus: "connected",
              },
            });

            await tx.userProfile.update({
              where: { id: profile.id },
              data: {
                githubConnected: true,
                githubUsername: verification.user!.login,
                avatarUrl: verification.user!.avatarUrl || profile.avatarUrl,
                updatedAt: new Date(),
              },
            });

            await tx.syncRun.create({
              data: {
                userId: profile.id,
                status: "PENDING",
              },
            });
          });

          invalidateUserProfileCache(profile.id);

          // 5. Automatically trigger repository ingestion asynchronously (non-blocking)
          syncUserGitHubData(profile.id, providerToken).catch((syncErr: any) => {
            console.warn("[GITHUB_SYNC] Background ingestion notification:", syncErr?.message);
          });

          console.log(`[GITHUB_OAUTH] Successfully connected @${verification.user.login}. Redirecting to ${next}`);
          return NextResponse.redirect(`${origin}${next}`);
        } else {
          console.error(`[GITHUB_OAUTH] Token verification failed: ${verification.error} - ${verification.errorMessage}`);
          const errCategory =
            verification.error === "RATE_LIMITED"
              ? "GITHUB_RATE_LIMITED"
              : verification.error === "EXPIRED"
              ? "GITHUB_TOKEN_EXPIRED"
              : "GITHUB_TOKEN_INVALID";
          const desc = encodeURIComponent(verification.errorMessage || "Token validation failed");
          return NextResponse.redirect(
            `${origin}/github-connect?error=${errCategory}&error_description=${desc}`
          );
        }
      } else {
        // Provider token was not attached in this session exchange.
        // Check if an existing connected valid account exists for this profile
        const existingAccount = await prisma.gitHubAccount.findUnique({
          where: { userId: profile.id },
        });

        if (existingAccount?.accessToken && existingAccount.connectionStatus === "connected") {
          console.log("[GITHUB_OAUTH] Existing active connected GitHub account confirmed. Redirecting.");
          return NextResponse.redirect(`${origin}${next}`);
        }

        console.warn("[GITHUB_OAUTH] No provider_token received from Supabase OAuth exchange.");
        return NextResponse.redirect(
          `${origin}/github-connect?error=GITHUB_TOKEN_MISSING&error_description=No+GitHub+access+token+returned+by+OAuth+session.+Please+re-authorize+with+repo+and+user+permissions.`
        );
      }
    } catch (err: any) {
      console.error("[GITHUB_OAUTH] Unexpected error during callback processing:", err);
      const desc = encodeURIComponent(err?.message || "Unexpected error during authorization callback");
      return NextResponse.redirect(
        `${origin}/github-connect?error=OAUTH_CALLBACK_ERROR&error_description=${desc}`
      );
    }
  }

  // 6. Fallback for returning sessions without code
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await ensureUserProfile(user);
      if (profile) {
        const ghAcc = await prisma.gitHubAccount.findUnique({
          where: { userId: profile.id },
        });
        if (ghAcc?.connectionStatus === "connected" && ghAcc.accessToken) {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
    }

    return NextResponse.redirect(`${origin}/github-connect`);
  } catch (err) {
    console.error("[GITHUB_OAUTH] General callback fallback error:", err);
    return NextResponse.redirect(`${origin}/github-connect`);
  }
}
