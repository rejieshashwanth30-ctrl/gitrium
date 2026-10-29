import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { computeCareerRoleMatches } from "@/lib/analysis/careerAnalysis";

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
      const skills = await prisma.skill.findMany({
        where: { userId: profile.id },
        select: { name: true },
      });

      const matches = computeCareerRoleMatches(skills.map((s) => s.name));
      return NextResponse.json({ matches });
    } catch (dbErr) {
      console.warn("Database career query fallback:", dbErr);
      const defaultMatches = computeCareerRoleMatches([]);
      return NextResponse.json({ matches: defaultMatches, isPending: true });
    }
  } catch (error) {
    console.error("Career API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch career analysis" },
      { status: 500 }
    );
  }
}
