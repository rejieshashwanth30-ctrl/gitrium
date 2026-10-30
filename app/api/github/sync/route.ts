import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { syncUserGitHubData } from "@/lib/ingestion/githubIngestion";
import { computeUserSkills } from "@/lib/analysis/skillAnalysis";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const { prisma } = await import("@/lib/db/prisma");
    const latestRun = await prisma.syncRun.findFirst({
      where: { userId: profile.id },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      syncRun: latestRun || null,
      status: latestRun?.status || "IDLE",
    });
  } catch (error: any) {
    console.error("[GitHub Sync API] GET status error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to query sync run status" },
      { status: 500 }
    );
  }
}

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

    // Attempt to extract provider_token from session if available
    const { data: sessionData } = await supabase.auth.getSession();
    const providerToken = sessionData.session?.provider_token;

    // Trigger GitHub synchronization with concurrency lock
    console.log(`[GitHub Sync API] Starting sync for profile ${profile.id} (${profile.email})...`);
    const syncResult = await syncUserGitHubData(profile.id, providerToken || undefined);

    if (syncResult.status === "RATE_LIMITED") {
      return NextResponse.json(
        {
          success: false,
          status: "RATE_LIMITED",
          error: "GitHub API rate limit reached. Please try again later.",
          syncResult,
        },
        { status: 429 }
      );
    }

    if (syncResult.status === "FAILED") {
      const errorMessage = syncResult.errors?.[0] || "Failed to synchronize GitHub repositories.";
      const isTokenExpired = errorMessage.toLowerCase().includes("token") || errorMessage.toLowerCase().includes("reconnect");
      return NextResponse.json(
        {
          success: false,
          status: isTokenExpired ? "TOKEN_EXPIRED" : "FAILED",
          error: errorMessage,
          syncResult,
        },
        { status: isTokenExpired ? 401 : 400 }
      );
    }

    // Recompute skills based on newly ingested real code evidence
    let updatedSkillsCount = 0;
    try {
      const updatedSkills = await computeUserSkills(profile.id);
      updatedSkillsCount = updatedSkills.length;
    } catch (skillsErr: any) {
      console.warn("[GitHub Sync API] Skill recomputation pending:", skillsErr?.message);
    }

    return NextResponse.json({
      success: true,
      status: syncResult.status,
      repositoriesCount: syncResult.repositoriesCount,
      commitsCount: syncResult.commitsCount,
      pullRequestsCount: syncResult.pullRequestsCount,
      technologiesCount: syncResult.technologiesCount,
      updatedSkillsCount,
      message: `Synchronized ${syncResult.repositoriesCount} repositories, ${syncResult.commitsCount} commits, and ${syncResult.pullRequestsCount} pull requests.`,
      syncResult,
    });
  } catch (error: any) {
    console.error("[GitHub Sync API] Internal sync error:", error?.message || error);
    return NextResponse.json(
      { success: false, status: "FAILED", error: "Internal error during GitHub synchronization." },
      { status: 500 }
    );
  }
}
