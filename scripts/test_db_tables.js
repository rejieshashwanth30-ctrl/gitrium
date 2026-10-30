const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const rows = await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    console.log("ACTUAL TABLES IN POSTGRESQL:", rows);
  } catch (err) {
    console.error("QUERY ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
