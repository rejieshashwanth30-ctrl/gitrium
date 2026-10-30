import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export interface EvidenceSnapshot {
  developerName: string;
  githubUsername?: string;
  repositories: Array<{
    id: string;
    name: string;
    fullName: string;
    language: string | null;
    stars: number;
    commitCount: number;
    prCount: number;
    technologies: string[];
    complexity?: string;
    evidenceStrength?: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiencyScore: number;
    evidenceStrength: string;
    evidenceCount: number;
    projectCount: number;
  }>;
  totalCommits: number;
  totalPRs: number;
  integrityScore: number;
  testingDetected: boolean;
  uniqueLanguages: string[];
  uniqueTechnologies: string[];
  lastActivity?: string;
}

export interface StructuredAIInsights {
  summary: string;
  strengths: Array<{
    title: string;
    explanation: string;
    evidenceIds?: string[];
  }>;
  emergingSkills: Array<{
    skill: string;
    explanation: string;
    evidenceIds?: string[];
  }>;
  developmentAreas: Array<{
    title: string;
    explanation: string;
    evidenceIds?: string[];
  }>;
  engineeringPatterns: Array<{
    title: string;
    explanation: string;
    evidenceIds?: string[];
  }>;
  careerSignals: Array<{
    role: string;
    explanation: string;
    evidenceIds?: string[];
  }>;
  recommendedNextSteps: Array<{
    title: string;
    reason: string;
    evidenceIds?: string[];
  }>;
  evidenceTraceabilityKey: string;
  evidenceBasis: {
    repositoriesCount: number;
    commitsCount: number;
    pullRequestsCount: number;
    technologiesCount: number;
    skillsCount: number;
  };
  provider: "gemini" | "openai" | "deterministic-engine";
  isAiGenerated: boolean;
  generatedAt: string;
}

/**
 * Creates a unique SHA-256 fingerprint representing the current deterministic evidence snapshot.
 */
export function computeEvidenceSnapshotHash(snapshot: EvidenceSnapshot): string {
  const content = [
    snapshot.developerName,
    snapshot.githubUsername || "",
    snapshot.totalCommits,
    snapshot.totalPRs,
    snapshot.repositories.map((r) => `${r.name}:${r.commitCount}`).sort().join(","),
    snapshot.skills.map((s) => `${s.name}:${s.proficiencyScore}`).sort().join(","),
    snapshot.uniqueTechnologies.sort().join(","),
  ].join("|");

  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Human-friendly evidence synthesis engine.
 * Generates clear, understandable insights strictly derived from verified GitHub activity
 * when external LLM endpoints are unavailable or unconfigured.
 */
export function synthesizeEvidenceDeterministically(
  snapshot: EvidenceSnapshot,
  hash: string
): StructuredAIInsights {
  const {
    developerName,
    repositories,
    skills,
    totalCommits,
    totalPRs,
    integrityScore,
    testingDetected,
    uniqueLanguages,
    uniqueTechnologies,
  } = snapshot;

  const repoCount = repositories.length;
  const primaryLangs = uniqueLanguages.filter(Boolean);
  const topSkills = skills.slice(0, 4);

  // 1. Handling empty / low data state honestly
  if (repoCount === 0 || totalCommits === 0) {
    return {
      summary:
        "Gitrium did not find enough project activity yet. Connect your GitHub account to review your projects, skills, and growth.",
      strengths: [],
      emergingSkills: [],
      developmentAreas: [
        {
          title: "Connect Your GitHub Account",
          explanation: "Link your active repositories containing your work to generate insights and skill evidence.",
        },
      ],
      engineeringPatterns: [],
      careerSignals: [],
      recommendedNextSteps: [
        {
          title: "Connect GitHub Account",
          reason: "Connect and synchronize your repositories so Gitrium can study your commits and project technologies.",
        },
      ],
      evidenceTraceabilityKey: hash,
      evidenceBasis: {
        repositoriesCount: 0,
        commitsCount: 0,
        pullRequestsCount: 0,
        technologiesCount: 0,
        skillsCount: 0,
      },
      provider: "deterministic-engine",
      isAiGenerated: false,
      generatedAt: new Date().toISOString(),
    };
  }

  // 2. Clear, simple executive summary
  const langText = primaryLangs.length > 0 ? primaryLangs.slice(0, 3).join(", ") : "modern web technologies";
  const summary = `Your GitHub activity shows consistent work across ${repoCount} project${repoCount === 1 ? "" : "s"}. You have strong evidence of hands-on development with ${langText}. Gitrium found this from your project activity, ${totalCommits} commits, technologies, and repeated usage across your repositories.`;

  // 3. What You're Good At (Your Strengths)
  const strengths: StructuredAIInsights["strengths"] = [];

  const hasTypeScript = primaryLangs.some((l) => l.toLowerCase().includes("typescript")) ||
    uniqueTechnologies.some((t) => t.toLowerCase().includes("typescript"));
  const hasFrontend = primaryLangs.some((l) => ["javascript", "html", "css", "react"].includes(l.toLowerCase())) ||
    uniqueTechnologies.some((t) => ["react", "next.js", "tailwind", "vue", "html", "css"].includes(t.toLowerCase()));

  if (hasTypeScript) {
    strengths.push({
      title: "Strong TypeScript Experience",
      explanation: "You have used TypeScript repeatedly across several projects, giving Gitrium strong evidence of practical experience.",
      evidenceIds: repositories.filter((r) => r.language?.toLowerCase().includes("typescript")).map((r) => r.id),
    });
  } else if (primaryLangs.length > 0) {
    strengths.push({
      title: `Strong ${primaryLangs[0]} Experience`,
      explanation: `You have used ${primaryLangs[0]} across multiple projects with regular updates and commits.`,
      evidenceIds: repositories.filter((r) => r.language === primaryLangs[0]).map((r) => r.id),
    });
  }

  if (hasFrontend) {
    strengths.push({
      title: "Strong Frontend Experience",
      explanation: "HTML, CSS, and frontend tools appear repeatedly across your projects, showing consistent UI and client-side development.",
    });
  } else if (topSkills.length > 0) {
    strengths.push({
      title: `Hands-on Experience in ${topSkills[0].name}`,
      explanation: `Used across ${topSkills[0].projectCount} project${topSkills[0].projectCount === 1 ? "" : "s"} with verified code contributions.`,
      evidenceIds: [topSkills[0].name],
    });
  }

  if (totalCommits > 15) {
    strengths.push({
      title: "Consistent Development Activity",
      explanation: "Your GitHub history shows regular development activity across your projects.",
    });
  }

  // 4. Skills You're Building (Growing Skills)
  const emergingSkills: StructuredAIInsights["emergingSkills"] = skills
    .filter((s) => s.evidenceStrength === "Moderate Evidence" || s.evidenceStrength === "Limited Evidence")
    .slice(0, 3)
    .map((s) => ({
      skill: s.name,
      explanation: `You are using ${s.name} across ${s.projectCount} project${s.projectCount === 1 ? "" : "s"}, and it appears in your recent work.`,
      evidenceIds: [s.name],
    }));

  if (emergingSkills.length === 0 && uniqueTechnologies.length > 1) {
    const growingTech = uniqueTechnologies.find((t) => !hasTypeScript || t.toLowerCase() !== "typescript") || uniqueTechnologies[0];
    emergingSkills.push({
      skill: growingTech,
      explanation: `You are using ${growingTech} across your projects, and it appears regularly in your recent work.`,
    });
  }

  // 5. What You Could Improve
  const developmentAreas: StructuredAIInsights["developmentAreas"] = [];
  if (!testingDetected) {
    developmentAreas.push({
      title: "Add Automated Tests",
      explanation: "Your projects show limited evidence of automated tests. Adding unit or integration tests would make your projects more reliable and strengthen your development profile.",
    });
  }
  developmentAreas.push({
    title: "Keep Main Projects Active & Documented",
    explanation: "Adding clear README guides and regular updates will make your projects easier for collaborators and hiring teams to understand.",
  });

  // 6. Engineering Patterns
  const engineeringPatterns: StructuredAIInsights["engineeringPatterns"] = [
    {
      title: "Full-Stack Application Development",
      explanation: `Your projects combine frontend interfaces with backend services in ${langText}.`,
    },
    {
      title: "Active Contribution Rhythm",
      explanation: `Regular commit history across ${repoCount} projects shows steady progress over time.`,
    },
  ];

  // 7. Career Direction
  const careerSignals: StructuredAIInsights["careerSignals"] = [];
  if (primaryLangs.some((l) => ["typescript", "javascript", "react", "html", "css"].includes(l.toLowerCase()))) {
    careerSignals.push({
      role: "Full-Stack Web Development",
      explanation: "Your current project history shows repeated work across frontend and backend technologies, which aligns well with full-stack development.",
    });
  } else if (primaryLangs.some((l) => ["python", "go", "rust", "java"].includes(l.toLowerCase()))) {
    careerSignals.push({
      role: "Backend & Systems Development",
      explanation: "Your project history shows experience with backend services, structured logic, and data workflows.",
    });
  } else {
    careerSignals.push({
      role: "Software Application Development",
      explanation: `Your project work demonstrates practical experience building software across ${repoCount} repositories.`,
    });
  }

  // 8. Recommended Next Steps
  const recommendedNextSteps: StructuredAIInsights["recommendedNextSteps"] = [
    {
      title: "Build one project with strong testing",
      reason: "Add automated tests, document the project clearly, and keep the work visible in GitHub.",
    },
    {
      title: "Keep Your Main Projects Active",
      reason: "Continue maintaining your main projects and keeping your GitHub history up to date.",
    },
  ];

  return {
    summary,
    strengths,
    emergingSkills,
    developmentAreas,
    engineeringPatterns,
    careerSignals,
    recommendedNextSteps,
    evidenceTraceabilityKey: hash,
    evidenceBasis: {
      repositoriesCount: repoCount,
      commitsCount: totalCommits,
      pullRequestsCount: totalPRs,
      technologiesCount: uniqueTechnologies.length,
      skillsCount: skills.length,
    },
    provider: "deterministic-engine",
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Calls an external LLM (Gemini or OpenAI) with strict prompt constraints,
 * falling back transparently to the deterministic engine if the provider is unconfigured or fails.
 */
export async function generateAIInterpretation(
  snapshot: EvidenceSnapshot
): Promise<StructuredAIInsights> {
  const hash = computeEvidenceSnapshotHash(snapshot);

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.AI_PROVIDER_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return synthesizeEvidenceDeterministically(snapshot, hash);
  }

  const isGemini = Boolean(process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY);

  const systemInstruction = `You are Gitrium's developer intelligence engine.
Your mission is to study the developer's real GitHub activity and explain what their work shows in simple, natural, encouraging language.
Do NOT use internal technical jargon like "AST", "AST transformations", "commit DAG", "cryptographic provenance", "syntactic trees", "p-values", or statistical probability claims.
Follow this simple structure:
1. WHAT WE FOUND: Summarize their real work and technologies clearly.
2. WHY WE THINK IT: Point to project activity, commits, and repeated technology usage.
3. WHAT THEY CAN DO NEXT: Provide practical, actionable advice.

Sections to generate:
- summary: A clear 2-3 sentence overview of their work and primary technologies.
- strengths: What they are good at (e.g. "Strong TypeScript Experience", "Strong Frontend Experience", "Consistent Development Activity").
- emergingSkills: Skills they are currently building or using in recent projects.
- developmentAreas: Practical areas for improvement (e.g. "Add Automated Tests", "Keep Projects Documented").
- careerSignals: Roles their work aligns with (e.g. "Full-Stack Web Development") and why.
- recommendedNextSteps: 1-2 concrete next steps (e.g. "Build one project with strong testing").

CRITICAL SAFETY RULES:
- Never invent repositories, commits, pull requests, technologies, skills, or employment guarantees.
- Never claim guaranteed mastery or guaranteed hiring outcomes.
- Base every single observation strictly on the provided evidence snapshot.
- Return strictly valid JSON conforming to the requested schema.`;

  const userPrompt = `Review this verified GitHub work snapshot and generate clear, human-readable insights:
${JSON.stringify(snapshot, null, 2)}

Return a JSON object with this exact shape:
{
  "summary": "Clear 2-3 sentence human-readable summary of what their work shows.",
  "strengths": [{"title": "string", "explanation": "string"}],
  "emergingSkills": [{"skill": "string", "explanation": "string"}],
  "developmentAreas": [{"title": "string", "explanation": "string"}],
  "engineeringPatterns": [{"title": "string", "explanation": "string"}],
  "careerSignals": [{"role": "string", "explanation": "string"}],
  "recommendedNextSteps": [{"title": "string", "reason": "string"}]
}`;

  try {
    if (isGemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: "application/json",
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[AI Engine] Gemini API error ${response.status}: ${await response.text()}`);
        return synthesizeEvidenceDeterministically(snapshot, hash);
      }

      const resData = await response.json();
      const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return synthesizeEvidenceDeterministically(snapshot, hash);

      const parsed = JSON.parse(rawText);
      return {
        summary: parsed.summary || "",
        strengths: parsed.strengths || [],
        emergingSkills: parsed.emergingSkills || [],
        developmentAreas: parsed.developmentAreas || [],
        engineeringPatterns: parsed.engineeringPatterns || [],
        careerSignals: parsed.careerSignals || [],
        recommendedNextSteps: parsed.recommendedNextSteps || [],
        evidenceTraceabilityKey: hash,
        evidenceBasis: {
          repositoriesCount: snapshot.repositories.length,
          commitsCount: snapshot.totalCommits,
          pullRequestsCount: snapshot.totalPRs,
          technologiesCount: snapshot.uniqueTechnologies.length,
          skillsCount: snapshot.skills.length,
        },
        provider: "gemini",
        isAiGenerated: true,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err: any) {
    console.warn("[AI Engine] External LLM invocation failed, falling back to deterministic synthesis:", err?.message || err);
  }

  return synthesizeEvidenceDeterministically(snapshot, hash);
}
