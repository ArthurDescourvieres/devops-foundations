import { Pool } from "pg";
import { getEnv } from "./env.js";

let pool: Pool | null = null;

function getPool(): Pool | null {
  const url = getEnv("DATABASE_URL");
  if (!url) return null;
  if (!pool) {
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

export type DbStatus =
  | { status: "connected"; database: string; timestamp: string }
  | { status: "unavailable"; error: string }
  | { status: "error"; error: string };

export async function getDbStatus(): Promise<DbStatus> {
  const p = getPool();
  if (!p) {
    return { status: "unavailable", error: "DATABASE_URL not set" };
  }
  try {
    const client = await p.connect();
    try {
      const dbResult = await client.query("SELECT current_database() AS name");
      const nowResult = await client.query("SELECT now() AS ts");
      const database = (dbResult.rows[0]?.name as string) ?? "unknown";
      const timestamp = (nowResult.rows[0]?.ts as Date)?.toISOString() ?? new Date().toISOString();
      return { status: "connected", database, timestamp };
    } finally {
      client.release();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: "error", error: message };
  }
}

export function closePool(): Promise<void> {
  if (pool) {
    const p = pool;
    pool = null;
    return p.end();
  }
  return Promise.resolve();
}
