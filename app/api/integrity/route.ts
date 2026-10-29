import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { computeIntegritySignals } from "@/lib/analysis/integrityAnalysis";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrity
 * Computes deterministic integrity score and detailed signal dimensions
 * strictly based on real repositories, commits, and PRs in the user's active scope.
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

    const repositories = await prisma.repository.findMany({
      where: {
        userId: profile.id,
        isSelected: true,
      },
      select: {
        commitCount: true,
        prCount: true,
        technologies: { select: { name: true, category: true } },
      },
    });

    const repositoriesCount = repositories.length;
    let totalCommits = 0;
    let totalPRs = 0;
    let hasTesting = false;

    for (const repo of repositories) {
      totalCommits += repo.commitCount || 0;
      totalPRs += repo.prCount || 0;
      if (
        repo.technologies.some(
          (t) =>
            t.category === "Testing" ||
            ["jest", "vitest", "mocha", "pytest", "test"].includes(t.name.toLowerCase())
        )
      ) {
        hasTesting = true;
      }
    }

    const signals = computeIntegritySignals({
      repositoriesCount,
      totalCommits,
      totalPRs,
      hasTestingEvidence: hasTesting,
    });

    const overallScore =
      signals.length > 0
        ? Math.round(signals.reduce((sum, s) => sum + s.score, 0) / signals.length)
        : 0;

    return NextResponse.json({
      overallScore,
      signals,
      repositoriesCount,
      totalCommits,
      totalPRs,
    });
  } catch (error) {
    console.error("Integrity API error:", error);
    return NextResponse.json(
      { error: "Failed to compute integrity signals" },
      { status: 500 }
    );
  }
}

