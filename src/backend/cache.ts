import { createClient, type RedisClientType } from "redis";

export type CacheStatus =
  | { status: "ok"; visits: number }
  | { status: "unavailable"; error: string }
  | { status: "error"; error: string };

type RedisConfig = {
  url: string;
};

const VISITS_KEY = "visits:counter";

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

function getEnv(key: string): string | undefined {
  const env =
    (globalThis as any)?.process?.env as
      | Record<string, string | undefined>
      | undefined;
  const raw = env?.[key];
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getRedisConfig(): RedisConfig | null {
  const urlFromEnv = getEnv("REDIS_URL");
  if (urlFromEnv) {
    return { url: urlFromEnv };
  }

  const host = getEnv("REDIS_HOST");
  const port = getEnv("REDIS_PORT");
  const db = getEnv("REDIS_DB");

  if (!host || !port) {
    return null;
  }

  const dbSuffix = db ? `/${encodeURIComponent(db)}` : "";
  return { url: `redis://${host}:${port}${dbSuffix}` };
}

async function getRedisClient(): Promise<RedisClientType | null> {
  const config = getRedisConfig();
  if (!config) {
    return null;
  }

  if (client) {
    return client;
  }

  if (!connecting) {
    const newClient: RedisClientType = createClient({ url: config.url });
    newClient.on("error", (_err: unknown) => {
      // Erreurs Redis déjà remontées via getCacheStatus
    });
    connecting = newClient
      .connect()
      .then(() => {
        client = newClient;
        return newClient;
      })
      .catch((err: unknown) => {
        client = null;
        connecting = null;
        throw err;
      });
  }

  return connecting;
}

export async function getCacheStatus(): Promise<CacheStatus> {
  const config = getRedisConfig();
  if (!config) {
    return {
      status: "unavailable",
      error: "Redis configuration not set (REDIS_URL or REDIS_HOST/REDIS_PORT/REDIS_DB)",
    };
  }

  try {
    const redisClient = await getRedisClient();
    if (!redisClient) {
      return {
        status: "error",
        error: "Failed to create Redis client",
      };
    }

    const visits = await redisClient.incr(VISITS_KEY);
    return {
      status: "ok",
      visits,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: "error",
      error: message,
    };
  }
}

export async function closeRedisClient(): Promise<void> {
  if (client) {
    const current = client;
    client = null;
    connecting = null;
    await current.disconnect();
  }
}

