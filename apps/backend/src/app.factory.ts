import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { getRuntimeEnv } from './config/runtime-env';

export function configureApp(
  app: NestFastifyApplication,
  webOrigin: string,
): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({ origin: webOrigin });
}

export async function createApp() {
  const runtime = getRuntimeEnv();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  configureApp(app, runtime.webOrigin);
  return { app, runtime };
}
