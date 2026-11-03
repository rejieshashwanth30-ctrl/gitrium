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
        id: true,
        name: true,
        description: true,
        commitCount: true,
        prCount: true,
        technologies: { select: { name: true, category: true } },
      },
    });

    const repositoriesCount = repositories.length;
    let totalCommits = 0;
    let totalPRs = 0;
    let hasTesting = false;
    let hasDocumentation = repositories.length > 0;

    for (const repo of repositories) {
      totalCommits += repo.commitCount || 0;
      totalPRs += repo.prCount || 0;
      if (repo.description && repo.description.trim().length > 10) {
        hasDocumentation = true;
      }
      if (
        repo.technologies.some(
          (t) =>
            t.category === "Testing" ||
            ["jest", "vitest", "mocha", "pytest", "test", "cypress", "playwright"].includes(t.name.toLowerCase())
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
      hasDocumentation,
    });

    const overallScore =
      signals.length > 0
        ? Math.round(signals.reduce((sum, s) => sum + s.score, 0) / signals.length)
        : 0;

    const evidenceStrength =
      overallScore >= 80 ? "Strong Evidence" : overallScore >= 50 ? "Moderate Evidence" : "Limited Evidence";

    const evidenceDescription =
      overallScore >= 80
        ? "Most available signals support this assessment."
        : overallScore >= 50
        ? "Some supporting evidence is available, but coverage is incomplete."
        : "Gitrium has limited evidence available for this area.";

    const verifiedSignalsCount = signals.filter((s) => s.score >= 70).length;
    const activeProjectsCount = repositories.filter((r) => (r.commitCount || 0) > 0).length || repositoriesCount;

    return NextResponse.json({
      overallScore,
      evidenceStrength,
      evidenceDescription,
      signals,
      repositoriesCount,
      totalCommits,
      totalPRs,
      verifiedSignalsCount,
      activeProjectsCount,
    });
  } catch (error) {
    console.error("Integrity API error:", error);
    return NextResponse.json(
      { error: "Failed to compute integrity signals" },
      { status: 500 }
    );
  }
}

