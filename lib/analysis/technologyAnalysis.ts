export interface DetectedTechnology {
  name: string;
  category: "Language" | "Framework" | "Database" | "DevOps" | "Testing" | "Architecture" | "Library" | "Mobile";
  confidence: number; // 0.0 - 1.0
  version?: string;
}

// Known architectural signatures and framework detection rules
const SIGNATURE_PATTERNS: Array<{
  name: string;
  category: DetectedTechnology["category"];
  indicatorLanguages: string[];
  repoNameKeywords: string[];
}> = [
  { name: "Next.js", category: "Framework", indicatorLanguages: ["TypeScript", "JavaScript"], repoNameKeywords: ["next", "web", "frontend", "portal"] },
  { name: "React", category: "Framework", indicatorLanguages: ["TypeScript", "JavaScript"], repoNameKeywords: ["react", "ui", "client", "dashboard"] },
  { name: "TypeScript", category: "Language", indicatorLanguages: ["TypeScript"], repoNameKeywords: ["ts"] },
  { name: "Node.js", category: "Framework", indicatorLanguages: ["JavaScript", "TypeScript"], repoNameKeywords: ["api", "server", "backend", "service"] },
  { name: "Python", category: "Language", indicatorLanguages: ["Python"], repoNameKeywords: ["py", "ai", "fastapi", "django", "ml"] },
  { name: "FastAPI", category: "Framework", indicatorLanguages: ["Python"], repoNameKeywords: ["api", "service", "backend"] },
  { name: "Flutter", category: "Mobile", indicatorLanguages: ["Dart"], repoNameKeywords: ["flutter", "mobile", "app"] },
  { name: "Dart", category: "Language", indicatorLanguages: ["Dart"], repoNameKeywords: ["dart"] },
  { name: "PostgreSQL", category: "Database", indicatorLanguages: ["SQL", "TypeScript", "Python"], repoNameKeywords: ["postgres", "pg", "db", "data"] },
  { name: "Prisma", category: "Database", indicatorLanguages: ["TypeScript", "JavaScript"], repoNameKeywords: ["prisma", "orm"] },
  { name: "Docker", category: "DevOps", indicatorLanguages: ["Dockerfile", "Shell"], repoNameKeywords: ["docker", "infra", "deploy"] },
  { name: "Tailwind CSS", category: "Framework", indicatorLanguages: ["CSS", "TypeScript", "JavaScript"], repoNameKeywords: ["tailwind", "ui", "design"] },
  { name: "Jest", category: "Testing", indicatorLanguages: ["TypeScript", "JavaScript"], repoNameKeywords: ["test", "spec"] },
];

export function detectTechnologiesFromRepository(
  repoName: string,
  languages: Array<{ name: string; percentage: number }>
): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];
  const lowerName = repoName.toLowerCase();
  const languageNames = languages.map((l) => l.name);

  // 1. Language-derived technologies
  for (const lang of languages) {
    if (["TypeScript", "JavaScript", "Python", "Dart", "Rust", "Go", "Java", "C++", "HTML", "CSS"].includes(lang.name)) {
      detected.push({
        name: lang.name,
        category: "Language",
        confidence: Math.min(1.0, lang.percentage / 50 + 0.5),
      });
    }
  }

  // 2. Framework and ecosystem heuristics
  for (const pattern of SIGNATURE_PATTERNS) {
    if (detected.some((d) => d.name === pattern.name)) continue;

    const matchesLanguage = pattern.indicatorLanguages.some((il) => languageNames.includes(il));
    const matchesKeyword = pattern.repoNameKeywords.some((kw) => lowerName.includes(kw));

    if (matchesLanguage && matchesKeyword) {
      detected.push({
        name: pattern.name,
        category: pattern.category,
        confidence: 0.85,
      });
    }
  }

  return detected;
}

