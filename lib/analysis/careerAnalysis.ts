export interface RoleMatchAnalysis {
  roleTitle: string;
  roleDescription: string;
  matchPercentage: number;
  alignment: "High Alignment" | "Moderate Alignment" | "Developing" | "Insufficient Evidence";
  alignmentScore: number; // 0 - 100 for backward compatibility
  matchConfidence: "High Alignment" | "Moderate Alignment" | "Developing" | "Insufficient Evidence";
  demonstratedSkills: string[];
  evidenceBackedStrengths: string[];
  missingEvidenceAreas: string[];
  recommendedProjects: string[];
  strengths: string[]; // backward compatibility
  skillGaps: string[]; // backward compatibility
}

const BENCHMARKS: Array<{
  role: string;
  description: string;
  requiredSkills: string[];
  recommendedProjects: string[];
}> = [
  {
    role: "Full-Stack Systems Engineer",
    description: "Design and implement scalable multi-tier architectures, backend services, and interactive client applications.",
    requiredSkills: ["TypeScript", "Next.js", "React", "PostgreSQL", "JavaScript", "HTML", "CSS"],
    recommendedProjects: ["High-throughput API Gateway with Rate Limiting", "Distributed Job Queue with Redis"],
  },
  {
    role: "Frontend Architect",
    description: "Lead UI architecture, design systems, deterministic state machines, and performant web applications.",
    requiredSkills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    recommendedProjects: ["Design System Component Library", "AST Code Inspector Dashboard"],
  },
  {
    role: "Mobile Applications Engineer",
    description: "Develop resilient cross-platform or native mobile client applications with offline-first synchronization.",
    requiredSkills: ["Flutter", "Dart", "C++", "Objective-C", "Swift"],
    recommendedProjects: ["Offline-first Sync Engine", "Golden Test UI Automation Suite"],
  },
  {
    role: "AI & Backend Application Engineer",
    description: "Build robust backend architectures integrating automated intelligence, vector retrieval, and deterministic data layers.",
    requiredSkills: ["Python", "FastAPI", "TypeScript", "JavaScript"],
    recommendedProjects: ["Vector Retrieval Pipeline", "Deterministic Evaluation Harness"],
  },
];

export function computeCareerRoleMatches(observedSkillNames: string[]): RoleMatchAnalysis[] {
  if (!Array.isArray(observedSkillNames) || observedSkillNames.length === 0) {
    return BENCHMARKS.map((b) => ({
      roleTitle: b.role,
      roleDescription: b.description,
      matchPercentage: 0,
      alignment: "Insufficient Evidence",
      alignmentScore: 0,
      matchConfidence: "Insufficient Evidence",
      demonstratedSkills: [],
      evidenceBackedStrengths: [],
      missingEvidenceAreas: b.requiredSkills,
      recommendedProjects: b.recommendedProjects,
      strengths: [],
      skillGaps: b.requiredSkills,
    }));
  }

  const normalizedSkills = observedSkillNames.map((s) => (s || "").toLowerCase());

  return BENCHMARKS.map((benchmark) => {
    const matched = benchmark.requiredSkills.filter((req) =>
      normalizedSkills.includes(req.toLowerCase())
    );
    const missing = benchmark.requiredSkills.filter(
      (req) => !normalizedSkills.includes(req.toLowerCase())
    );

    // Score based on proportion of matched required skills
    const matchRatio = matched.length / benchmark.requiredSkills.length;
    const matchPercentage = Math.min(95, Math.round(matchRatio * 90 + (matched.length > 0 ? 5 : 0)));

    let alignment: RoleMatchAnalysis["alignment"] = "Developing";
    if (matchPercentage >= 75) alignment = "High Alignment";
    else if (matchPercentage >= 50) alignment = "Moderate Alignment";
    else if (matchPercentage === 0) alignment = "Insufficient Evidence";

    return {
      roleTitle: benchmark.role,
      roleDescription: benchmark.description,
      matchPercentage,
      alignment,
      alignmentScore: matchPercentage,
      matchConfidence: alignment,
      demonstratedSkills: matched,
      evidenceBackedStrengths: matched.map((s) => `Demonstrated implementation history with ${s}`),
      missingEvidenceAreas: missing,
      recommendedProjects: benchmark.recommendedProjects,
      strengths: matched,
      skillGaps: missing,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
}
