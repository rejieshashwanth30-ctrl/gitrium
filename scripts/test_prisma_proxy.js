const { prisma } = require("../lib/db/prisma");

async function test() {
  try {
    console.log("Testing prisma.$queryRawUnsafe...");
    const res = await prisma.$queryRawUnsafe("SELECT 1 as val;");
    console.log("Query result:", res);

    console.log("Testing prisma.userProfile.findFirst...");
    const user = await prisma.userProfile.findFirst();
    console.log("User result:", user ? user.id : "null");

    console.log("Testing prisma.$transaction...");
    const txRes = await prisma.$transaction(async (tx) => {
      return await tx.userProfile.count();
    });
    console.log("Tx result:", txRes);
  } catch (err) {
    console.error("PROXY TEST ERROR:", err);
  }
}

test();
