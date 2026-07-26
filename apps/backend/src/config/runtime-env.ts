export type RuntimeEnv = {
  port: number;
  webOrigin: string;
  databaseUrl: string;
  directUrl: string;
  redisUrl: string;
};

function required(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback?: string,
): string {
  const value = env[name]?.trim() || fallback;
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function validatedUrl(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: string | undefined,
  protocols: string[],
): string {
  const value = required(env, name, fallback);
  const url = parseUrl(value, name);
  if (!protocols.includes(url.protocol)) {
    throw new Error(`${name} has an unsupported protocol`);
  }
  return value;
}

function parseUrl(value: string, name: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL`);
  }
}

function validatedOrigin(
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: string | undefined,
): string {
  const value = required(env, name, fallback);
  const url = parseUrl(value, name);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${name} has an unsupported protocol`);
  }
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.href !== `${url.origin}/`
  ) {
    throw new Error(`${name} must be an origin`);
  }
  return url.origin;
}

export function getRuntimeEnv(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeEnv {
  const production = env.NODE_ENV === 'production';
  const port = Number(env.PORT ?? env.API_PORT ?? 4000);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    port,
    webOrigin: validatedOrigin(
      env,
      'WEB_ORIGIN',
      production ? undefined : 'http://localhost:3000',
    ),
    databaseUrl: validatedUrl(
      env,
      'DATABASE_URL',
      production
        ? undefined
        : 'postgresql://news:news@localhost:5434/myfuture_news',
      ['postgresql:', 'postgres:'],
    ),
    directUrl: validatedUrl(
      env,
      'DIRECT_URL',
      production
        ? undefined
        : 'postgresql://news:news@localhost:5434/myfuture_news',
      ['postgresql:', 'postgres:'],
    ),
    redisUrl: validatedUrl(
      env,
      'REDIS_URL',
      production ? undefined : 'redis://localhost:6379',
      ['redis:', 'rediss:'],
    ),
  };
}
