import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { generateUserEvidenceGraph } from "@/lib/analysis/evidenceGraph";

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
      const graph = await generateUserEvidenceGraph(profile.id);
      return NextResponse.json({ graph });
    } catch (dbErr) {
      console.warn("Evidence graph DB query fallback:", dbErr);
      return NextResponse.json({
        graph: {
          nodes: [
            {
              id: `node-dev-${profile.id}`,
              type: "developer",
              label: profile.displayName,
              subLabel: `@${profile.githubUsername || profile.username}`,
              metric: "0 Repos Audited",
              group: "root",
              status: "verified",
            },
          ],
          edges: [],
        },
        isPending: true,
      });
    }
  } catch (error) {
    console.error("Evidence Graph API error:", error);
    return NextResponse.json(
      { error: "Failed to generate evidence graph" },
      { status: 500 }
    );
  }
}
