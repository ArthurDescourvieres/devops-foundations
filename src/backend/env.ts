type EnvRecord = Record<string, string | undefined>;

function getRawEnv(): EnvRecord | undefined {
  const env = (globalThis as any)?.process?.env as EnvRecord | undefined;
  return env;
}

export function getEnv(key: string): string | undefined {
  const raw = getRawEnv()?.[key];
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getNumberEnv(key: string): number | undefined {
  const value = getEnv(key);
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

function parseCommaSeparated(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}


export function requireCommaSeparatedEnv(key: string): string[] {
  const raw = getEnv(key);
  if (!raw) {
    throw new Error(
      `Variable d'environnement ${key} est obligatoire (valeurs séparées par des virgules).`
    );
  }
  const list = parseCommaSeparated(raw);
  if (list.length === 0) {
    throw new Error(
      `Variable d'environnement ${key} doit contenir au moins une valeur.`
    );
  }
  return list;
}


export function requireListenPortEnv(key: string): number {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Variable d'environnement ${key} est obligatoire (port TCP).`);
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(
      `Variable d'environnement ${key} doit être un entier entre 1 et 65535.`
    );
  }
  return parsed;
}

const DEFAULT_CORS_ALLOW_METHODS = "GET,POST,OPTIONS";
const DEFAULT_CORS_ALLOW_HEADERS = "Content-Type,Accept";

export function getCorsAllowMethods(): string[] {
  const raw = getEnv("CORS_ALLOW_METHODS");
  return parseCommaSeparated(raw ?? DEFAULT_CORS_ALLOW_METHODS);
}

export function getCorsAllowHeaders(): string[] {
  const raw = getEnv("CORS_ALLOW_HEADERS");
  return parseCommaSeparated(raw ?? DEFAULT_CORS_ALLOW_HEADERS);
}

