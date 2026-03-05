import { videoGenerationWorker } from "../app/api/lib/videoQue/video-generation-worker";
import { spacedRepetitionWorker } from "../app/api/lib/spacedRepetition/worker";
import { registerDailySpacedRepetitionCron } from "../app/api/lib/spacedRepetition/queue";

// Register the daily repeating 8:00 AM Cron task for Predictive Forgetting
registerDailySpacedRepetitionCron().catch(console.error);

process.on('SIGTERM', async () => {
  console.log('⏹️  Shutting down workers gracefully...');
  await videoGenerationWorker.close();
  await spacedRepetitionWorker.close();
  process.exit(0);
});