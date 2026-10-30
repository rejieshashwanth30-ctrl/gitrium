import { prisma } from "@/lib/db/prisma";

export interface GraphData {
  nodes: Array<{
    id: string;
    type: "developer" | "repository" | "technology" | "skill" | "evidence";
    label: string;
    subLabel?: string;
    metric?: string;
    group: string;
    status: string;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    dashed?: boolean;
  }>;
}

export async function generateUserEvidenceGraph(
  userId: string,
  repositoryIds?: string[]
): Promise<GraphData> {
  const user = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: {
      repositories: {
        where: repositoryIds && repositoryIds.length > 0
          ? { id: { in: repositoryIds } }
          : { isSelected: true },
        include: {
          technologies: true,
        },
      },
      skills: {
        take: 12,
        orderBy: { proficiencyScore: "desc" },
      },
    },
  });

  if (!user || user.repositories.length === 0) {
    return {
      nodes: user
        ? [
            {
              id: `node-dev-${user.id}`,
              type: "developer",
              label: user.displayName,
              subLabel: `@${user.githubUsername || user.username}`,
              metric: "0 Repositories Selected",
              group: "root",
              status: "pending",
            },
          ]
        : [],
      edges: [],
    };
  }

  const nodes: GraphData["nodes"] = [];
  const edges: GraphData["edges"] = [];

  // 1. Root Node: Developer
  const devNodeId = `node-dev-${user.id}`;
  nodes.push({
    id: devNodeId,
    type: "developer",
    label: user.displayName,
    subLabel: `@${user.githubUsername || user.username}`,
    metric: `${user.repositories.length} Repos Audited`,
    group: "root",
    status: "verified",
  });

  // 2. Repository Nodes
  user.repositories.forEach((repo) => {
    const repoNodeId = `node-repo-${repo.id}`;
    nodes.push({
      id: repoNodeId,
      type: "repository",
      label: repo.name,
      subLabel: repo.primaryLanguage || "Repository",
      metric: `${repo.commitCount || 0} commits`,
      group: "repository",
      status: "verified",
    });

    edges.push({
      id: `edge-${devNodeId}-${repoNodeId}`,
      source: devNodeId,
      target: repoNodeId,
      label: "authors",
      animated: true,
    });

    // 3. Technology Nodes linked to repository
    repo.technologies.slice(0, 3).forEach((tech) => {
      const techNodeId = `node-tech-${repo.id}-${tech.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      nodes.push({
        id: techNodeId,
        type: "technology",
        label: tech.name,
        subLabel: tech.category,
        metric: `${Math.round(tech.confidence * 100)}% AST`,
        group: "technology",
        status: "verified",
      });

      edges.push({
        id: `edge-${repoNodeId}-${techNodeId}`,
        source: repoNodeId,
        target: techNodeId,
        label: "uses",
      });
    });
  });

  // 4. Skill Nodes linked to developer (filtered strictly to technologies in audited repositories)
  const relevantTechNames = new Set(
    user.repositories.flatMap((r) => [
      (r.primaryLanguage || "").toLowerCase(),
      ...(r.technologies || []).map((t) => t.name.toLowerCase()),
    ]).filter(Boolean)
  );

  const activeSkills = user.skills.filter((s) =>
    relevantTechNames.size === 0 || relevantTechNames.has(s.name.toLowerCase())
  );

  activeSkills.forEach((skill) => {
    const skillNodeId = `node-skill-${skill.id}`;
    nodes.push({
      id: skillNodeId,
      type: "skill",
      label: skill.name,
      subLabel: skill.category,
      metric: `${skill.proficiencyScore}% Evidence`,
      group: "skill",
      status: "verified",
    });

    edges.push({
      id: `edge-${devNodeId}-${skillNodeId}`,
      source: devNodeId,
      target: skillNodeId,
      label: "demonstrates",
      dashed: true,
    });
  });

  return { nodes, edges };
}
