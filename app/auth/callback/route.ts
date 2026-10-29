import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { encryptToken } from "@/lib/security/encryption";
import { syncNeonGitHubAccount } from "@/lib/auth/neonAuthClient";

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
    console.warn("OAuth authorization failed or cancelled:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/github-connect?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // 2. Handle Supabase exchange if code is present
  if (code) {
    try {
      const supabase = createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data.user) {
        const profile = await ensureUserProfile(data.user);

        // If GitHub OAuth provider token is returned in the session, link GitHub account securely
        const providerToken = data.session?.provider_token;
        const ghUsername =
          data.user.user_metadata?.user_name ||
          data.user.user_metadata?.preferred_username ||
          null;
        const ghId = data.user.user_metadata?.provider_id || data.user.id;

        if (profile && (providerToken || ghUsername)) {
          try {
            const encryptedToken = providerToken ? encryptToken(providerToken) : null;

            await prisma.userProfile.update({
              where: { id: profile.id },
              data: {
                githubConnected: true,
                githubUsername: ghUsername || profile.githubUsername,
                avatarUrl: data.user.user_metadata?.avatar_url || profile.avatarUrl,
              },
            });

            if (ghUsername) {
              await prisma.gitHubAccount.upsert({
                where: { userId: profile.id },
                update: {
                  githubId: String(ghId),
                  username: ghUsername,
                  profileUrl: `https://github.com/${ghUsername}`,
                  avatarUrl: data.user.user_metadata?.avatar_url || null,
                  accessToken: encryptedToken,
                  connectionStatus: "connected",
                  updatedAt: new Date(),
                },
                create: {
                  userId: profile.id,
                  githubId: String(ghId),
                  username: ghUsername,
                  profileUrl: `https://github.com/${ghUsername}`,
                  avatarUrl: data.user.user_metadata?.avatar_url || null,
                  accessToken: encryptedToken,
                  connectionStatus: "connected",
                },
              });
            }
          } catch (dbErr) {
            console.warn("GitHubAccount link error:", dbErr);
          }
        }

        // Also check if Neon Auth has GitHub tokens for this user
        if (profile) {
          await syncNeonGitHubAccount(profile.id, profile.email);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.warn("Supabase code exchange skipped or failed:", err);
    }
  }

  // 3. Handle Neon Auth return (where Neon Auth completed OAuth on its callback and redirected here)
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let targetProfile = null;

    if (user) {
      targetProfile = await ensureUserProfile(user);
    } else {
      // Find the most recently active profile
      targetProfile = await prisma.userProfile.findFirst({
        orderBy: { updatedAt: "desc" },
      });
    }

    if (targetProfile) {
      // Synchronize GitHub details from neon_auth.account into Gitrium
      await syncNeonGitHubAccount(targetProfile.id, targetProfile.email);
    }

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("Callback completion error:", err);
    return NextResponse.redirect(`${origin}${next}`);
  }
}
