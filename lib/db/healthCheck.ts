import { prisma } from "@/lib/db/prisma";

export type DatabaseHealthStatus =
  | "DATABASE_SCHEMA_HEALTHY"
  | "DATABASE_SCHEMA_MISSING"
  | "DATABASE_UNREACHABLE"
  | "DATABASE_AUTH_FAILED"
  | "DATABASE_TIMEOUT";

export interface DatabaseHealthResult {
  status: DatabaseHealthStatus;
  healthy: boolean;
  missingTables?: string[];
  errorCode?: string;
  errorMessageSafe?: string;
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
 * Deterministic database and schema health check.
 * Strictly separates reachable/healthy from missing schema, unreachable host,
 * authentication failures, or connection timeouts.
 * NEVER returns a fake or indefinite 'SYNCING' state.
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
        status: "DATABASE_SCHEMA_MISSING",
        healthy: false,
        missingTables: missing,
        errorMessageSafe: `Required tables missing: ${missing.join(", ")}`,
      };
    }

    return {
      status: "DATABASE_SCHEMA_HEALTHY",
      healthy: true,
    };
  } catch (error: any) {
    const msg = error?.message || String(error);
    const code = error?.code || "";

    console.error("[DATABASE_HEALTH] Database health check error:", {
      code,
      message: msg,
    });

    let status: DatabaseHealthStatus = "DATABASE_UNREACHABLE";
    let errorMessageSafe = "Unable to reach PostgreSQL database";

    if (
      code === "P1000" ||
      msg.includes("Authentication failed") ||
      msg.includes("password authentication failed")
    ) {
      status = "DATABASE_AUTH_FAILED";
      errorMessageSafe = "Database authentication failed";
    } else if (
      code === "P1008" ||
      msg.includes("timed out") ||
      msg.includes("ETIMEDOUT")
    ) {
      status = "DATABASE_TIMEOUT";
      errorMessageSafe = "Database connection timed out";
    } else if (
      code === "P1001" ||
      msg.includes("Can't reach database server")
    ) {
      status = "DATABASE_UNREACHABLE";
      errorMessageSafe = "Cannot reach PostgreSQL server";
    }

    return {
      status,
      healthy: false,
      errorCode: code || undefined,
      errorMessageSafe,
    };
  }
}
