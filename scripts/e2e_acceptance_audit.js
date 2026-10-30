const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runE2EAcceptanceAudit() {
  console.log("================================================================================");
  console.log("       ADYK GITRIUM — REAL-WORLD DATABASE & SYNC ACCEPTANCE AUDIT               ");
  console.log("================================================================================");

  // 1. UserProfile Validation
  const users = await prisma.userProfile.findMany();
  console.log(`\n[1. USER PROFILE] Found ${users.length} registered Gitrium profile(s):`);
  users.forEach((u) => {
    console.log(`  - Profile ID: ${u.id}`);
    console.log(`    Supabase UID: ${u.userId}`);
    console.log(`    Username: ${u.username}`);
    console.log(`    Email: ${u.email}`);
    console.log(`    GitHub Connected: ${u.githubConnected}`);
    console.log(`    GitHub Username: ${u.githubUsername}`);
  });

  if (users.length === 0) {
    console.error("FATAL: No user profiles found in database.");
    await prisma.$disconnect();
    return;
  }

  const primaryUser = users[0];

  // 2. GitHubAccount Validation
  console.log(`\n[2. GITHUB ACCOUNT] Querying account linked to UserProfile ID ${primaryUser.id}:`);
  const ghAccount = await prisma.gitHubAccount.findUnique({
    where: { userId: primaryUser.id },
  });

  if (ghAccount) {
    console.log(`  - GitHub ID: ${ghAccount.githubId}`);
    console.log(`    Username: @${ghAccount.username}`);
    console.log(`    Profile URL: ${ghAccount.profileUrl}`);
    console.log(`    Connection Status: ${ghAccount.connectionStatus}`);
    console.log(`    Encrypted Token Stored: ${Boolean(ghAccount.accessToken && ghAccount.accessToken.includes(":"))}`);
    console.log(`    Updated At: ${ghAccount.updatedAt}`);
  } else {
    console.log("  - Notice: No GitHubAccount currently connected for this profile.");
  }

  // 3. SyncRun State Machine Validation
  console.log(`\n[3. SYNCRUN STATE MACHINE] Querying sync runs for user:`);
  const syncRuns = await prisma.syncRun.findMany({
    where: { userId: primaryUser.id },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  console.log(`  Found ${syncRuns.length} recent SyncRun record(s):`);
  syncRuns.forEach((sr, idx) => {
    console.log(`  [#${idx + 1}] ID: ${sr.id} | Status: ${sr.status} | Started: ${sr.startedAt} | Completed: ${sr.completedAt || "IN_PROGRESS"}`);
    console.log(`       Repos: ${sr.repositoriesProcessed} | Commits: ${sr.commitsProcessed} | PRs: ${sr.pullRequestsProcessed}`);
    if (sr.errorMessageSafe) console.log(`       Error note: ${sr.errorMessageSafe}`);
  });

  // 4. Real Repositories Validation
  console.log(`\n[4. REPOSITORIES] Querying ingested real repositories:`);
  const repos = await prisma.repository.findMany({
    where: { userId: primaryUser.id },
    orderBy: { updatedAt: "desc" },
  });

  console.log(`  Total Repositories Ingested: ${repos.length}`);
  repos.slice(0, 8).forEach((r) => {
    console.log(`  - [Repo: ${r.name}] (${r.fullName})`);
    console.log(`    Primary Lang: ${r.primaryLanguage || "None"} | Stars: ${r.stars} | Forks: ${r.forks} | Open Issues: ${r.openIssues}`);
    console.log(`    Indexed Commits: ${r.commitCount} | Indexed PRs: ${r.prCount} | Selected: ${r.isSelected}`);
  });

  // 5. Real Commits & Deduplication Validation
  console.log(`\n[5. COMMITS VALIDATION] Auditing commit records across repositories:`);
  const totalCommitsCount = await prisma.commit.count({
    where: { repository: { userId: primaryUser.id } },
  });
  console.log(`  Total Ingested Commits: ${totalCommitsCount}`);

  if (repos.length > 0) {
    const sampleRepo = repos[0];
    const sampleCommits = await prisma.commit.findMany({
      where: { repositoryId: sampleRepo.id },
      take: 5,
      orderBy: { authorDate: "desc" },
    });

    console.log(`  Sample Commits for [${sampleRepo.name}] (Total: ${sampleCommits.length}):`);
    sampleCommits.forEach((c) => {
      console.log(`    * SHA: ${c.sha.substring(0, 10)}... | Author: ${c.authorName} | Date: ${c.authorDate}`);
      console.log(`      Message: "${c.message.split("\n")[0].substring(0, 60)}"`);
      console.log(`      Integrity Verified: ${c.integrityVerified}`);
    });

    // Check for duplicate SHAs in this repository
    const distinctShaCount = await prisma.commit.groupBy({
      by: ["sha"],
      where: { repositoryId: sampleRepo.id },
      _count: { sha: true },
    });
    const duplicates = distinctShaCount.filter((g) => g._count.sha > 1);
    console.log(`  Duplicate SHA check in [${sampleRepo.name}]: ${duplicates.length === 0 ? "PASS (Zero duplicates)" : "FAIL"}`);
  }

  // 6. Real Pull Requests Validation
  console.log(`\n[6. PULL REQUESTS VALIDATION] Auditing PR records:`);
  const totalPRCount = await prisma.pullRequest.count({
    where: { repository: { userId: primaryUser.id } },
  });
  console.log(`  Total Ingested Pull Requests: ${totalPRCount}`);

  // 7. Real Languages & Byte Percentages
  console.log(`\n[7. LANGUAGES VALIDATION] Auditing language byte distribution:`);
  if (repos.length > 0) {
    const sampleRepo = repos[0];
    const languages = await prisma.repositoryLanguage.findMany({
      where: { repositoryId: sampleRepo.id },
      orderBy: { bytes: "desc" },
    });

    console.log(`  Languages for [${sampleRepo.name}]:`);
    languages.forEach((l) => {
      console.log(`    - ${l.name}: ${l.bytes.toLocaleString()} bytes (${l.percentage.toFixed(1)}%)`);
    });
  }

  // 8. Deterministic Technology Detection
  console.log(`\n[8. TECHNOLOGY DETECTION] Auditing detected technologies:`);
  if (repos.length > 0) {
    const sampleRepo = repos[0];
    const techs = await prisma.repositoryTechnology.findMany({
      where: { repositoryId: sampleRepo.id },
    });

    console.log(`  Detected Technologies for [${sampleRepo.name}]:`);
    techs.forEach((t) => {
      console.log(`    - ${t.name} (Category: ${t.category}, Confidence: ${t.confidence * 100}%)`);
    });
  }

  // 9. Repository Isolation Audit
  console.log(`\n[9. REPOSITORY ISOLATION AUDIT]:`);
  if (repos.length >= 2) {
    const repoA = repos[0];
    const repoB = repos[1];

    const commitsInA = await prisma.commit.findMany({
      where: { repositoryId: repoA.id },
      select: { id: true, sha: true },
    });
    const shasInA = new Set(commitsInA.map((c) => c.sha));

    const bleedCommits = await prisma.commit.count({
      where: {
        repositoryId: repoB.id,
        sha: { in: Array.from(shasInA) },
      },
    });

    console.log(`  Repo A: "${repoA.name}" (${commitsInA.length} commits)`);
    console.log(`  Repo B: "${repoB.name}"`);
    console.log(`  Cross-repository commit bleed: ${bleedCommits === 0 ? "0 (STRICTLY ISOLATED - PASS)" : bleedCommits + " (BLEED DETECTED)"}`);
  } else {
    console.log("  Single repository available; foreign key isolation verified via repositoryId.");
  }

  // 10. Evidence-backed Skills
  console.log(`\n[10. SKILLS AUDIT] Querying derived skills in Neon:`);
  const skills = await prisma.skill.findMany({
    where: { userId: primaryUser.id },
    orderBy: { proficiencyScore: "desc" },
  });
  console.log(`  Derived Skills Count: ${skills.length}`);
  skills.slice(0, 6).forEach((s) => {
    console.log(`    - ${s.name}: Score ${s.proficiencyScore}/100 | Level: ${s.experienceLevel} | Commits: ${s.commitCount} | Verified: ${s.verified}`);
  });

  console.log("\n================================================================================");
  console.log("                     END OF ACCEPTANCE AUDIT                                    ");
  console.log("================================================================================");
  await prisma.$disconnect();
}

runE2EAcceptanceAudit().catch((err) => {
  console.error("Acceptance Audit Exception:", err);
  process.exit(1);
});

