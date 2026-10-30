import { prisma } from "@/lib/db/prisma";

export interface DatabaseHealthResult {
  healthy: boolean;
  missingTables?: string[];
  error?: string;
}

const REQUIRED_TABLES = [
  "UserProfile",
  "GitHubAccount",
  "SyncRun",
  "Repository",
  "Commit",
  "PullRequest",
  "Skill",
  "Report",
];

/**
 * Validates that essential relational tables physically exist in PostgreSQL.
 * Catches schema drift or un-migrated database environments early before runtime crashes.
 */
export async function verifyDatabaseSchema(): Promise<DatabaseHealthResult> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

    const existingTables = new Set(rows.map((r) => r.table_name));
    const missing = REQUIRED_TABLES.filter((t) => !existingTables.has(t));

    if (missing.length > 0) {
      console.error(`[DATABASE_HEALTH] Missing required tables: ${missing.join(", ")}`);
      return {
        healthy: false,
        missingTables: missing,
      };
    }

    return { healthy: true };
  } catch (error: any) {
    console.error("[DATABASE_HEALTH] Failed to verify database schema:", error?.message || error);
    return {
      healthy: false,
      error: error?.message || "Database connection failure",
    };
  }
}
