import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly redis?: Redis) {
    this.redis?.on('error', (error) => {
      this.logger.warn(`Redis connection error: ${this.errorMessage(error)}`);
    });
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const client = this.client();
      await this.ensureConnected(client);
      const value = await client.get(key);
      if (value === null) {
        this.logCacheEvent('MISS', key);
        return null;
      }

      try {
        const parsed = JSON.parse(value) as T;
        this.logCacheEvent('HIT', key);
        return parsed;
      } catch (error) {
        this.logger.warn(`Redis cache JSON parse failed for ${key}: ${this.errorMessage(error)}`);
        return null;
      }
    } catch (error) {
      this.logger.warn(`Redis cache read failed for ${key}: ${this.errorMessage(error)}`);
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
    try {
      const client = this.client();
      await this.ensureConnected(client);
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch (error) {
      this.logger.warn(`Redis cache write failed for ${key}: ${this.errorMessage(error)}`);
      return false;
    }
  }

  async deleteByPrefix(prefix = 'news:'): Promise<number> {
    try {
      const client = this.client();
      await this.ensureConnected(client);
      let cursor = '0';
      let deleted = 0;

      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          deleted += await client.del(...keys);
        }
      } while (cursor !== '0');

      return deleted;
    } catch (error) {
      this.logger.warn(`Redis cache delete failed for ${prefix}*: ${this.errorMessage(error)}`);
      return 0;
    }
  }

  async onModuleDestroy() {
    if (this.redis && this.redis.status !== 'end') {
      this.redis.disconnect();
    }
  }

  private client(): Redis {
    if (!this.redis) {
      throw new Error('Redis client is not configured');
    }
    return this.redis;
  }

  private async ensureConnected(client: Redis) {
    if (client.status !== 'ready') {
      await client.connect();
    }
  }

  private logCacheEvent(event: 'HIT' | 'MISS', key: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[cache] ${event} ${key}`);
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
