const parseNumberEnv = (key: string, fallback: number) => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const rateLimitConfig = {
  windowMs: parseNumberEnv('RATE_LIMIT_WINDOW_MS', 60_000),
  maxRequests: parseNumberEnv('RATE_LIMIT_MAX', 30)
};
