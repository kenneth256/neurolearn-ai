/*
  Warnings:

  - The values [EXPERT] on the enum `CourseLevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "MoodType" AS ENUM ('ENGAGED', 'NEUTRAL', 'BORED', 'FRUSTRATED', 'CONFUSED', 'EXCITED', 'OVERWHELMED');

-- CreateEnum
CREATE TYPE "QuizDifficulty" AS ENUM ('VERY_EASY', 'EASY', 'MODERATE', 'CHALLENGING', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "SegmentStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "CourseLevel_new" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
ALTER TABLE "courses" ALTER COLUMN "level" TYPE "CourseLevel_new" USING ("level"::text::"CourseLevel_new");
ALTER TYPE "CourseLevel" RENAME TO "CourseLevel_old";
ALTER TYPE "CourseLevel_new" RENAME TO "CourseLevel";
DROP TYPE "CourseLevel_old";
COMMIT;

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "lessonModuleId" TEXT,
    "courseModuleId" TEXT,
    "mood" "MoodType" NOT NULL,
    "intensity" INTEGER NOT NULL,
    "trigger" TEXT,
    "context" TEXT,
    "actionTaken" TEXT,
    "wasHelpful" BOOLEAN,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptive_quizzes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonModuleId" TEXT,
    "courseModuleId" TEXT,
    "generatedBy" TEXT NOT NULL DEFAULT 'AI',
    "adaptationReason" TEXT,
    "difficultyLevel" "QuizDifficulty" NOT NULL,
    "questions" JSONB NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "estimatedDuration" INTEGER NOT NULL,
    "focusAreas" JSONB,
    "questionTypes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "adaptive_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "adaptiveQuizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "incorrectAnswers" INTEGER NOT NULL,
    "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL,
    "averageTimePerQuestion" DOUBLE PRECISION NOT NULL,
    "struggledQuestions" JSONB,
    "aiFeedback" TEXT,
    "strengthAreas" JSONB,
    "improvementAreas" JSONB,
    "nextSteps" JSONB,
    "completionPattern" TEXT,
    "confidenceLevel" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredDifficulty" "QuizDifficulty" NOT NULL DEFAULT 'MODERATE',
    "averageAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "learningVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retentionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commonStruggles" JSONB,
    "strongTopics" JSONB,
    "optimalQuizLength" INTEGER,
    "bestTimeOfDay" TEXT,
    "boredomThreshold" INTEGER NOT NULL DEFAULT 5,
    "challengePreference" TEXT NOT NULL DEFAULT 'BALANCED',
    "feedbackResponsiveness" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adaptationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastAnalyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_prompts" (
    "id" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "courseId" TEXT,
    "courseModuleId" TEXT,
    "lessonModuleId" TEXT,
    "masterPrompt" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "isSegmented" BOOLEAN NOT NULL DEFAULT false,
    "totalDuration" INTEGER NOT NULL,
    "segmentCount" INTEGER NOT NULL DEFAULT 1,
    "generatedBy" TEXT NOT NULL,
    "generationModel" TEXT NOT NULL DEFAULT 'gemini-3-flash-preview',
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_segments" (
    "id" TEXT NOT NULL,
    "videoPromptId" TEXT NOT NULL,
    "segmentNumber" INTEGER NOT NULL,
    "segmentPrompt" TEXT NOT NULL,
    "keyVisuals" JSONB NOT NULL,
    "transitionIn" TEXT,
    "transitionOut" TEXT,
    "targetDuration" INTEGER NOT NULL DEFAULT 5,
    "status" "SegmentStatus" NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_video_clips" (
    "id" TEXT NOT NULL,
    "videoSegmentId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "generationService" TEXT NOT NULL,
    "generationParams" JSONB,
    "status" "VideoStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_video_clips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compiled_videos" (
    "id" TEXT NOT NULL,
    "videoPromptId" TEXT NOT NULL,
    "finalVideoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "totalDuration" INTEGER NOT NULL,
    "segmentsUsed" JSONB NOT NULL,
    "compilationMethod" TEXT NOT NULL DEFAULT 'ffmpeg',
    "status" "VideoStatus" NOT NULL DEFAULT 'PROCESSING',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compiled_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mood_entries_userId_idx" ON "mood_entries"("userId");

-- CreateIndex
CREATE INDEX "mood_entries_enrollmentId_idx" ON "mood_entries"("enrollmentId");

-- CreateIndex
CREATE INDEX "mood_entries_lessonModuleId_idx" ON "mood_entries"("lessonModuleId");

-- CreateIndex
CREATE INDEX "mood_entries_mood_timestamp_idx" ON "mood_entries"("mood", "timestamp");

-- CreateIndex
CREATE INDEX "mood_entries_userId_enrollmentId_timestamp_idx" ON "mood_entries"("userId", "enrollmentId", "timestamp");

-- CreateIndex
CREATE INDEX "adaptive_quizzes_userId_idx" ON "adaptive_quizzes"("userId");

-- CreateIndex
CREATE INDEX "adaptive_quizzes_enrollmentId_idx" ON "adaptive_quizzes"("enrollmentId");

-- CreateIndex
CREATE INDEX "adaptive_quizzes_lessonModuleId_idx" ON "adaptive_quizzes"("lessonModuleId");

-- CreateIndex
CREATE INDEX "adaptive_quizzes_userId_enrollmentId_idx" ON "adaptive_quizzes"("userId", "enrollmentId");

-- CreateIndex
CREATE INDEX "quiz_attempts_adaptiveQuizId_idx" ON "quiz_attempts"("adaptiveQuizId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_submittedAt_idx" ON "quiz_attempts"("userId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "learner_profiles_userId_key" ON "learner_profiles"("userId");

-- CreateIndex
CREATE INDEX "learner_profiles_userId_idx" ON "learner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "video_prompts_contentHash_key" ON "video_prompts"("contentHash");

-- CreateIndex
CREATE INDEX "video_prompts_contentHash_idx" ON "video_prompts"("contentHash");

-- CreateIndex
CREATE INDEX "video_prompts_courseId_idx" ON "video_prompts"("courseId");

-- CreateIndex
CREATE INDEX "video_prompts_courseModuleId_idx" ON "video_prompts"("courseModuleId");

-- CreateIndex
CREATE INDEX "video_prompts_lessonModuleId_idx" ON "video_prompts"("lessonModuleId");

-- CreateIndex
CREATE INDEX "video_segments_videoPromptId_idx" ON "video_segments"("videoPromptId");

-- CreateIndex
CREATE INDEX "video_segments_status_idx" ON "video_segments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "video_segments_videoPromptId_segmentNumber_key" ON "video_segments"("videoPromptId", "segmentNumber");

-- CreateIndex
CREATE INDEX "generated_video_clips_videoSegmentId_idx" ON "generated_video_clips"("videoSegmentId");

-- CreateIndex
CREATE INDEX "generated_video_clips_status_idx" ON "generated_video_clips"("status");

-- CreateIndex
CREATE INDEX "compiled_videos_videoPromptId_idx" ON "compiled_videos"("videoPromptId");

-- CreateIndex
CREATE INDEX "compiled_videos_status_idx" ON "compiled_videos"("status");

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_lessonModuleId_fkey" FOREIGN KEY ("lessonModuleId") REFERENCES "lesson_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_quizzes" ADD CONSTRAINT "adaptive_quizzes_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_quizzes" ADD CONSTRAINT "adaptive_quizzes_lessonModuleId_fkey" FOREIGN KEY ("lessonModuleId") REFERENCES "lesson_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_quizzes" ADD CONSTRAINT "adaptive_quizzes_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_adaptiveQuizId_fkey" FOREIGN KEY ("adaptiveQuizId") REFERENCES "adaptive_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_prompts" ADD CONSTRAINT "video_prompts_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_prompts" ADD CONSTRAINT "video_prompts_courseModuleId_fkey" FOREIGN KEY ("courseModuleId") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_prompts" ADD CONSTRAINT "video_prompts_lessonModuleId_fkey" FOREIGN KEY ("lessonModuleId") REFERENCES "lesson_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_segments" ADD CONSTRAINT "video_segments_videoPromptId_fkey" FOREIGN KEY ("videoPromptId") REFERENCES "video_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_video_clips" ADD CONSTRAINT "generated_video_clips_videoSegmentId_fkey" FOREIGN KEY ("videoSegmentId") REFERENCES "video_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compiled_videos" ADD CONSTRAINT "compiled_videos_videoPromptId_fkey" FOREIGN KEY ("videoPromptId") REFERENCES "video_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
