
import { CompletionPrediction, EffectivenessMetrics, Milestone, ReviewSchedule, RiskFactor, SpacedRepetitionAnalytics } from '../analytics/analytics';
import { addDays, calculateAverage, calculateDaysBetween, calculateRiskLevel, isBeforeDeadline, parseAvailableTime } from '../analytics/utils';
import { prisma } from '../prisma';





export async function getCompletionPrediction(
  enrollmentId: string
): Promise<CompletionPrediction> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        select: {
          title: true
        }
      },
      moduleProgress: {
        include: {
          courseModule: true
        },
        orderBy: {
          courseModule: {
            moduleNumber: 'asc'
          }
        }
      },
      lessonProgress: {
        include: {
          lessonModule: true
        }
      },
      moodEntries: {
        orderBy: { timestamp: 'desc' },
        take: 10
      }
    }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  const completedLessons = enrollment.lessonProgress.filter(
    l => l.status === 'COMPLETED'
  );
  
  const totalLessons = enrollment.lessonProgress.length;
  const remainingLessons = totalLessons - completedLessons.length;

  // Calculate average time per lesson
  const avgTimePerLesson = completedLessons.length > 0
    ? enrollment.totalTimeSpent / completedLessons.length
    : 60; // Default to 60 minutes if no data

  // Parse available study time per day
  const dailyAvailableMinutes = parseAvailableTime(enrollment.availableTime);

  // Calculate estimated days to completion
  const estimatedTotalMinutes = remainingLessons * avgTimePerLesson;
  const estimatedDays = Math.ceil(estimatedTotalMinutes / dailyAvailableMinutes);
  
  const estimatedCompletionDate = addDays(new Date(), estimatedDays);

  // Check if on track for deadline
  const onTrackForDeadline = enrollment.deadline 
    ? isBeforeDeadline(estimatedCompletionDate, enrollment.deadline)
    : true;

  const daysRemaining = enrollment.deadline 
    ? calculateDaysBetween(new Date(), new Date(enrollment.deadline))
    : undefined;

  // Calculate risk level
  const daysSinceLastAccess = calculateDaysBetween(
    new Date(enrollment.lastAccessedAt),
    new Date()
  );

  const avgMoodScore = enrollment.moodEntries.length > 0
    ? calculateAverage(enrollment.moodEntries.map(m => m.intensity))
    : undefined;

  const riskLevel = calculateRiskLevel(
    enrollment.overallCompletion,
    daysSinceLastAccess,
    avgMoodScore,
    enrollment.averageMasteryScore
  );

  // Identify risk factors
  const riskFactors: RiskFactor[] = [];

  if (daysSinceLastAccess > 7) {
    riskFactors.push({
      factor: 'Inactivity',
      severity: daysSinceLastAccess > 14 ? 'high' : 'medium',
      impact: `No activity for ${daysSinceLastAccess} days`,
      mitigation: 'Set a daily study reminder and start with a quick 15-minute session'
    });
  }

  if (enrollment.averageMasteryScore < 60) {
    riskFactors.push({
      factor: 'Low Mastery',
      severity: 'high',
      impact: 'Struggling with course material',
      mitigation: 'Review previous modules and consider reaching out for help'
    });
  }

  if (!onTrackForDeadline) {
    riskFactors.push({
      factor: 'Behind Schedule',
      severity: 'high',
      impact: 'May not complete before deadline',
      mitigation: 'Increase daily study time or adjust deadline expectations'
    });
  }

  const dominantNegativeMoods = enrollment.moodEntries.filter(
    m => ['FRUSTRATED', 'OVERWHELMED', 'BORED'].includes(m.mood)
  );

  if (dominantNegativeMoods.length > enrollment.moodEntries.length / 2) {
    riskFactors.push({
      factor: 'Low Engagement',
      severity: 'medium',
      impact: 'Experiencing negative emotions frequently',
      mitigation: 'Try different study methods or take short breaks between sessions'
    });
  }

  if (enrollment.overallCompletion < 20 && daysSinceLastAccess > 3) {
    riskFactors.push({
      factor: 'Early Stage Dropout Risk',
      severity: 'high',
      impact: 'Low completion and decreasing engagement',
      mitigation: 'Focus on building a consistent study habit, even if just 10 minutes daily'
    });
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('🚨 Immediate action needed to stay on track');
    recommendations.push('Consider adjusting your study schedule or course pace');
  }

  if (!onTrackForDeadline && daysRemaining) {
    const requiredDailyMinutes = estimatedTotalMinutes / daysRemaining;
    recommendations.push(
      `To meet your deadline, aim for ${Math.ceil(requiredDailyMinutes)} minutes of study per day`
    );
  }

  if (enrollment.overallCompletion > 50 && enrollment.averageMasteryScore > 70) {
    recommendations.push('Great progress! You\'re over halfway and performing well');
  }

  if (daysSinceLastAccess > 3) {
    recommendations.push('Start with a quick review session to get back into the flow');
  }

  // Create milestones
  const totalModules = enrollment.moduleProgress.length;
  const completedModules = enrollment.moduleProgress.filter(
    m => m.status === 'COMPLETED' || m.status === 'MASTERED'
  ).length;

  const milestones: Milestone[] = [
    {
      name: '25% Complete',
      targetDate: addDays(new Date(), estimatedDays * 0.25),
      achieved: enrollment.overallCompletion >= 25,
      progress: Math.min(enrollment.overallCompletion / 25 * 100, 100)
    },
    {
      name: '50% Complete',
      targetDate: addDays(new Date(), estimatedDays * 0.5),
      achieved: enrollment.overallCompletion >= 50,
      progress: Math.min(enrollment.overallCompletion / 50 * 100, 100)
    },
    {
      name: '75% Complete',
      targetDate: addDays(new Date(), estimatedDays * 0.75),
      achieved: enrollment.overallCompletion >= 75,
      progress: Math.min(enrollment.overallCompletion / 75 * 100, 100)
    },
    {
      name: 'Course Completion',
      targetDate: estimatedCompletionDate,
      achieved: enrollment.status === 'COMPLETED',
      progress: enrollment.overallCompletion
    }
  ];

  return {
    enrollmentId,
    currentProgress: enrollment.overallCompletion,
    estimatedCompletionDate,
    onTrackForDeadline,
    deadline: enrollment.deadline,
    daysRemaining,
    riskLevel,
    riskFactors,
    recommendations,
    milestones
  };
}

// ============================================
// SPACED REPETITION ANALYTICS
// ============================================

export async function getSpacedRepetitionAnalytics(
  enrollmentId: string
): Promise<SpacedRepetitionAnalytics> {
  const reviews = await prisma.reviewItem.findMany({
    where: { enrollmentId },
    orderBy: { dueDate: 'asc' }
  });

  const now = new Date();
  const completedReviews = reviews.filter(r => r.completed);
  const overdueReviews = reviews.filter(r => !r.completed && r.dueDate < now);
  const upcomingReviews = reviews.filter(r => !r.completed && r.dueDate >= now);

  const averageRepetitions = reviews.length > 0
    ? calculateAverage(reviews.map(r => r.repetitionCount))
    : 0;

  // Calculate retention rate
  let retentionRate = 0;
  if (completedReviews.length > 0) {
    // Retention rate based on how many reviews were completed on time
    const onTimeReviews = completedReviews.filter(r => {
      if (!r.lastReviewed) return false;
      return r.lastReviewed <= r.dueDate;
    });
    
    retentionRate = (onTimeReviews.length / completedReviews.length) * 100;
  }

  // Calculate effectiveness metrics
  const successRate = reviews.length > 0
    ? (completedReviews.length / reviews.length) * 100
    : 0;

  // Calculate average recall strength (based on repetition count)
  // Higher repetition count = stronger recall
  const averageRecallStrength = reviews.length > 0
    ? Math.min(calculateAverage(reviews.map(r => r.repetitionCount)) * 20, 100)
    : 0;

  // Calculate optimal interval (average days between reviews)
  const intervalsInDays: number[] = [];
  completedReviews.forEach((review, index) => {
    if (index > 0 && review.lastReviewed) {
      const prevReview = completedReviews[index - 1];
      if (prevReview.lastReviewed) {
        const daysBetween = calculateDaysBetween(
          new Date(prevReview.lastReviewed),
          new Date(review.lastReviewed)
        );
        intervalsInDays.push(daysBetween);
      }
    }
  });

  const optimalInterval = intervalsInDays.length > 0
    ? Math.round(calculateAverage(intervalsInDays))
    : 3; // Default to 3 days

  // Calculate adherence rate (how often reviews are done on time)
  const adherenceRate = retentionRate; // Same as retention rate in this context

  const effectiveness: EffectivenessMetrics = {
    successRate,
    averageRecallStrength,
    optimalInterval,
    adherenceRate
  };

  // Create review schedule for next 30 days
  const schedule: ReviewSchedule[] = [];
  const next30Days = addDays(now, 30);

  // Group upcoming reviews by date
  const reviewsByDate = new Map<string, typeof reviews>();
  
  upcomingReviews.forEach(review => {
    const dateKey = review.dueDate.toISOString().split('T')[0];
    if (!reviewsByDate.has(dateKey)) {
      reviewsByDate.set(dateKey, []);
    }
    reviewsByDate.get(dateKey)!.push(review);
  });

  // Convert to schedule items
  reviewsByDate.forEach((items, dateKey) => {
    const date = new Date(dateKey);
    if (date <= next30Days) {
      // Extract unique topics/concepts
      const topics = [...new Set(items.map(r => r.conceptId))];
      
      // Estimate time (assuming 5 minutes per review item)
      const estimatedTime = items.length * 5;

      schedule.push({
        date,
        itemCount: items.length,
        estimatedTime,
        topics
      });
    }
  });

  // Sort schedule by date
  schedule.sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    enrollmentId,
    totalReviewItems: reviews.length,
    completedReviews: completedReviews.length,
    overdueReviews: overdueReviews.length,
    upcomingReviews: upcomingReviews.length,
    averageRepetitions,
    retentionRate,
    effectiveness,
    schedule
  };
}

export const PredictionAnalyticsService = {
  getCompletionPrediction,
  getSpacedRepetitionAnalytics
};