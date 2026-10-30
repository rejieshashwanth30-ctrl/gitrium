import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/summary
 * Ultra-fast single-roundtrip aggregation endpoint for dashboard metrics and top items.
 * Validates real GitHub account connection status from database.
 */
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

    // Parallelize all summary queries in a single database round-trip
    const [
      allReposCount,
      selectedRepos,
      allReposAggregate,
      recentRepositories,
      topSkills,
      allSkillsCount,
      uniqueTechs,
      languagesCount,
      repoTechnologiesCount,
      ghAccount,
    ] = await Promise.all([
      // 1. Total repository count
      prisma.repository.count({
        where: { userId: profile.id },
      }),

      // 2. Selected repositories commit and PR counts for telemetry
      prisma.repository.findMany({
        where: { userId: profile.id, isSelected: true },
        select: {
          id: true,
          commitCount: true,
          prCount: true,
        },
      }),

      // 3. Aggregate of all repositories for baseline comparison
      prisma.repository.aggregate({
        where: { userId: profile.id },
        _sum: {
          commitCount: true,
          prCount: true,
        },
      }),

      // 4. Top 5 recent repositories for display
      prisma.repository.findMany({
        where: { userId: profile.id },
        select: {
          id: true,
          name: true,
          fullName: true,
          description: true,
          primaryLanguage: true,
          commitCount: true,
          prCount: true,
          stars: true,
          isPrivate: true,
          isSelected: true,
          evidenceStrength: true,
          technologies: {
            select: { id: true, name: true, category: true },
          },
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      }),

      // 5. Top 4 skills for display
      prisma.skill.findMany({
        where: { userId: profile.id },
        select: {
          id: true,
          name: true,
          category: true,
          proficiencyScore: true,
          evidenceStrength: true,
          evidenceCount: true,
          projectCount: true,
        },
        take: 4,
        orderBy: { proficiencyScore: "desc" },
      }),

      // 6. Total skills count
      prisma.skill.count({
        where: { userId: profile.id },
      }),

      // 7. Distinct technologies count
      prisma.repositoryTechnology.findMany({
        where: { repository: { userId: profile.id } },
        select: { name: true },
        distinct: ["name"],
      }),

      // 8. Total language breakdown count across selected repositories
      prisma.repositoryLanguage.count({
        where: { repository: { userId: profile.id, isSelected: true } },
      }),

      // 9. Total technology AST detections across selected repositories
      prisma.repositoryTechnology.count({
        where: { repository: { userId: profile.id, isSelected: true } },
      }),

      // 10. Real GitHub account connection verification
      prisma.gitHubAccount.findUnique({
        where: { userId: profile.id },
        select: {
          username: true,
          connectionStatus: true,
          accessToken: true,
        },
      }),
    ]);

    // Canonical metric calculations strictly derived from Neon database records
    const allCommits = allReposAggregate._sum.commitCount || 0;
    const allPRs = allReposAggregate._sum.prCount || 0;

    const selectedCommits = selectedRepos.reduce(
      (sum: number, r: { commitCount: number }) => sum + (r.commitCount || 0),
      0
    );
    const selectedPRs = selectedRepos.reduce(
      (sum: number, r: { prCount: number }) => sum + (r.prCount || 0),
      0
    );

    // If repositories exist but none explicitly selected, fallback gracefully to all repos
    const totalCommits = selectedRepos.length > 0 ? selectedCommits : allCommits;
    const totalPRs = selectedRepos.length > 0 ? selectedPRs : allPRs;
    const totalContributions = totalCommits + totalPRs;
    const technologiesCount = uniqueTechs.length;

    // Truthful evidence signals: sum of verified commits, PRs, language breakdowns, and AST tech detections
    const evidenceSignalsCount =
      totalContributions > 0
        ? totalCommits + totalPRs + languagesCount + repoTechnologiesCount
        : 0;

    const isConnected = Boolean(
      profile.githubConnected &&
      ghAccount &&
      ghAccount.connectionStatus === "connected" &&
      ghAccount.accessToken
    );

    return NextResponse.json({
      developerName: profile.displayName || profile.username || "Developer",
      githubConnected: isConnected,
      githubUsername: ghAccount?.username || profile.githubUsername || profile.username,
      connectionStatus: ghAccount?.connectionStatus || (isConnected ? "connected" : "disconnected"),
      repositoriesCount: allReposCount,
      totalCommits,
      totalPRs,
      totalContributions,
      technologiesCount,
      skillsCount: allSkillsCount,
      evidenceSignalsCount,
      recentRepositories,
      topSkills,
    });
  } catch (error) {
    console.error("Dashboard summary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
