"use client";

import { useEffect, useState } from "react";
import MoodAssessment from "./moodassessment"; 

interface AutoMoodTriggerProps {
  enrollmentId?: string;
  lessonModuleId?: string;
  courseModuleId?: string;
  onMoodDetected?: (mood: any) => void;
  triggerInterval?: number; // minutes
}

export default function AutoMoodTrigger({
  enrollmentId,
  lessonModuleId,
  courseModuleId,
  onMoodDetected,
  triggerInterval = 15, 
}: AutoMoodTriggerProps) {
  const [showAssessment, setShowAssessment] = useState(false);
  const [lastCheck, setLastCheck] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const minutesSinceLastCheck = (Date.now() - lastCheck) / 60000;

      if (minutesSinceLastCheck >= triggerInterval) {
        setShowAssessment(true);
        setLastCheck(Date.now());
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastCheck, triggerInterval]);

  const handleMoodDetected = (mood: any) => {
    onMoodDetected?.(mood);
    setLastCheck(Date.now());
  };

  if (!showAssessment) return null;

  return (
    <MoodAssessment
      enrollmentId={enrollmentId}
      lessonModuleId={lessonModuleId}
      courseModuleId={courseModuleId}
      context="auto-check"
      onMoodDetected={handleMoodDetected}
      onClose={() => setShowAssessment(false)}
    />
  );
}
