-- CreateIndex
CREATE INDEX "lesson_modules_courseModuleId_day_idx" ON "lesson_modules"("courseModuleId", "day");

-- CreateIndex
CREATE INDEX "lesson_progress_enrollmentId_status_idx" ON "lesson_progress"("enrollmentId", "status");

-- CreateIndex
CREATE INDEX "module_progress_userId_status_idx" ON "module_progress"("userId", "status");
