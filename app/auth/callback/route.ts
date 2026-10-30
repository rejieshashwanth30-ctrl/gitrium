import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile, invalidateUserProfileCache } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/encryption";
import { verifyGitHubAccessToken } from "@/lib/github/verifyToken";

export const dynamic = "force-dynamic";

/**
 * GET /auth/callback
 * Handles OAuth callback from Supabase / GitHub.
 * Verifies the GitHub access token against GitHub API, persists encrypted account,
 * registers initial SyncRun (PENDING), and redirects safely.
 */
export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Safe redirect path validation (protect against open redirects)
  const rawNext = searchParams.get("next") ?? "/select-repositories";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/select-repositories";

  // 1. Handle cancelled authorization or OAuth error from provider
  if (error) {
    console.warn(`[GITHUB_OAUTH] [${requestId}] Provider error: ${error} - ${errorDescription}`);
    const errorCode = error === "access_denied" ? "access_denied" : "OAUTH_PROVIDER_ERROR";
    const descParam = encodeURIComponent(errorDescription || error);
    return NextResponse.redirect(
      `${origin}/github-connect?error=${errorCode}&error_description=${descParam}&request_id=${requestId}`
    );
  }

  // 2. Exchange authorization code for Supabase session
  if (code) {
    try {
      console.log(`[GITHUB_OAUTH] [${requestId}] Exchanging authorization code for session...`);
      const supabase = createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError || !data.user) {
        console.error(`[GITHUB_OAUTH] [${requestId}] Code exchange failed:`, exchangeError?.message);
        const desc = encodeURIComponent(exchangeError?.message || "OAuth code exchange failed");
        return NextResponse.redirect(
          `${origin}/github-connect?error=OAUTH_CODE_EXCHANGE_FAILED&error_description=${desc}&request_id=${requestId}`
        );
      }

      console.log(`[GITHUB_OAUTH] [${requestId}] Session established for Supabase user ${data.user.id}`);
      const profile = await ensureUserProfile(data.user);
      if (!profile) {
        console.error(`[GITHUB_OAUTH] [${requestId}] Could not resolve UserProfile for user:`, data.user.id);
        return NextResponse.redirect(
          `${origin}/github-connect?error=SUPABASE_SESSION_MISSING&error_description=Could+not+resolve+authenticated+user+profile&request_id=${requestId}`
        );
      }

      const providerToken = data.session?.provider_token;

      // 3. Verify the token directly with GitHub API before persisting
      if (providerToken) {
        console.log(`[GITHUB_OAUTH] [${requestId}] Verifying provider_token with GitHub API GET /user...`);
        const verification = await verifyGitHubAccessToken(providerToken);

        if (verification.valid && verification.user) {
          console.log(`[GITHUB_OAUTH] [${requestId}] Verified GitHub identity @${verification.user.login} (ID: ${verification.user.id})`);

          // Safe ownership check: prevent taking over an account bound to another user
          const existingAccount = await prisma.gitHubAccount.findUnique({
            where: { githubId: verification.user.id },
          });

          if (existingAccount && existingAccount.userId !== profile.id) {
            console.warn(`[GITHUB_OAUTH] [${requestId}] GitHub ID ${verification.user.id} is already linked to user profile ${existingAccount.userId}`);
            return NextResponse.redirect(
              `${origin}/github-connect?error=GITHUB_ACCOUNT_ALREADY_LINKED&error_description=This+GitHub+account+is+already+linked+to+another+Gitrium+user.&request_id=${requestId}`
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

          console.log(`[GITHUB_OAUTH] [${requestId}] Successfully connected @${verification.user.login}. Redirecting to ${next}`);
          return NextResponse.redirect(`${origin}${next}`);
        } else {
          console.error(`[GITHUB_OAUTH] [${requestId}] Token verification failed: ${verification.error} - ${verification.errorMessage}`);
          const errCategory =
            verification.error === "RATE_LIMITED"
              ? "GITHUB_RATE_LIMITED"
              : verification.error === "EXPIRED"
              ? "GITHUB_TOKEN_EXPIRED"
              : "GITHUB_TOKEN_INVALID";
          const desc = encodeURIComponent(verification.errorMessage || "Token validation failed");
          return NextResponse.redirect(
            `${origin}/github-connect?error=${errCategory}&error_description=${desc}&request_id=${requestId}`
          );
        }
      } else {
        // Provider token was not attached in this session exchange.
        // Check if an existing connected valid account exists for this profile
        const existingAccount = await prisma.gitHubAccount.findUnique({
          where: { userId: profile.id },
        });

        if (existingAccount?.accessToken && existingAccount.connectionStatus === "connected") {
          console.log(`[GITHUB_OAUTH] [${requestId}] Existing active connected GitHub account confirmed. Redirecting.`);
          return NextResponse.redirect(`${origin}${next}`);
        }

        console.warn(`[GITHUB_OAUTH] [${requestId}] No provider_token received from Supabase OAuth exchange.`);
        return NextResponse.redirect(
          `${origin}/github-connect?error=GITHUB_TOKEN_MISSING&error_description=No+GitHub+access+token+returned+by+OAuth+session.+Please+re-authorize+with+repo+and+user+permissions.&request_id=${requestId}`
        );
      }
    } catch (err: any) {
      console.error(`[GITHUB_OAUTH] [${requestId}] Unexpected error during callback processing:`, {
        code: err?.code,
        message: err?.message,
      });

      let errCategory = "OAUTH_CALLBACK_ERROR";
      if (err?.code === "P2021") errCategory = "DATABASE_SCHEMA_MISSING";
      else if (err?.code === "P1001") errCategory = "DATABASE_UNREACHABLE";
      else if (err?.code === "P1008") errCategory = "DATABASE_TIMEOUT";
      else if (err?.code === "P1000") errCategory = "DATABASE_AUTH_FAILED";

      const desc = encodeURIComponent(err?.message || "Unexpected error during authorization callback");
      return NextResponse.redirect(
        `${origin}/github-connect?error=${errCategory}&error_description=${desc}&request_id=${requestId}`
      );
    }
  }

  // 4. Fallback for returning sessions without code
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
    console.error(`[GITHUB_OAUTH] [${requestId}] General callback fallback error:`, err);
    return NextResponse.redirect(`${origin}/github-connect`);
  }
}
