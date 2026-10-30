const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function auditAllTables() {
  const models = [
    { name: "UserProfile", fn: () => prisma.userProfile.findFirst() },
    { name: "GitHubAccount", fn: () => prisma.gitHubAccount.findFirst() },
    { name: "SyncRun", fn: () => prisma.syncRun.findFirst() },
    { name: "Repository", fn: () => prisma.repository.findFirst() },
    { name: "RepositoryLanguage", fn: () => prisma.repositoryLanguage.findFirst() },
    { name: "RepositoryTechnology", fn: () => prisma.repositoryTechnology.findFirst() },
    { name: "Commit", fn: () => prisma.commit.findFirst() },
    { name: "PullRequest", fn: () => prisma.pullRequest.findFirst() },
    { name: "Contribution", fn: () => prisma.contribution.findFirst() },
    { name: "ProjectAnalysis", fn: () => prisma.projectAnalysis.findFirst() },
    { name: "Skill", fn: () => prisma.skill.findFirst() },
    { name: "SkillEvidence", fn: () => prisma.skillEvidence.findFirst() },
    { name: "Evidence", fn: () => prisma.evidence.findFirst() },
    { name: "EvidenceGraphNode", fn: () => prisma.evidenceGraphNode.findFirst() },
    { name: "EvidenceGraphEdge", fn: () => prisma.evidenceGraphEdge.findFirst() },
    { name: "DeveloperAnalysis", fn: () => prisma.developerAnalysis.findFirst() },
    { name: "CareerInsight", fn: () => prisma.careerInsight.findFirst() },
    { name: "AIInsight", fn: () => prisma.aIInsight.findFirst() },
    { name: "Report", fn: () => prisma.report.findFirst() },
  ];

  console.log("=== COMPREHENSIVE NEON POSTGRESQL TABLE AUDIT ===");
  const results = {};
  for (const m of models) {
    try {
      await m.fn();
      results[m.name] = "PASS";
    } catch (err) {
      results[m.name] = "FAIL: " + err.message;
    }
  }

  console.table(results);
  await prisma.$disconnect();
}

auditAllTables();
