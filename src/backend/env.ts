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

