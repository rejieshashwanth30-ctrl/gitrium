const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function testSyncRunLifecycle() {
  console.log("=== TESTING SYNCRUN LIFECYCLE IN NEON ===");
  const user = await prisma.userProfile.findFirst();
  if (!user) throw new Error("No user profile found");

  // 1. Create PENDING
  const run = await prisma.syncRun.create({
    data: {
      userId: user.id,
      status: "PENDING",
    },
  });
  console.log("1. Created SyncRun:", run.id, "Status:", run.status);

  // 2. Transition to SYNCING
  const syncing = await prisma.syncRun.update({
    where: { id: run.id },
    data: {
      status: "SYNCING",
      startedAt: new Date(),
    },
  });
  console.log("2. Transitioned to SYNCING:", syncing.id, "Status:", syncing.status);

  // 3. Complete
  const completed = await prisma.syncRun.update({
    where: { id: run.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      repositoriesProcessed: 8,
      commitsProcessed: 67,
      pullRequestsProcessed: 0,
    },
  });
  console.log("3. Transitioned to COMPLETED:", completed.id, "Status:", completed.status);
  console.log(`   Processed ${completed.repositoriesProcessed} repos, ${completed.commitsProcessed} commits`);

  // Verify retrieval
  const retrieved = await prisma.syncRun.findUnique({
    where: { id: run.id },
  });
  console.log("4. Retrieved from Neon successfully:", Boolean(retrieved && retrieved.status === "COMPLETED"));

  await prisma.$disconnect();
}

testSyncRunLifecycle().catch((e) => {
  console.error("SyncRun lifecycle error:", e);
  process.exit(1);
});

