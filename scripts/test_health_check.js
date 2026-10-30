const { verifyDatabaseSchema } = require("../lib/db/healthCheck");

async function test() {
  try {
    console.log("Calling verifyDatabaseSchema()...");
    const result = await verifyDatabaseSchema();
    console.log("Health check result:", result);
  } catch (err) {
    console.error("Health check error:", err);
  }
}

test();
