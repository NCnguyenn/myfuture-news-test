import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './cache.constants';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        connectTimeout: 1000,
        retryStrategy: () => null,
      }),
    },
    {
      provide: CacheService,
      useFactory: (redis: Redis) => new CacheService(redis),
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
