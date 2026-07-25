import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { configureApp } from './app.factory';
import { AppModule } from './app.module';
import { getRuntimeEnv } from './config/runtime-env';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const runtime = getRuntimeEnv();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  configureApp(app, runtime.webOrigin);
  await app.listen(runtime.port, '0.0.0.0');
}

void bootstrap();
