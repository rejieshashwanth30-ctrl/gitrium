import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/summary
 * Ultra-fast single-roundtrip aggregation endpoint for dashboard metrics and top items.
 * Avoids loading full commit DAGs or deep object trees on initial dashboard render.
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
      recentRepositories,
      topSkills,
      allSkillsCount,
      uniqueTechs,
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

      // 3. Top 5 recent repositories for display
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

      // 4. Top 4 skills for display
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

      // 5. Total skills count
      prisma.skill.count({
        where: { userId: profile.id },
      }),

      // 6. Distinct technologies count
      prisma.repositoryTechnology.findMany({
        where: { repository: { userId: profile.id } },
        select: { name: true },
        distinct: ["name"],
      }),
    ]);

    // Aggregate metrics
    const totalCommits = selectedRepos.reduce(
      (sum: number, r: { commitCount: number }) => sum + (r.commitCount || 0),
      0
    );
    const totalPRs = selectedRepos.reduce(
      (sum: number, r: { prCount: number }) => sum + (r.prCount || 0),
      0
    );
    const totalContributions = totalCommits + totalPRs;
    const technologiesCount = uniqueTechs.length;
    const evidenceSignalsCount =
      totalContributions > 0 ? totalContributions + allSkillsCount * 5 : 0;

    return NextResponse.json({
      developerName: profile.displayName || profile.username || "Developer",
      githubConnected: profile.githubConnected,
      githubUsername: profile.githubUsername || profile.username,
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
