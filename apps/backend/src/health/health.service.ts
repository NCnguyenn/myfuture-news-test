import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly logger = new Logger(HealthService.name);
  private redisClient: Redis | null = null;

  constructor(private readonly prisma: PrismaService) {}

  private getRedisClient(): Redis {
    if (!this.redisClient) {
      const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
      this.redisClient = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });
      this.redisClient.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}`);
      });
    }
    return this.redisClient;
  }

  async checkHealth() {
    let postgresStatus: 'up' | 'down' = 'down';
    let redisStatus: 'up' | 'down' = 'down';

    // 1. Postgres probe
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      postgresStatus = 'up';
    } catch (err: any) {
      this.logger.warn(`PostgreSQL probe failed: ${err?.message ?? err}`);
      postgresStatus = 'down';
    }

    // 2. Redis probe
    try {
      const redis = this.getRedisClient();
      if (redis.status !== 'ready' && redis.status !== 'connecting') {
        await redis.connect();
      }
      const pong = await redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'up';
      }
    } catch (err: any) {
      this.logger.warn(`Redis probe failed: ${err?.message ?? err}`);
      redisStatus = 'down';
      if (this.redisClient) {
        try {
          this.redisClient.disconnect();
        } catch {
          // ignore disconnect errors
        }
        this.redisClient = null;
      }
    }

    // 3. Overall status
    let status: 'ok' | 'degraded' | 'error' = 'ok';
    if (postgresStatus === 'down' && redisStatus === 'down') {
      status = 'error';
    } else if (postgresStatus === 'down' || redisStatus === 'down') {
      status = 'degraded';
    }

    return {
      data: {
        status,
        service: 'myfuture-news-api',
        checks: {
          api: 'up' as const,
          postgres: postgresStatus,
          redis: redisStatus,
        },
      },
    };
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        this.redisClient.disconnect();
      } catch {
        // ignore
      }
      this.redisClient = null;
    }
  }
}
