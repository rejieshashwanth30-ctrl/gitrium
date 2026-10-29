import { prisma } from "@/lib/db/prisma";

export interface ComputedSkillEvidence {
  name: string;
  category: "Frontend" | "Backend" | "Mobile" | "Data/AI" | "DevOps" | "Database" | "Architecture" | "Language";
  proficiencyScore: number; // 0 - 100
  evidenceStrength: "Strong Evidence" | "Moderate Evidence" | "Limited Evidence" | "Needs Review";
  evidenceCount: number;
  projectCount: number;
}

/**
 * Computes deterministic skills scoped strictly to selected repositories for a user.
 * Guarantees reproducibility: identical inputs produce identical scores.
 * Removes skills that are no longer supported when repository scope changes.
 */
export async function computeUserSkills(
  userId: string,
  repositoryIds?: string[]
): Promise<ComputedSkillEvidence[]> {
  // Query only repositories in scope (either explicitly passed or marked as isSelected)
  const whereClause: { userId: string; id?: { in: string[] }; isSelected?: boolean } = { userId };
  if (repositoryIds && repositoryIds.length > 0) {
    whereClause.id = { in: repositoryIds };
  } else if (repositoryIds && repositoryIds.length === 0) {
    // Explicitly zero repositories selected: clear all skills
    await prisma.skill.deleteMany({ where: { userId } });
    return [];
  } else {
    // Default to currently selected repositories in database
    whereClause.isSelected = true;
  }

  const repositories = await prisma.repository.findMany({
    where: whereClause,
    include: {
      technologies: true,
      languages: true,
      commits: true,
    },
  });

  if (repositories.length === 0) {
    // Clear previously derived skills since current scope has no repositories
    await prisma.skill.deleteMany({ where: { userId } });
    return [];
  }

  const skillMap: Record<
    string,
    {
      category: ComputedSkillEvidence["category"];
      projects: Set<string>;
      commitCount: number;
      totalWeight: number;
    }
  > = {};

  for (const repo of repositories) {
    // 1. Ingest language evidence
    for (const lang of repo.languages) {
      if (!skillMap[lang.name]) {
        skillMap[lang.name] = {
          category: "Language",
          projects: new Set(),
          commitCount: 0,
          totalWeight: 0,
        };
      }
      skillMap[lang.name].projects.add(repo.id);
      skillMap[lang.name].commitCount += repo.commits.length;
      skillMap[lang.name].totalWeight += Math.round(lang.percentage);
    }

    // 2. Ingest technology evidence
    for (const tech of repo.technologies) {
      if (!skillMap[tech.name]) {
        skillMap[tech.name] = {
          category: (tech.category as ComputedSkillEvidence["category"]) || "Language",
          projects: new Set(),
          commitCount: 0,
          totalWeight: 0,
        };
      }
      skillMap[tech.name].projects.add(repo.id);
      skillMap[tech.name].commitCount += repo.commits.length;
      skillMap[tech.name].totalWeight += Math.round(tech.confidence * 30) + repo.commits.length;
    }
  }

  const results: ComputedSkillEvidence[] = [];

  for (const [name, stats] of Object.entries(skillMap)) {
    const projectCount = stats.projects.size;
    const commitCount = stats.commitCount;

    // Deterministic formula: Project breadth (up to 40) + Commit depth (up to 60)
    const breadthScore = Math.min(projectCount * 20, 40);
    const depthScore = Math.min(commitCount * 3, 60);
    const score = Math.min(98, Math.max(25, Math.round(breadthScore + depthScore)));

    let strength: ComputedSkillEvidence["evidenceStrength"] = "Needs Review";
    if (score >= 80) strength = "Strong Evidence";
    else if (score >= 60) strength = "Moderate Evidence";
    else if (score >= 30) strength = "Limited Evidence";

    results.push({
      name,
      category: stats.category,
      proficiencyScore: score,
      evidenceStrength: strength,
      evidenceCount: commitCount + projectCount,
      projectCount,
    });
  }

  // Sort descending by proficiency score
  results.sort((a, b) => b.proficiencyScore - a.proficiencyScore);

  // Sync with database: remove obsolete skills that are not in the new scope
  const validNames = results.map((r) => r.name);
  await prisma.skill.deleteMany({
    where: {
      userId,
      name: { notIn: validNames },
    },
  });

  // Persist updated skills
  for (const skill of results) {
    await prisma.skill.upsert({
      where: {
        userId_name: {
          userId,
          name: skill.name,
        },
      },
      update: {
        category: skill.category,
        proficiencyScore: skill.proficiencyScore,
        evidenceStrength: skill.evidenceStrength,
        evidenceCount: skill.evidenceCount,
        projectCount: skill.projectCount,
        updatedAt: new Date(),
      },
      create: {
        userId,
        name: skill.name,
        category: skill.category,
        proficiencyScore: skill.proficiencyScore,
        evidenceStrength: skill.evidenceStrength,
        evidenceCount: skill.evidenceCount,
        projectCount: skill.projectCount,
      },
    });
  }

  return results;
}
