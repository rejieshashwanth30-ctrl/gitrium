import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase() || "";
    const language = searchParams.get("language");

    try {
      const repositories = await prisma.repository.findMany({
        where: {
          userId: profile.id,
          ...(query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { description: { contains: query, mode: "insensitive" } },
                  { primaryLanguage: { contains: query, mode: "insensitive" } },
                ],
              }
            : {}),
          ...(language && language !== "All"
            ? { primaryLanguage: { equals: language, mode: "insensitive" } }
            : {}),
        },
        select: {
          id: true,
          userId: true,
          name: true,
          fullName: true,
          description: true,
          isPrivate: true,
          isFork: true,
          primaryLanguage: true,
          stars: true,
          forks: true,
          watchers: true,
          openIssues: true,
          commitCount: true,
          prCount: true,
          linesOfCode: true,
          complexity: true,
          evidenceStrength: true,
          architectureType: true,
          testCoverageEstimate: true,
          documentationScore: true,
          analysisStatus: true,
          isSelected: true,
          createdAt: true,
          updatedAt: true,
          technologies: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json({ repositories });
    } catch (dbErr) {
      console.warn("Database repositories query fallback:", dbErr);
      return NextResponse.json({ repositories: [], isPending: true });
    }
  } catch (error) {
    console.error("Repositories API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
