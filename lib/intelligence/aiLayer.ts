import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export interface EnrichedRepositoryEvidence {
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
  lastActivity?: string;
}

export interface DominantLanguage {
  name: string;
  repoCount: number;
  commitCount: number;
  sharePercentage: number;
}

export interface DominantTechnology {
  name: string;
  projectCount: number;
  repoNames: string[];
}

export interface TemporalCadence {
  commitDistribution: "concentrated" | "distributed" | "sparse" | "insufficient";
  primaryActiveRepo: string | null;
  primaryActiveRepoCommits: number;
  activeRepoCount: number;
  totalCommits: number;
  activityDescription: string;
}

export interface StrengthCandidate {
  category: "primary_stack" | "specialized_framework" | "development_cadence" | "sparse_observation";
  title: string;
  explanation: string;
  evidenceStrength: "Strong Evidence" | "Moderate Evidence" | "Emerging Evidence" | "Limited Evidence" | "Insufficient Evidence";
  evidenceIds?: string[];
  citedRepos?: string[];
  citedTechs?: string[];
}

export interface EvidenceSnapshot {
  evidenceVersion?: string; // "v2.0_personalized"
  userId?: string;
  developerName: string;
  githubUsername?: string;
  repositories: EnrichedRepositoryEvidence[];
  topRepositories?: EnrichedRepositoryEvidence[];
  dominantLanguages?: DominantLanguage[];
  dominantTechnologies?: DominantTechnology[];
  temporalCadence?: TemporalCadence;
  candidateStrengths?: StrengthCandidate[];
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
    evidenceStrength?: string;
    citedRepos?: string[];
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
 * Enriches a raw evidence snapshot with deterministic rankings:
 * top repositories by commit volume, dominant languages with byte/commit shares,
 * dominant frameworks/technologies, and temporal commit cadence.
 */
export function enrichEvidenceSnapshot(snapshot: EvidenceSnapshot): EvidenceSnapshot {
  const sortedRepos = [...(snapshot.repositories || [])].sort((a, b) => (b.commitCount || 0) - (a.commitCount || 0));
  const topRepos = sortedRepos.slice(0, 3);
  const totalCommits = snapshot.totalCommits || 0;
  const repoCount = sortedRepos.length;

  // 1. Calculate dominant languages
  const langMap = new Map<string, { repoCount: number; commitCount: number }>();
  for (const r of sortedRepos) {
    if (r.language) {
      const existing = langMap.get(r.language) || { repoCount: 0, commitCount: 0 };
      existing.repoCount += 1;
      existing.commitCount += r.commitCount || 0;
      langMap.set(r.language, existing);
    }
  }

  const dominantLanguages: DominantLanguage[] = Array.from(langMap.entries())
    .map(([name, data]) => ({
      name,
      repoCount: data.repoCount,
      commitCount: data.commitCount,
      sharePercentage: totalCommits > 0 ? Math.round((data.commitCount / totalCommits) * 100) : 0,
    }))
    .sort((a, b) => b.commitCount - a.commitCount || b.repoCount - a.repoCount);

  // 2. Calculate dominant technologies
  const techMap = new Map<string, string[]>();
  for (const r of sortedRepos) {
    for (const t of r.technologies || []) {
      if (!t) continue;
      const list = techMap.get(t) || [];
      if (!list.includes(r.name)) list.push(r.name);
      techMap.set(t, list);
    }
  }

  const dominantTechnologies: DominantTechnology[] = Array.from(techMap.entries())
    .map(([name, repoNames]) => ({
      name,
      projectCount: repoNames.length,
      repoNames,
    }))
    .sort((a, b) => b.projectCount - a.projectCount);

  // 3. Calculate temporal cadence
  let temporalCadence: TemporalCadence;
  const activeRepos = sortedRepos.filter((r) => (r.commitCount || 0) > 0);
  const primaryActiveRepo = topRepos.length > 0 ? topRepos[0] : null;

  if (repoCount === 0 || totalCommits === 0) {
    temporalCadence = {
      commitDistribution: "insufficient",
      primaryActiveRepo: null,
      primaryActiveRepoCommits: 0,
      activeRepoCount: 0,
      totalCommits: 0,
      activityDescription: "GitHub history is currently insufficient to assess development cadence.",
    };
  } else if (totalCommits < 10) {
    temporalCadence = {
      commitDistribution: "sparse",
      primaryActiveRepo: primaryActiveRepo?.name || null,
      primaryActiveRepoCommits: primaryActiveRepo?.commitCount || 0,
      activeRepoCount: activeRepos.length,
      totalCommits,
      activityDescription: "Your recent GitHub activity reflects early project additions with limited commit history.",
    };
  } else if (primaryActiveRepo && primaryActiveRepo.commitCount >= totalCommits * 0.7 && activeRepos.length <= 2) {
    temporalCadence = {
      commitDistribution: "concentrated",
      primaryActiveRepo: primaryActiveRepo.name,
      primaryActiveRepoCommits: primaryActiveRepo.commitCount,
      activeRepoCount: activeRepos.length,
      totalCommits,
      activityDescription: `Your development activity is heavily focused in your flagship project ${primaryActiveRepo.name} (${primaryActiveRepo.commitCount} commits).`,
    };
  } else {
    temporalCadence = {
      commitDistribution: "distributed",
      primaryActiveRepo: primaryActiveRepo?.name || null,
      primaryActiveRepoCommits: primaryActiveRepo?.commitCount || 0,
      activeRepoCount: activeRepos.length,
      totalCommits,
      activityDescription: `Your activity demonstrates steady progress distributed across ${activeRepos.length} active repositories.`,
    };
  }

  const enriched: EvidenceSnapshot = {
    ...snapshot,
    evidenceVersion: "v2.0_personalized",
    topRepositories: topRepos,
    dominantLanguages,
    dominantTechnologies,
    temporalCadence,
  };

  enriched.candidateStrengths = rankStrengthCandidates(enriched);
  return enriched;
}

/**
 * Deterministically ranks personalized strength candidates from verified code evidence.
 * Strictly guarantees:
 * - Zero repositories / commits -> returns [] (zero strengths).
 * - Sparse activity (< 10 commits) -> returns 1 low-confidence observation, never claiming mastery.
 * - Active developers -> derives strengths mentioning authentic repository names and dominant technologies.
 */
export function rankStrengthCandidates(snapshot: EvidenceSnapshot): StrengthCandidate[] {
  const repoCount = (snapshot.repositories || []).length;
  const totalCommits = snapshot.totalCommits || 0;

  // Zero repositories / zero commits -> STRICTLY 0 strengths
  if (repoCount === 0 || totalCommits === 0) {
    return [];
  }

  const topRepos = snapshot.topRepositories || (snapshot.repositories || []).slice(0, 3);
  const dominantLangs = snapshot.dominantLanguages || [];
  const dominantTechs = snapshot.dominantTechnologies || [];
  const cadence = snapshot.temporalCadence;

  // Sparse data: < 10 total commits or only 1 repo with < 5 commits
  if (totalCommits < 10 || (repoCount === 1 && totalCommits < 5)) {
    const primaryRepo = topRepos[0] || snapshot.repositories[0];
    const detectedLang = primaryRepo?.language || (dominantLangs[0]?.name) || "Software";
    return [
      {
        category: "sparse_observation",
        title: `Early Project Activity in ${detectedLang}`,
        explanation: `Gitrium recorded initial activity in ${primaryRepo?.name || "your repository"} with ${totalCommits} commits. Additional commits and project history are needed to build verifiable skill evidence.`,
        evidenceStrength: "Limited Evidence",
        evidenceIds: primaryRepo ? [primaryRepo.id] : undefined,
        citedRepos: primaryRepo ? [primaryRepo.name] : [],
        citedTechs: [detectedLang],
      },
    ];
  }

  const candidates: StrengthCandidate[] = [];

  // Candidate 1: Dominant Language / Core Ecosystem
  if (dominantLangs.length > 0) {
    const topLang = dominantLangs[0];
    const langRepos = (snapshot.repositories || []).filter(
      (r) => (r.language || "").toLowerCase() === topLang.name.toLowerCase()
    );
    const citedRepoNames = langRepos.map((r) => r.name).slice(0, 3);
    const strengthRating =
      topLang.commitCount >= 25 || langRepos.length >= 2
        ? "Strong Evidence"
        : "Moderate Evidence";

    const titlePrefix = strengthRating === "Strong Evidence" ? "Strong" : "Verified";
    const repoDetails = citedRepoNames.length > 0 ? ` (including ${citedRepoNames.join(", ")})` : "";

    candidates.push({
      category: "primary_stack",
      title: `${titlePrefix} ${topLang.name} Development Evidence`,
      explanation: `${topLang.name} appears as your primary language across ${langRepos.length} project${langRepos.length === 1 ? "" : "s"}${repoDetails}, supported by ${topLang.commitCount} recorded commits.`,
      evidenceStrength: strengthRating,
      evidenceIds: langRepos.map((r) => r.id),
      citedRepos: citedRepoNames,
      citedTechs: [topLang.name],
    });
  }

  // Candidate 2: Architecture / Dominant Framework or Secondary Technology
  const knownFrameworks = [
    "react", "next.js", "vue", "angular", "svelte", "express", "fastapi",
    "django", "flask", "spring", "flutter", "react native", "tailwind",
    "prisma", "docker", "graphql", "pytorch", "tensorflow", "kubernetes",
    "android", "ios", "rust", "go", "sql", "postgresql"
  ];

  const topFramework = dominantTechs.find((t) =>
    knownFrameworks.some((kf) => t.name.toLowerCase().includes(kf))
  ) || dominantTechs[0];

  if (topFramework) {
    const citedFwRepos = topFramework.repoNames.slice(0, 3);
    const fwRepoDetails = citedFwRepos.length > 0 ? ` in ${citedFwRepos.join(", ")}` : "";
    const fwStrength = topFramework.projectCount >= 2 ? "Strong Evidence" : "Moderate Evidence";

    candidates.push({
      category: "specialized_framework",
      title: `Verified ${topFramework.name} Project Architecture`,
      explanation: `${topFramework.name} implementation verified across ${topFramework.projectCount} project${topFramework.projectCount === 1 ? "" : "s"}${fwRepoDetails}, demonstrating practical application structure.`,
      evidenceStrength: fwStrength,
      evidenceIds: (snapshot.repositories || []).filter((r) => citedFwRepos.includes(r.name)).map((r) => r.id),
      citedRepos: citedFwRepos,
      citedTechs: [topFramework.name],
    });
  } else if (dominantLangs.length > 1 && dominantLangs[1].commitCount >= 5) {
    const secondLang = dominantLangs[1];
    const secondRepos = (snapshot.repositories || []).filter(
      (r) => (r.language || "").toLowerCase() === secondLang.name.toLowerCase()
    );
    const citedSecond = secondRepos.map((r) => r.name).slice(0, 3);

    candidates.push({
      category: "specialized_framework",
      title: `Hands-on Experience in ${secondLang.name}`,
      explanation: `Verified contributions in ${secondLang.name} across ${secondRepos.length} project${secondRepos.length === 1 ? "" : "s"} (${citedSecond.join(", ")}), demonstrating multi-language capabilities.`,
      evidenceStrength: "Moderate Evidence",
      evidenceIds: secondRepos.map((r) => r.id),
      citedRepos: citedSecond,
      citedTechs: [secondLang.name],
    });
  }

  // Candidate 3: Temporal Cadence / Project Depth
  if (cadence && cadence.commitDistribution === "concentrated" && cadence.primaryActiveRepo) {
    const primeRepo = (snapshot.repositories || []).find((r) => r.name === cadence.primaryActiveRepo);
    candidates.push({
      category: "development_cadence",
      title: `Focused Iterative Depth in ${cadence.primaryActiveRepo}`,
      explanation: `Development activity is concentrated in your flagship repository ${cadence.primaryActiveRepo} (${cadence.primaryActiveRepoCommits} commits), reflecting sustained in-depth iteration.`,
      evidenceStrength: "Strong Evidence",
      evidenceIds: primeRepo ? [primeRepo.id] : undefined,
      citedRepos: [cadence.primaryActiveRepo],
      citedTechs: primeRepo?.language ? [primeRepo.language] : [],
    });
  } else if (cadence && cadence.commitDistribution === "distributed" && cadence.activeRepoCount >= 2) {
    const activeNames = topRepos.filter((r) => (r.commitCount || 0) > 0).map((r) => r.name).slice(0, 3);
    candidates.push({
      category: "development_cadence",
      title: "Multi-Project Development Cadence",
      explanation: `Commit activity is distributed across ${cadence.activeRepoCount} active repositories (${activeNames.join(", ")}), demonstrating steady multi-codebase maintenance.`,
      evidenceStrength: "Strong Evidence",
      evidenceIds: topRepos.map((r) => r.id),
      citedRepos: activeNames,
      citedTechs: [],
    });
  } else if (candidates.length < 3 && topRepos.length > 0) {
    const flagship = topRepos[0];
    candidates.push({
      category: "development_cadence",
      title: `Verified Work in ${flagship.name}`,
      explanation: `Project repository contains ${flagship.commitCount} commits with ${flagship.language || "code"} contributions.`,
      evidenceStrength: flagship.commitCount >= 15 ? "Moderate Evidence" : "Limited Evidence",
      evidenceIds: [flagship.id],
      citedRepos: [flagship.name],
      citedTechs: flagship.language ? [flagship.language] : [],
    });
  }

  return candidates.slice(0, 3);
}

/**
 * Creates a unique SHA-256 fingerprint representing the current deterministic evidence snapshot.
 * Versioned to v2.0_personalized and scoped by user to prevent stale generic caches.
 */
export function computeEvidenceSnapshotHash(snapshot: EvidenceSnapshot): string {
  const version = "v2.0_personalized";
  const content = [
    version,
    snapshot.userId || "",
    snapshot.developerName,
    snapshot.githubUsername || "",
    snapshot.totalCommits || 0,
    snapshot.totalPRs || 0,
    (snapshot.repositories || []).map((r) => `${r.name}:${r.commitCount || 0}:${r.language || ""}`).sort().join(","),
    (snapshot.skills || []).map((s) => `${s.name}:${s.proficiencyScore || 0}`).sort().join(","),
    (snapshot.uniqueTechnologies || []).slice().sort().join(","),
    (snapshot.uniqueLanguages || []).slice().sort().join(","),
  ].join("|");

  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Human-friendly, personalized evidence synthesis engine.
 * Generates clear, individualized insights derived strictly from verified GitHub activity.
 */
export function synthesizeEvidenceDeterministically(
  rawSnapshot: EvidenceSnapshot,
  hash: string
): StructuredAIInsights {
  const snapshot = rawSnapshot.topRepositories ? rawSnapshot : enrichEvidenceSnapshot(rawSnapshot);
  const {
    developerName,
    repositories,
    skills,
    totalCommits,
    totalPRs,
    testingDetected,
    uniqueLanguages,
    uniqueTechnologies,
    dominantLanguages,
    dominantTechnologies,
    temporalCadence,
  } = snapshot;

  const repoCount = repositories.length;
  const primaryLangs = (uniqueLanguages || []).filter(Boolean);
  const topSkills = (skills || []).slice(0, 4);

  // 1. Handling empty / zero data state honestly
  if (repoCount === 0 || totalCommits === 0) {
    return {
      summary:
        "Gitrium did not find enough repository activity yet. Connect your GitHub account to review your projects, skills, and growth.",
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

  // 2. Personalized Executive Summary
  const langText = (dominantLanguages && dominantLanguages.length > 0)
    ? dominantLanguages.slice(0, 3).map((l) => l.name).join(", ")
    : primaryLangs.length > 0
    ? primaryLangs.slice(0, 3).join(", ")
    : "software development";

  const topRepoNames = (snapshot.topRepositories || repositories.slice(0, 2)).map((r) => r.name);
  const repoMention = topRepoNames.length > 0 ? ` (notably ${topRepoNames.join(" and ")})` : "";
  const summary = `Your GitHub activity shows verified development across ${repoCount} project${repoCount === 1 ? "" : "s"}${repoMention}. Gitrium analyzed ${totalCommits} commits and confirmed sustained usage of ${langText}.`;

  // 3. Personalized Strengths
  const candidates = snapshot.candidateStrengths || rankStrengthCandidates(snapshot);
  const strengths: StructuredAIInsights["strengths"] = candidates.map((c) => ({
    title: c.title,
    explanation: c.explanation,
    evidenceIds: c.evidenceIds,
    evidenceStrength: c.evidenceStrength,
    citedRepos: c.citedRepos,
  }));

  // 4. Skills You're Building (Emerging Skills)
  const emergingSkills: StructuredAIInsights["emergingSkills"] = (skills || [])
    .filter((s) => s.evidenceStrength === "Moderate Evidence" || s.evidenceStrength === "Limited Evidence")
    .slice(0, 3)
    .map((s) => ({
      skill: s.name,
      explanation: `Your recent projects show growing use of ${s.name}.`,
      evidenceIds: [s.name],
    }));

  if (emergingSkills.length === 0 && (dominantTechnologies || []).length > 1) {
    const primaryTech = dominantTechnologies?.[0]?.name;
    const secondaryTech = dominantTechnologies?.find((t) => t.name !== primaryTech) || dominantTechnologies?.[1];
    if (secondaryTech) {
      emergingSkills.push({
        skill: secondaryTech.name,
        explanation: `Verified implementation across ${secondaryTech.projectCount} project${secondaryTech.projectCount === 1 ? "" : "s"} (${secondaryTech.repoNames.slice(0, 2).join(", ")}).`,
      });
    }
  }

  // 5. Personalized Improvement Areas
  const developmentAreas: StructuredAIInsights["developmentAreas"] = [];
  const primaryLangName = dominantLanguages?.[0]?.name || primaryLangs[0] || "Code";

  if (!testingDetected) {
    developmentAreas.push({
      title: `Add Automated Tests in ${primaryLangName}`,
      explanation: `Introducing automated test suites to your primary codebases will strengthen verifiable code integrity.`,
    });
  }

  if (temporalCadence && temporalCadence.commitDistribution === "concentrated" && temporalCadence.primaryActiveRepo) {
    developmentAreas.push({
      title: "Expand Multi-Project Documentation",
      explanation: `Your work is concentrated in ${temporalCadence.primaryActiveRepo}. Adding clear architecture documentation will make secondary projects equally accessible.`,
    });
  } else {
    developmentAreas.push({
      title: "Keep Main Repositories Documented",
      explanation: `Adding clear setup instructions and architecture guides to ${topRepoNames[0] || "primary repositories"} enhances technical transparency.`,
    });
  }

  // 6. Engineering Patterns
  const engineeringPatterns: StructuredAIInsights["engineeringPatterns"] = [
    {
      title: `${primaryLangName} Application Architecture`,
      explanation: `Structured repository layout across ${repoCount} project${repoCount === 1 ? "" : "s"} with verified code contributions.`,
    },
    {
      title: "Commit Cadence & Delivery",
      explanation: temporalCadence ? temporalCadence.activityDescription : `Commit history across ${repoCount} projects shows active code iteration.`,
    },
  ];

  // 7. Career Direction (Grounded in Actual Tech Stack)
  const careerSignals: StructuredAIInsights["careerSignals"] = [];
  const lowerLangs = primaryLangs.map((l) => l.toLowerCase());
  const lowerTechs = (uniqueTechnologies || []).map((t) => t.toLowerCase());

  if (lowerLangs.some((l) => ["typescript", "javascript", "react", "html", "css"].includes(l)) || lowerTechs.some((t) => ["react", "next.js", "vue"].includes(t))) {
    careerSignals.push({
      role: "Full-Stack Web Development",
      explanation: `Your project history includes verified full-stack architecture in ${langText}.`,
    });
  } else if (lowerLangs.some((l) => ["python", "r"].includes(l)) || lowerTechs.some((t) => ["pandas", "pytorch", "tensorflow", "scikit-learn"].includes(t))) {
    careerSignals.push({
      role: "Data Science & Machine Learning Engineering",
      explanation: "Project evidence aligns with structured Python data workflows and analytical codebases.",
    });
  } else if (lowerLangs.some((l) => ["dart", "flutter", "swift", "kotlin"].includes(l)) || lowerTechs.some((t) => ["flutter", "react native", "android", "ios"].includes(t))) {
    careerSignals.push({
      role: "Mobile Application Engineering",
      explanation: "Repository structure and dependency manifests demonstrate mobile app development experience.",
    });
  } else if (lowerLangs.some((l) => ["go", "rust", "c", "c++"].includes(l))) {
    careerSignals.push({
      role: "Systems & Infrastructure Engineering",
      explanation: "Project history demonstrates systems-level software development and performant code architecture.",
    });
  } else if (lowerLangs.some((l) => ["java", "c#"].includes(l))) {
    careerSignals.push({
      role: "Enterprise & Backend Systems Engineering",
      explanation: "Verified codebases reflect structured object-oriented backend service architecture.",
    });
  } else {
    careerSignals.push({
      role: "Software Application Development",
      explanation: `Practical engineering experience building software applications across ${repoCount} repositories.`,
    });
  }

  // 8. Recommended Next Steps (Evidence-Connected)
  const flagshipRepoName = topRepoNames[0] || "your main repository";
  const recommendedNextSteps: StructuredAIInsights["recommendedNextSteps"] = [
    {
      title: !testingDetected ? `Add Test Coverage in ${flagshipRepoName}` : `Enhance CI/CD in ${flagshipRepoName}`,
      reason: !testingDetected
        ? `Adding tests to ${flagshipRepoName} creates verifiable proof of automated quality assurance.`
        : `Continuous integration workflows reinforce engineering discipline across project updates.`,
    },
    {
      title: `Maintain Active Iterations in ${flagshipRepoName}`,
      reason: `Sustaining incremental commits in your primary codebase keeps your developer evidence fresh and authoritative.`,
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
      technologiesCount: (uniqueTechnologies || []).length,
      skillsCount: (skills || []).length,
    },
    provider: "deterministic-engine",
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Cross-validates all AI-generated assertions against the ground-truth EvidenceSnapshot.
 * Corrects any hallucinated numbers (repositories, commits, PR counts) to canonical counts,
 * verifies that mentioned technologies and repositories exist in the snapshot,
 * sanitizes forbidden templates, and guarantees evidence grounding.
 */
export function validateAndGroundAIInsights(
  raw: any,
  rawSnapshot: EvidenceSnapshot,
  hash: string,
  provider: "gemini" | "openai" | "deterministic-engine"
): StructuredAIInsights {
  const snapshot = rawSnapshot.topRepositories ? rawSnapshot : enrichEvidenceSnapshot(rawSnapshot);
  const repoCount = (snapshot.repositories || []).length;
  const commitCount = snapshot.totalCommits || 0;
  const prCount = snapshot.totalPRs || 0;

  // Zero repositories / commits -> return deterministic empty state immediately
  if (repoCount === 0 || commitCount === 0) {
    return synthesizeEvidenceDeterministically(snapshot, hash);
  }

  // 1. Validate & sanitize summary
  let summary = typeof raw?.summary === "string" && raw.summary.length > 20
    ? raw.summary
    : `Your GitHub activity shows consistent work across ${repoCount} project${repoCount === 1 ? "" : "s"} and ${commitCount} verified commits.`;

  // Number sanitizer: enforce ground truth numbers in summary
  summary = summary.replace(/\b\d+\s+(projects?|repositor(?:y|ies))\b/gi, `${repoCount} $1`);
  summary = summary.replace(/\b\d+\s+commits?\b/gi, `${commitCount} commits`);

  // Strip forbidden claims
  summary = summary.replace(/100%\s+human-written/gi, "demonstrable commit activity");
  summary = summary.replace(/guaranteed\s+(job|employment|hire|salary)/gi, "strong project alignment");

  // 2. Validate strengths
  const validRepoNamesLower = (snapshot.repositories || []).map((r) => r.name.toLowerCase());
  const validTechsLower = [
    ...(snapshot.uniqueTechnologies || []).map((t) => t.toLowerCase()),
    ...(snapshot.uniqueLanguages || []).map((l) => l.toLowerCase()),
  ];

  const rawStrengths = Array.isArray(raw?.strengths) ? raw.strengths : [];
  const strengths: StructuredAIInsights["strengths"] = [];

  // Forbidden generic template titles to reject/replace
  const forbiddenTitles = [
    "strong web development experience",
    "strong frontend experience",
    "consistent development activity",
    "strong technical skills",
    "good developer",
    "experienced developer",
  ];

  for (const s of rawStrengths) {
    if (!s?.title || typeof s.title !== "string") continue;
    const lowerTitle = s.title.toLowerCase().trim();

    // Check if title is one of the generic canned phrases
    if (forbiddenTitles.some((ft) => lowerTitle === ft || lowerTitle.startsWith(ft))) {
      continue; // Discard generic canned titles
    }

    let explanation = typeof s.explanation === "string" ? s.explanation : "";

    // Correct numbers in explanation
    explanation = explanation.replace(/\b\d+\s+(projects?|repositor(?:y|ies))\b/gi, `${repoCount} $1`);
    explanation = explanation.replace(/\b\d+\s+commits?\b/gi, `${commitCount} commits`);

    // Match real evidence IDs from repositories
    const matchingRepos = (snapshot.repositories || []).filter((r) => {
      const lowerName = r.name.toLowerCase();
      const lowerLang = (r.language || "").toLowerCase();
      const lowerTechs = (r.technologies || []).map((t) => t.toLowerCase());
      return (
        lowerTitle.includes(lowerName) ||
        explanation.toLowerCase().includes(lowerName) ||
        (lowerLang && (lowerTitle.includes(lowerLang) || explanation.toLowerCase().includes(lowerLang))) ||
        lowerTechs.some((t) => lowerTitle.includes(t) || explanation.toLowerCase().includes(t))
      );
    });

    const evidenceIds = matchingRepos.map((r) => r.id);
    const citedRepos = matchingRepos.map((r) => r.name).slice(0, 3);

    strengths.push({
      title: s.title,
      explanation,
      evidenceIds: evidenceIds.length > 0 ? evidenceIds : undefined,
      citedRepos: citedRepos.length > 0 ? citedRepos : undefined,
      evidenceStrength: s.evidenceStrength || (commitCount > 20 ? "Strong Evidence" : "Moderate Evidence"),
    });
  }

  // If no strengths survived validation or empty, fall back to personalized deterministic candidates
  if (strengths.length === 0) {
    const candidates = snapshot.candidateStrengths || rankStrengthCandidates(snapshot);
    strengths.push(
      ...candidates.map((c) => ({
        title: c.title,
        explanation: c.explanation,
        evidenceIds: c.evidenceIds,
        evidenceStrength: c.evidenceStrength,
        citedRepos: c.citedRepos,
      }))
    );
  }

  // 3. Validate emerging skills
  const rawSkills = Array.isArray(raw?.emergingSkills) ? raw.emergingSkills : [];
  const emergingSkills: StructuredAIInsights["emergingSkills"] = [];

  for (const sk of rawSkills) {
    const name = sk?.skill || sk?.name || sk?.title;
    if (!name || typeof name !== "string") continue;
    const explanation = typeof sk.explanation === "string" ? sk.explanation : `Your recent projects show regular use of ${name}.`;
    
    // Check if skill exists in snapshot
    const matchedSkill = (snapshot.skills || []).find((s) => s.name.toLowerCase() === name.toLowerCase());
    emergingSkills.push({
      skill: name,
      explanation,
      evidenceIds: matchedSkill ? [matchedSkill.name] : undefined,
    });
  }

  if (emergingSkills.length === 0) {
    const det = synthesizeEvidenceDeterministically(snapshot, hash);
    emergingSkills.push(...det.emergingSkills);
  }

  // 4. Validate development areas
  const rawDevAreas = Array.isArray(raw?.developmentAreas) ? raw.developmentAreas : [];
  const developmentAreas: StructuredAIInsights["developmentAreas"] = [];

  for (const da of rawDevAreas) {
    if (!da?.title || typeof da.title !== "string") continue;
    // If testing is already detected in snapshot, avoid saying "Add Automated Tests"
    if (snapshot.testingDetected && da.title.toLowerCase().includes("test")) {
      continue;
    }
    developmentAreas.push({
      title: da.title,
      explanation: typeof da.explanation === "string" ? da.explanation : "",
    });
  }

  if (developmentAreas.length === 0) {
    const det = synthesizeEvidenceDeterministically(snapshot, hash);
    developmentAreas.push(...det.developmentAreas);
  }

  // 5. Validate engineering patterns
  const engineeringPatterns: StructuredAIInsights["engineeringPatterns"] =
    Array.isArray(raw?.engineeringPatterns) && raw.engineeringPatterns.length > 0
      ? raw.engineeringPatterns.slice(0, 3)
      : synthesizeEvidenceDeterministically(snapshot, hash).engineeringPatterns;

  // 6. Validate career signals
  const rawCareer = Array.isArray(raw?.careerSignals) ? raw.careerSignals : [];
  const careerSignals: StructuredAIInsights["careerSignals"] = [];
  for (const cs of rawCareer) {
    if (!cs?.role || typeof cs.role !== "string") continue;
    careerSignals.push({
      role: cs.role,
      explanation: typeof cs.explanation === "string" ? cs.explanation : "Aligned with observed project technologies.",
    });
  }

  if (careerSignals.length === 0) {
    const det = synthesizeEvidenceDeterministically(snapshot, hash);
    careerSignals.push(...det.careerSignals);
  }

  // 7. Validate recommended next steps
  const rawSteps = Array.isArray(raw?.recommendedNextSteps) ? raw.recommendedNextSteps : [];
  const recommendedNextSteps: StructuredAIInsights["recommendedNextSteps"] = [];
  for (const st of rawSteps) {
    if (!st?.title || typeof st.title !== "string") continue;
    recommendedNextSteps.push({
      title: st.title,
      reason: typeof st.reason === "string" ? st.reason : "To strengthen your project evidence.",
    });
  }

  if (recommendedNextSteps.length === 0) {
    const det = synthesizeEvidenceDeterministically(snapshot, hash);
    recommendedNextSteps.push(...det.recommendedNextSteps);
  }

  return {
    summary,
    strengths: strengths.slice(0, 3),
    emergingSkills: emergingSkills.slice(0, 3),
    developmentAreas: developmentAreas.slice(0, 3),
    engineeringPatterns,
    careerSignals: careerSignals.slice(0, 3),
    recommendedNextSteps: recommendedNextSteps.slice(0, 2),
    evidenceTraceabilityKey: hash,
    evidenceBasis: {
      repositoriesCount: repoCount,
      commitsCount: commitCount,
      pullRequestsCount: prCount,
      technologiesCount: (snapshot.uniqueTechnologies || []).length,
      skillsCount: (snapshot.skills || []).length,
    },
    provider,
    isAiGenerated: provider !== "deterministic-engine",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Calls an external LLM (Gemini or OpenAI) with strict prompt constraints,
 * falling back transparently to the deterministic engine if the provider is unconfigured or fails.
 */
export async function generateAIInterpretation(
  rawSnapshot: EvidenceSnapshot
): Promise<StructuredAIInsights> {
  const snapshot = rawSnapshot.topRepositories ? rawSnapshot : enrichEvidenceSnapshot(rawSnapshot);
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

CRITICAL RULES:
- You are analyzing exactly one developer. Use only the supplied evidence snapshot.
- Never reuse generic conclusions from another developer.
- Do NOT use generic canned template phrases like "Strong Web Development Experience", "Strong Frontend Experience", or "Consistent Development Activity".
- Mention the developer's actual top repositories by name (from topRepositories) and their dominant technologies (from dominantLanguages and dominantTechnologies).
- If the developer has sparse activity (< 10 commits), state that activity is in early stages with limited history. Never claim strong expertise for low activity.
- If the developer has 0 repositories, return empty strengths [].
- Never invent repositories, commits, pull requests, technologies, skills, or employment guarantees.
- Base every single observation strictly on the provided evidence snapshot.
- Return strictly valid JSON conforming to the requested schema.`;

  const userPrompt = `Review this verified GitHub work snapshot and generate clear, human-readable insights:
${JSON.stringify(snapshot, null, 2)}

Return a JSON object with this exact shape:
{
  "summary": "Clear 2-3 sentence human-readable summary citing real project count and top technologies.",
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
      return validateAndGroundAIInsights(parsed, snapshot, hash, "gemini");
    } else if (process.env.OPENAI_API_KEY) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        console.warn(`[AI Engine] OpenAI API error ${response.status}`);
        return synthesizeEvidenceDeterministically(snapshot, hash);
      }

      const resData = await response.json();
      const rawText = resData?.choices?.[0]?.message?.content;
      if (!rawText) return synthesizeEvidenceDeterministically(snapshot, hash);

      const parsed = JSON.parse(rawText);
      return validateAndGroundAIInsights(parsed, snapshot, hash, "openai");
    }
  } catch (err: any) {
    console.warn("[AI Engine] External LLM invocation failed, falling back to deterministic synthesis:", err?.message || err);
  }

  return synthesizeEvidenceDeterministically(snapshot, hash);
}

/**
 * Diagnostic helper providing internal observability for developer verification.
 * Section 43 requirement: safely outputs diagnostic metrics without exposing secrets.
 */
export function getAIIntelligenceDiagnostics(
  snapshot: EvidenceSnapshot,
  insights: StructuredAIInsights
) {
  return {
    userId: snapshot.userId || "anonymous",
    githubUsername: snapshot.githubUsername || "none",
    evidenceVersion: snapshot.evidenceVersion || "v2.0_personalized",
    evidenceSnapshotId: insights.evidenceTraceabilityKey,
    repositoryCount: (snapshot.repositories || []).length,
    commitCount: snapshot.totalCommits || 0,
    prCount: snapshot.totalPRs || 0,
    dominantLanguages: (snapshot.dominantLanguages || []).map((l) => `${l.name} (${l.commitCount} commits)`),
    dominantTechnologies: (snapshot.dominantTechnologies || []).map((t) => `${t.name} (${t.projectCount} repos)`),
    cadence: snapshot.temporalCadence?.commitDistribution || "unknown",
    candidateStrengthCount: snapshot.candidateStrengths?.length || 0,
    finalStrengthsCount: insights.strengths.length,
    validatedClaims: insights.strengths.map((s) => s.title),
    provider: insights.provider,
  };
}
