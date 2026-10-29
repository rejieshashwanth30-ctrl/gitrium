import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { computeUserSkills } from "@/lib/analysis/skillAnalysis";

export const dynamic = "force-dynamic";

/**
 * GET /api/repositories/select
 * Returns the IDs of repositories currently selected for analysis.
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

    const selectedRepos = await prisma.repository.findMany({
      where: {
        userId: profile.id,
        isSelected: true,
      },
      select: { id: true, name: true, fullName: true },
    });

    return NextResponse.json({
      selectedIds: selectedRepos.map((r) => r.id),
      selectedCount: selectedRepos.length,
      repositories: selectedRepos,
    });
  } catch (error) {
    console.error("Repository selection GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository selection" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/repositories/select
 * Updates the repository selection scope for the authenticated user and
 * recomputes deterministic intelligence scoped strictly to the selected repositories.
 */
export async function POST(request: Request) {
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

    const body = await request.json();
    const { repositoryIds } = body;

    if (!Array.isArray(repositoryIds)) {
      return NextResponse.json(
        { error: "repositoryIds must be an array of strings" },
        { status: 400 }
      );
    }

    // 1. Mark unselected repositories as isSelected = false
    await prisma.repository.updateMany({
      where: {
        userId: profile.id,
        id: { notIn: repositoryIds },
      },
      data: { isSelected: false },
    });

    // 2. Mark selected repositories as isSelected = true (IDOR safe: strictly scoped to userId)
    await prisma.repository.updateMany({
      where: {
        userId: profile.id,
        id: { in: repositoryIds },
      },
      data: { isSelected: true },
    });

    // 3. Recompute deterministic skills and findings scoped strictly to selected repositories
    const updatedSkills = await computeUserSkills(profile.id, repositoryIds);

    return NextResponse.json({
      success: true,
      selectedCount: repositoryIds.length,
      updatedSkillsCount: updatedSkills.length,
      repositoryIds,
    });
  } catch (error) {
    console.error("Repository selection POST error:", error);
    return NextResponse.json(
      { error: "Failed to update repository selection" },
      { status: 500 }
    );
  }
}

