export interface RoleMatchAnalysis {
  roleTitle: string;
  alignmentScore: number; // 0 - 100
  matchConfidence: "High Alignment" | "Moderate Alignment" | "Developing" | "Insufficient Evidence";
  strengths: string[];
  skillGaps: string[];
  recommendedProjects: string[];
}

const BENCHMARKS: Array<{
  role: string;
  requiredSkills: string[];
  recommendedProjects: string[];
}> = [
  {
    role: "Full-Stack Systems Engineer",
    requiredSkills: ["TypeScript", "Next.js", "React", "PostgreSQL", "JavaScript", "HTML", "CSS"],
    recommendedProjects: ["High-throughput API Gateway with Rate Limiting", "Distributed Job Queue with Redis"],
  },
  {
    role: "Frontend Architect",
    requiredSkills: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
    recommendedProjects: ["Design System Component Library", "AST Code Inspector Dashboard"],
  },
  {
    role: "Mobile Applications Engineer",
    requiredSkills: ["Flutter", "Dart", "C++", "Objective-C", "Swift"],
    recommendedProjects: ["Offline-first Sync Engine", "Golden Test UI Automation Suite"],
  },
  {
    role: "AI & Backend Application Engineer",
    requiredSkills: ["Python", "FastAPI", "TypeScript", "JavaScript"],
    recommendedProjects: ["Vector Retrieval Pipeline", "Deterministic Evaluation Harness"],
  },
];

export function computeCareerRoleMatches(observedSkillNames: string[]): RoleMatchAnalysis[] {
  if (observedSkillNames.length === 0) {
    return BENCHMARKS.map((b) => ({
      roleTitle: b.role,
      alignmentScore: 0,
      matchConfidence: "Insufficient Evidence",
      strengths: [],
      skillGaps: b.requiredSkills,
      recommendedProjects: b.recommendedProjects,
    }));
  }

  const normalizedSkills = observedSkillNames.map((s) => s.toLowerCase());

  return BENCHMARKS.map((benchmark) => {
    const matched = benchmark.requiredSkills.filter((req) =>
      normalizedSkills.includes(req.toLowerCase())
    );
    const missing = benchmark.requiredSkills.filter(
      (req) => !normalizedSkills.includes(req.toLowerCase())
    );

    // Score based on proportion of matched required skills
    const matchRatio = matched.length / benchmark.requiredSkills.length;
    const alignmentScore = Math.min(95, Math.round(matchRatio * 90 + (matched.length > 0 ? 5 : 0)));

    let matchConfidence: RoleMatchAnalysis["matchConfidence"] = "Developing";
    if (alignmentScore >= 75) matchConfidence = "High Alignment";
    else if (alignmentScore >= 50) matchConfidence = "Moderate Alignment";
    else if (alignmentScore === 0) matchConfidence = "Insufficient Evidence";

    return {
      roleTitle: benchmark.role,
      alignmentScore,
      matchConfidence,
      strengths: matched,
      skillGaps: missing,
      recommendedProjects: benchmark.recommendedProjects,
    };
  }).sort((a, b) => b.alignmentScore - a.alignmentScore);
}
