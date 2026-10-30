import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/lib/auth/profileService";
import { prisma } from "@/lib/db/prisma";
import {
  EvidenceSnapshot,
  StructuredAIInsights,
  computeEvidenceSnapshotHash,
  generateAIInterpretation,
} from "@/lib/intelligence/aiLayer";

export const dynamic = "force-dynamic";

function parseAIInsightRecord(record: any): StructuredAIInsights {
  let careerData: any = {};
  try {
    if (record.careerTrajectory) {
      careerData = JSON.parse(record.careerTrajectory);
    }
  } catch (e) {
    careerData = {
      careerSignals: [{ role: "Software Engineer", explanation: record.careerTrajectory }],
      engineeringPatterns: [],
    };
  }

  const parseItem = (item: string, defaultKey: string) => {
    try {
      const parsed = JSON.parse(item);
      if (typeof parsed === "object" && parsed !== null) return parsed;
      return { [defaultKey]: item, explanation: item };
    } catch {
      return { [defaultKey]: item, explanation: item };
    }
  };

  return {
    summary: record.engineeringSummary || "Deterministic evidence compilation complete.",
    strengths: (record.observedStrengths || []).map((s: string) => parseItem(s, "title")),
    emergingSkills: (record.emergingSkills || []).map((s: string) => parseItem(s, "skill")),
    developmentAreas: (record.attentionAreas || []).map((s: string) => parseItem(s, "title")),
    recommendedNextSteps: (record.learningRecommendations || []).map((s: string) => parseItem(s, "title")),
    engineeringPatterns: careerData.engineeringPatterns || [],
    careerSignals: careerData.careerSignals || [],
    evidenceTraceabilityKey: record.evidenceTraceabilityKey || "",
    evidenceBasis: careerData.evidenceBasis || {
      repositoriesCount: 0,
      commitsCount: 0,
      pullRequestsCount: 0,
      technologiesCount: 0,
      skillsCount: 0,
    },
    provider: careerData.provider || "deterministic-engine",
    isAiGenerated: Boolean(careerData.isAiGenerated),
    generatedAt: record.generatedAt ? new Date(record.generatedAt).toISOString() : new Date().toISOString(),
  };
}

async function buildEvidenceSnapshot(userId: string, profile: any): Promise<EvidenceSnapshot> {
  // Query repositories: prioritize isSelected=true, fallback to all repos
  let repos = await prisma.repository.findMany({
    where: { userId, isSelected: true },
    include: {
      technologies: true,
      languages: true,
    },
    orderBy: { commitCount: "desc" },
  });

  if (repos.length === 0) {
    repos = await prisma.repository.findMany({
      where: { userId },
      include: {
        technologies: true,
        languages: true,
      },
      orderBy: { commitCount: "desc" },
      take: 20,
    });
  }

  // Query skills
  const skills = await prisma.skill.findMany({
    where: { userId },
    select: {
      name: true,
      category: true,
      proficiencyScore: true,
      evidenceStrength: true,
      evidenceCount: true,
      projectCount: true,
    },
    orderBy: { proficiencyScore: "desc" },
  });

  // Query integrity score from DeveloperAnalysis
  const devAnalysis = await prisma.developerAnalysis.findUnique({
    where: { userId },
    select: { overallIntegrityScore: true },
  });
  const integrityScore = devAnalysis?.overallIntegrityScore || 94;

  // Extract unique languages and technologies
  const uniqueLangs = Array.from(
    new Set(
      repos
        .flatMap((r) => [r.primaryLanguage, ...(r.languages || []).map((l) => l.name)])
        .filter(Boolean) as string[]
    )
  );

  const allTechs = new Set<string>();
  repos.forEach((r) => {
    if (r.technologies && Array.isArray(r.technologies)) {
      r.technologies.forEach((t) => allTechs.add(t.name));
    }
  });

  const testingDetected = Array.from(allTechs).some((t) =>
    ["Jest", "Vitest", "Cypress", "Playwright", "Mocha", "PyTest", "Testing Library"].includes(t)
  );

  const totalCommits = repos.reduce((sum, r) => sum + (r.commitCount || 0), 0);
  const totalPRs = repos.reduce((sum, r) => sum + (r.prCount || 0), 0);

  return {
    developerName: profile.displayName || profile.username || "Developer",
    githubUsername: profile.username || undefined,
    repositories: repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.fullName,
      language: r.primaryLanguage,
      stars: r.stars,
      commitCount: r.commitCount,
      prCount: r.prCount,
      technologies: (r.technologies || []).map((t) => t.name),
      complexity: r.complexity || "Standard",
      evidenceStrength: r.commitCount > 20 ? "Verified" : "Observed",
    })),
    skills: skills.map((s) => ({
      name: s.name,
      category: s.category || "General",
      proficiencyScore: s.proficiencyScore,
      evidenceStrength: s.evidenceStrength || "Medium",
      evidenceCount: s.evidenceCount,
      projectCount: s.projectCount,
    })),
    totalCommits,
    totalPRs,
    integrityScore,
    testingDetected,
    uniqueLanguages: uniqueLangs,
    uniqueTechnologies: Array.from(allTechs),
    lastActivity: new Date().toISOString(),
  };
}

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
    const forceRefresh = searchParams.get("force") === "true";

    const snapshot = await buildEvidenceSnapshot(profile.id, profile);
    const hash = computeEvidenceSnapshotHash(snapshot);

    if (!forceRefresh) {
      // Check cache in Neon database
      const cached = await prisma.aIInsight.findFirst({
        where: {
          userId: profile.id,
          evidenceTraceabilityKey: hash,
        },
        orderBy: { generatedAt: "desc" },
      });

      // If cached within the last 24 hours, return cached
      if (cached && Date.now() - new Date(cached.generatedAt).getTime() < 24 * 60 * 60 * 1000) {
        return NextResponse.json({
          insights: parseAIInsightRecord(cached),
          cached: true,
        });
      }
    }

    // Generate fresh evidence-grounded interpretation
    const insights = await generateAIInterpretation(snapshot);

    // Save to database
    const saved = await prisma.aIInsight.create({
      data: {
        userId: profile.id,
        engineeringSummary: insights.summary,
        observedStrengths: insights.strengths.map((s) => JSON.stringify(s)),
        emergingSkills: insights.emergingSkills.map((s) => JSON.stringify(s)),
        attentionAreas: insights.developmentAreas.map((a) => JSON.stringify(a)),
        learningRecommendations: insights.recommendedNextSteps.map((r) => JSON.stringify(r)),
        careerTrajectory: JSON.stringify({
          careerSignals: insights.careerSignals,
          engineeringPatterns: insights.engineeringPatterns,
          evidenceBasis: insights.evidenceBasis,
          provider: insights.provider,
          isAiGenerated: insights.isAiGenerated,
        }),
        evidenceTraceabilityKey: hash,
      },
    });

    return NextResponse.json({
      insights: parseAIInsightRecord(saved),
      cached: false,
    });
  } catch (error: any) {
    console.error("[Intelligence API Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate evidence intelligence", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

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

    const snapshot = await buildEvidenceSnapshot(profile.id, profile);
    const hash = computeEvidenceSnapshotHash(snapshot);
    const insights = await generateAIInterpretation(snapshot);

    const saved = await prisma.aIInsight.create({
      data: {
        userId: profile.id,
        engineeringSummary: insights.summary,
        observedStrengths: insights.strengths.map((s) => JSON.stringify(s)),
        emergingSkills: insights.emergingSkills.map((s) => JSON.stringify(s)),
        attentionAreas: insights.developmentAreas.map((a) => JSON.stringify(a)),
        learningRecommendations: insights.recommendedNextSteps.map((r) => JSON.stringify(r)),
        careerTrajectory: JSON.stringify({
          careerSignals: insights.careerSignals,
          engineeringPatterns: insights.engineeringPatterns,
          evidenceBasis: insights.evidenceBasis,
          provider: insights.provider,
          isAiGenerated: insights.isAiGenerated,
        }),
        evidenceTraceabilityKey: hash,
      },
    });

    return NextResponse.json({
      insights: parseAIInsightRecord(saved),
      cached: false,
    });
  } catch (error: any) {
    console.error("[Intelligence API Error (POST)]:", error);
    return NextResponse.json(
      { error: "Failed to generate fresh evidence intelligence", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
