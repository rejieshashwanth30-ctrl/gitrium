import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
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

    try {
      let skills = await prisma.skill.findMany({
        where: { userId: profile.id },
        select: {
          id: true,
          userId: true,
          name: true,
          category: true,
          proficiencyScore: true,
          evidenceStrength: true,
          evidenceCount: true,
          projectCount: true,
          verifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { proficiencyScore: "desc" },
      });

      // If skills haven't been computed yet, attempt computation
      if (skills.length === 0) {
        await computeUserSkills(profile.id);
        skills = await prisma.skill.findMany({
          where: { userId: profile.id },
          select: {
            id: true,
            userId: true,
            name: true,
            category: true,
            proficiencyScore: true,
            evidenceStrength: true,
            evidenceCount: true,
            projectCount: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { proficiencyScore: "desc" },
        });
      }

      return NextResponse.json({ skills });
    } catch (dbErr) {
      console.warn("Database skills query fallback:", dbErr);
      return NextResponse.json({ skills: [], isPending: true });
    }
  } catch (error) {
    console.error("Skills API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
