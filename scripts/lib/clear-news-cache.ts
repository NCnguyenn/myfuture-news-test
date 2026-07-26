import Redis from 'ioredis';

export type ClearNewsCacheResult = {
  deleted: number;
  skipped: boolean;
  reason?: string;
};

/**
 * Deletes Redis keys under the news: prefix used by the API cache-aside layer.
 * Safe to call when Redis is unavailable: returns skipped instead of throwing.
 */
export async function clearNewsCache(
  redisUrl: string | undefined,
  prefix = 'news:',
): Promise<ClearNewsCacheResult> {
  const url = redisUrl?.trim();
  if (!url) {
    return {
      deleted: 0,
      skipped: true,
      reason: 'REDIS_URL is not configured',
    };
  }

  const redis = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    retryStrategy: () => null,
  });

  try {
    if (redis.status !== 'ready') {
      await redis.connect();
    }

    let cursor = '0';
    let deleted = 0;
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      if (keys.length > 0) {
        deleted += await redis.del(...keys);
      }
    } while (cursor !== '0');

    return { deleted, skipped: false };
  } catch (error) {
    return {
      deleted: 0,
      skipped: true,
      reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    try {
      redis.disconnect();
    } catch {
      // ignore disconnect failures
    }
  }
}
