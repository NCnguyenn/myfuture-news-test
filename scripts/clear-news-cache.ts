import 'dotenv/config';
import { clearNewsCache } from './lib/clear-news-cache';

async function main() {
  const result = await clearNewsCache(process.env.REDIS_URL);
  console.log(
    JSON.stringify({
      status: result.skipped ? 'skipped' : 'ok',
      deleted: result.deleted,
      reason: result.reason,
    }),
  );
  if (result.skipped && result.reason !== 'REDIS_URL is not configured') {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
