const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function inspectProfiles() {
  const profiles = await prisma.userProfile.findMany({
    include: {
      githubAccount: true,
      repositories: { select: { id: true, name: true, primaryLanguage: true, commitCount: true } },
      skills: { select: { name: true, proficiencyScore: true } },
      aiInsights: { select: { id: true, evidenceTraceabilityKey: true, observedStrengths: true, generatedAt: true } },
    }
  });

  console.log("Total profiles:", profiles.length);
  for (const p of profiles) {
    console.log("--- Profile:", p.id, p.email, "@" + (p.githubAccount?.username || p.username));
    console.log("  Repos:", p.repositories.length, p.repositories.map(r => `${r.name}(${r.primaryLanguage}:${r.commitCount})`));
    console.log("  Skills count:", p.skills.length);
    console.log("  AIInsights count:", p.aiInsights.length);
    if (p.aiInsights.length > 0) {
      console.log("  Latest AIInsight strengths:", p.aiInsights[0].observedStrengths);
    }
  }
}

inspectProfiles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

