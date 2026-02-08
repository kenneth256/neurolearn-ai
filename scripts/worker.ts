
import { videoGenerationWorker } from "../app/api/lib/videoQue/video-generation-worker"; 



process.on('SIGTERM', async () => {
  console.log('⏹️  Shutting down worker gracefully...');
  await videoGenerationWorker.close();
  process.exit(0);
});