import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createApp } from './app.factory';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

async function bootstrap() {
  const { app, runtime } = await createApp();
  await app.listen(runtime.port, '0.0.0.0');
}

void bootstrap();
