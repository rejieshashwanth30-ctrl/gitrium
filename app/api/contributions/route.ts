import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/contributions
 * Returns real contribution metrics, 365-day calendar heatmap data,
 * and repository distribution derived strictly from stored Commit and PullRequest records.
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

    // Fetch user's selected repositories with their commits
    const repositories = await prisma.repository.findMany({
      where: {
        userId: profile.id,
        isSelected: true,
      },
      include: {
        commits: {
          select: {
            authorDate: true,
          },
        },
        pullRequests: {
          select: {
            id: true,
          },
        },
      },
    });

    // Aggregate commits by date string (YYYY-MM-DD)
    const commitDateMap: Record<string, number> = {};
    let totalCommits = 0;
    let totalPRs = 0;

    for (const repo of repositories) {
      totalCommits += repo.commits.length;
      totalPRs += repo.pullRequests.length;

      for (const commit of repo.commits) {
        const dateKey = new Date(commit.authorDate).toISOString().slice(0, 10);
        commitDateMap[dateKey] = (commitDateMap[dateKey] || 0) + 1;
      }
    }

    // Build 52-week (364 days) calendar dataset
    const today = new Date();
    const heatmapDays: Array<{ date: string; count: number; level: number }> = [];

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = commitDateMap[dateStr] || 0;

      // Map count to color intensity level (0 to 4)
      let level = 0;
      if (count >= 6) level = 4;
      else if (count >= 4) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      heatmapDays.push({
        date: dateStr,
        count,
        level,
      });
    }

    // Calculate current active streak
    let streak = 0;
    for (let i = heatmapDays.length - 1; i >= 0; i--) {
      if (heatmapDays[i].count > 0) {
        streak++;
      } else if (i === heatmapDays.length - 1) {
        // Today might not have commits yet, check yesterday
        continue;
      } else {
        break;
      }
    }

    // Repository distribution breakdown
    const distribution = repositories.map((r) => {
      const commits = r.commits.length;
      const percentage = totalCommits > 0 ? Math.round((commits / totalCommits) * 100) : 0;
      return {
        id: r.id,
        name: r.name,
        fullName: r.fullName,
        primaryLanguage: r.primaryLanguage,
        commitCount: commits,
        prCount: r.pullRequests.length,
        percentage,
      };
    }).sort((a, b) => b.commitCount - a.commitCount);

    return NextResponse.json({
      totalCommits,
      totalPRs,
      totalContributions: totalCommits + totalPRs,
      currentStreak: streak,
      heatmapDays,
      distribution,
      repositoriesCount: repositories.length,
    });
  } catch (error) {
    console.error("Contributions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contribution metrics" },
      { status: 500 }
    );
  }
}

