import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import { generateAIInterpretation } from "@/lib/intelligence/aiLayer";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/reports/[id]
 * Returns report details. Supports looking up by Report.id OR by Repository.id / Repository.name.
 * IDOR Protected: User can only access their own reports and repositories.
 */
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

    const reportIdentifier = params.id;

    // 1. Try finding an existing Report by ID
    let report: any = await prisma.report.findFirst({
      where: {
        id: reportIdentifier,
        userId: profile.id, // Strict IDOR ownership check
      },
      include: {
        repository: {
          include: {
            languages: true,
            technologies: true,
            commits: { take: 25, orderBy: { authorDate: "desc" } },
          },
        },
      },
    });

    // 2. If not found by Report.id, check if reportIdentifier is a Repository.id or name
    if (!report) {
      const repoIdentifier = decodeURIComponent(reportIdentifier);
      const repo = await prisma.repository.findFirst({
        where: {
          userId: profile.id, // Strict IDOR ownership check
          OR: [
            { id: repoIdentifier },
            { name: { equals: repoIdentifier, mode: "insensitive" } },
            { fullName: { equals: repoIdentifier, mode: "insensitive" } },
            { name: { contains: repoIdentifier, mode: "insensitive" } },
          ],
        },
        include: {
          languages: true,
          technologies: true,
          commits: { take: 25, orderBy: { authorDate: "desc" } },
          pullRequests: { take: 10, orderBy: { createdAt: "desc" } },
        },
      });

      if (repo) {
        // Find existing report for this repo or synthesize a new scoped report
        report = await prisma.report.findFirst({
          where: {
            userId: profile.id,
            repositoryId: repo.id,
          },
          include: {
            repository: {
              include: {
                languages: true,
                technologies: true,
                commits: { take: 25, orderBy: { authorDate: "desc" } },
              },
            },
          },
        });

        if (!report) {
          const totalCommits = repo.commits.length;
          const languages = repo.languages.map((l) => l.name);

          const ai = await generateAIInterpretation({
            developerName: profile.displayName || profile.username,
            repositories: [
              {
                name: repo.name,
                language: repo.primaryLanguage,
                stars: repo.stars,
                commits: totalCommits,
              },
            ],
            skills: repo.technologies.map((t) => ({
              name: t.name,
              score: 85,
              strength: "Strong Evidence",
            })),
            integrityScore: 92,
            totalCommits,
          });

          const reportHash = crypto
            .createHash("sha256")
            .update(`${profile.id}-${repo.id}-${Date.now()}`)
            .digest("hex");

          report = await prisma.report.create({
            data: {
              userId: profile.id,
              repositoryId: repo.id,
              title: `Code Evidence Audit — ${repo.name}`,
              status: "verified",
              reportHash,
              summary: ai.engineeringSummary,
              fullData: {
                developerName: profile.displayName || profile.username,
                repositoryScope: [
                  {
                    id: repo.id,
                    name: repo.name,
                    fullName: repo.fullName,
                    primaryLanguage: repo.primaryLanguage,
                    commitCount: totalCommits,
                    languages: repo.languages,
                    technologies: repo.technologies,
                  },
                ],
                skills: repo.technologies.map((t) => ({
                  name: t.name,
                  category: t.category,
                  proficiencyScore: 85,
                  evidenceStrength: "Strong Evidence",
                })),
                ai: ai as any,
                totalCommits,
                generatedAt: new Date().toISOString(),
              } as any,
            },
            include: {
              repository: {
                include: {
                  languages: true,
                  technologies: true,
                  commits: { take: 25, orderBy: { authorDate: "desc" } },
                },
              },
            },
          });
        }
      }
    }

    // 3. Handle aggregate / multi-repository request
    if (!report && (reportIdentifier === "aggregate" || reportIdentifier === "all")) {
      report = await prisma.report.findFirst({
        where: {
          userId: profile.id,
          repositoryId: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!report) {
        const selectedRepos = await prisma.repository.findMany({
          where: { userId: profile.id, isSelected: true },
          include: {
            languages: true,
            technologies: true,
            commits: { take: 10, orderBy: { authorDate: "desc" } },
          },
        });

        if (selectedRepos.length > 0) {
          const totalCommits = selectedRepos.reduce(
            (sum, r) => sum + (r.commitCount || r.commits.length),
            0
          );
          const targetTechNames = new Set(
            selectedRepos.flatMap((r) => [
              (r.primaryLanguage || "").toLowerCase(),
              ...(r.languages || []).map((l: any) => l.name.toLowerCase()),
              ...(r.technologies || []).map((t: any) => t.name.toLowerCase()),
            ]).filter(Boolean)
          );

          const allUserSkills = await prisma.skill.findMany({
            where: { userId: profile.id },
            orderBy: { proficiencyScore: "desc" },
          });

          const matchedSkills = allUserSkills.filter((s) =>
            targetTechNames.has(s.name.toLowerCase())
          );

          const skills = matchedSkills.length > 0
            ? matchedSkills
            : selectedRepos.flatMap((r) =>
                (r.technologies || []).map((t: any) => ({
                  id: t.id,
                  name: t.name,
                  category: t.category,
                  proficiencyScore: 85,
                  evidenceStrength: "Strong Evidence",
                }))
              );

          const ai = await generateAIInterpretation({
            developerName: profile.displayName || profile.username,
            repositories: selectedRepos.map((r) => ({
              name: r.name,
              language: r.primaryLanguage,
              stars: r.stars,
              commits: r.commitCount || r.commits.length,
            })),
            skills: skills.map((s) => ({
              name: s.name,
              score: s.proficiencyScore,
              strength: s.evidenceStrength,
            })),
            integrityScore: 92,
            totalCommits,
          });

          const reportHash = crypto
            .createHash("sha256")
            .update(`${profile.id}-${Date.now()}-aggregate`)
            .digest("hex");

          report = await prisma.report.create({
            data: {
              userId: profile.id,
              repositoryId: null,
              title: `Comprehensive Evidence Audit (${selectedRepos.length} Repositories)`,
              status: "verified",
              reportHash,
              summary: ai.engineeringSummary,
              fullData: {
                developerName: profile.displayName || profile.username,
                repositoryScope: selectedRepos.map((r) => ({
                  id: r.id,
                  name: r.name,
                  fullName: r.fullName,
                  primaryLanguage: r.primaryLanguage,
                  commitCount: r.commitCount || r.commits.length,
                  languages: r.languages,
                  technologies: r.technologies,
                })),
                skills: skills.slice(0, 8),
                ai: ai as any,
                totalCommits,
                generatedAt: new Date().toISOString(),
              } as any,
            },
          });
        }
      }
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Report detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report details" },
      { status: 500 }
    );
  }
}
