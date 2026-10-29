import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { syncUserGitHubData } from "@/lib/ingestion/githubIngestion";
import { computeUserSkills } from "@/lib/analysis/skillAnalysis";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(user);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // In a real OAuth flow with Supabase, the provider_token is available in the session
    const { data: sessionData } = await supabase.auth.getSession();
    const providerToken = sessionData.session?.provider_token;

    // Trigger GitHub synchronization
    const syncResult = await syncUserGitHubData(profile.id, providerToken || undefined);

    if (syncResult.status === "RATE_LIMITED") {
      return NextResponse.json(
        {
          error: "GitHub API rate limit reached. Please try again later.",
          syncResult,
        },
        { status: 429 }
      );
    }

    // Recompute skills based on newly ingested code evidence
    let updatedSkillsCount = 0;
    try {
      const updatedSkills = await computeUserSkills(profile.id);
      updatedSkillsCount = updatedSkills.length;
    } catch {
      // Database pending or no repos ingested
    }

    return NextResponse.json({
      success: syncResult.status !== "FAILED",
      syncResult,
      updatedSkillsCount,
      message:
        syncResult.status === "FAILED"
          ? "Sync failed to reach GitHub. Please check network or access token."
          : `Synchronized ${syncResult.repositoriesCount} repositories and ${syncResult.commitsCount} commits.`,
    });
  } catch (error) {
    console.error("GitHub sync API error:", error);
    return NextResponse.json(
      { error: "Failed to synchronize GitHub data" },
      { status: 500 }
    );
  }
}
