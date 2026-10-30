import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      const repoIdentifier = decodeURIComponent(params.id);
      const repository = await prisma.repository.findFirst({
        where: {
          userId: profile.id, // Strict IDOR ownership check
          OR: [
            { id: repoIdentifier },
            { name: { equals: repoIdentifier, mode: "insensitive" } },
            { fullName: { equals: repoIdentifier, mode: "insensitive" } },
            { name: { contains: repoIdentifier, mode: "insensitive" } },
            { githubRepoId: repoIdentifier },
          ],
        },
        include: {
          technologies: true,
          languages: true,
          commits: { take: 100, orderBy: { authorDate: "desc" } },
          pullRequests: { take: 50, orderBy: { createdAt: "desc" } },
          projectAnalysis: true,
        },
      });

      if (!repository) {
        return NextResponse.json({ error: "Repository not found" }, { status: 404 });
      }

      return NextResponse.json({
        repository,
        indexedCommitCount: repository.commitCount,
        indexedPRCount: repository.prCount,
        recentCommitsCount: repository.commits.length,
        recentPRsCount: repository.pullRequests.length,
      });
    } catch (dbErr) {
      console.warn("Database repository lookup error:", dbErr);
      return NextResponse.json({ error: "Repository not found in current index" }, { status: 404 });
    }
  } catch (error) {
    console.error("Repository detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository details" },
      { status: 500 }
    );
  }
}
