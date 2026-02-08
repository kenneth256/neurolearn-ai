
import { addDays, calculateAverage, calculateAverageMood, calculateDaysBetween, calculateRiskLevel, calculateStreak, calculateTrend, parseEstimatedHours } from '../analytics/utils';
import { EnrollmentAnalytics, LearningVelocity, LessonVelocity, OverallStats, PerformanceDashboard, VelocityTrend } from '../analytics/analytics';
import { prisma } from '../prisma';








export async function getPerformanceDashboard(
  userId: string
): Promise<PerformanceDashboard> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true
        }
      },
      moduleProgress: {
        include: {
          courseModule: true
        }
      },
      lessonProgress: true,
      moodEntries: {
        orderBy: { timestamp: 'desc' },
        take: 20
      }
    }
  });

  // Get user activities for streak calculation
  const activities = await prisma.userActivity.findMany({
    where: {
      userId,
      activityType: {
        in: ['LESSON_COMPLETED', 'QUIZ_ATTEMPTED', 'MODULE_COMPLETED']
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  const streakData = calculateStreak(activities);

  const enrollmentAnalytics: EnrollmentAnalytics[] = enrollments.map(enrollment => {
    const completedModules = enrollment.moduleProgress.filter(
      m => m.status === 'COMPLETED' || m.status === 'MASTERED'
    );
    
    const totalModules = enrollment.moduleProgress.length;
    
    const completedLessons = enrollment.lessonProgress.filter(
      l => l.status === 'COMPLETED'
    );
    
    const totalLessons = enrollment.lessonProgress.length;

    const averageMood = calculateAverageMood(enrollment.moodEntries);

    const daysSinceLastAccess = calculateDaysBetween(
      new Date(enrollment.lastAccessedAt),
      new Date()
    );

    const riskLevel = calculateRiskLevel(
      enrollment.overallCompletion,
      daysSinceLastAccess,
      averageMood?.averageIntensity,
      enrollment.averageMasteryScore
    );

    // Estimate completion date
    let estimatedCompletionDate: Date | undefined;
    if (completedLessons.length > 0 && totalLessons > completedLessons.length) {
      const avgTimePerLesson = enrollment.totalTimeSpent / completedLessons.length;
      const remainingLessons = totalLessons - completedLessons.length;
      const estimatedDays = (remainingLessons * avgTimePerLesson) / 60 / 2; // Assuming 2 hours per day
      estimatedCompletionDate = addDays(new Date(), estimatedDays);
    }

    return {
      enrollmentId: enrollment.id,
      courseId: enrollment.course.id,
      courseTitle: enrollment.course.title,
      thumbnail: enrollment.course.thumbnail ?? undefined,
      overallCompletion: enrollment.overallCompletion,
      averageMasteryScore: enrollment.averageMasteryScore,
      totalTimeSpent: enrollment.totalTimeSpent,
      status: enrollment.status,
      modulesCompleted: completedModules.length,
      totalModules,
      lessonsCompleted: completedLessons.length,
      totalLessons,
      averageMood,
      currentStreak: streakData.current,
      estimatedCompletionDate,
      riskLevel,
      enrolledAt: enrollment.enrolledAt,
      lastAccessedAt: enrollment.lastAccessedAt
    };
  });

  // Calculate overall stats
  const overallStats: OverallStats = {
    totalCoursesEnrolled: enrollments.length,
    totalCoursesCompleted: enrollments.filter(e => e.status === 'COMPLETED').length,
    totalTimeSpent: enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0),
    averageMasteryScore: calculateAverage(
      enrollments.map(e => e.averageMasteryScore).filter(s => s > 0)
    ),
    totalModulesCompleted: enrollmentAnalytics.reduce(
      (sum, e) => sum + e.modulesCompleted, 0
    ),
    totalLessonsCompleted: enrollmentAnalytics.reduce(
      (sum, e) => sum + e.lessonsCompleted, 0
    ),
    currentStreak: streakData.current,
    longestStreak: streakData.longest
  };

  return {
    userId,
    enrollments: enrollmentAnalytics,
    overallStats,
    generatedAt: new Date()
  };
}

// ============================================
// LEARNING VELOCITY
// ============================================

export async function getLearningVelocity(
  enrollmentId: string
): Promise<LearningVelocity> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      lessonProgress: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'asc' },
        include: {
          lessonModule: true
        }
      }
    }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  const lessonBreakdown: LessonVelocity[] = enrollment.lessonProgress.map(lesson => {
    const estimatedTime = parseEstimatedHours(lesson.lessonModule.duration);
    const actualTime = lesson.timeSpentMinutes;
    const efficiency = actualTime > 0 ? estimatedTime / actualTime : 0;

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.lessonModule.title,
      day: lesson.lessonModule.day,
      actualTime,
      estimatedTime,
      efficiency,
      completedAt: lesson.completedAt ?? undefined
    };
  });

  const efficiencies = lessonBreakdown.map(l => l.efficiency).filter(e => e > 0);
  const averageEfficiency = calculateAverage(efficiencies);
  const averageTimePerLesson = calculateAverage(
    lessonBreakdown.map(l => l.actualTime)
  );

  // Calculate velocity trend
  const trendData = calculateTrend(
    lessonBreakdown.map(l => ({ value: l.efficiency }))
  );

  const halfPoint = Math.floor(lessonBreakdown.length / 2);
  const earlyLessons = lessonBreakdown.slice(0, halfPoint);
  const recentLessons = lessonBreakdown.slice(halfPoint);

  const earlyAverage = calculateAverage(earlyLessons.map(l => l.efficiency));
  const recentAverage = calculateAverage(recentLessons.map(l => l.efficiency));

  const velocityTrend: VelocityTrend = {
    direction: trendData.direction,
    changePercentage: trendData.changePercentage,
    recentAverage,
    earlyAverage
  };

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (averageEfficiency < 0.7) {
    recommendations.push('You\'re taking more time than estimated. Consider breaking lessons into smaller chunks.');
    recommendations.push('Review prerequisite concepts if you\'re struggling.');
  } else if (averageEfficiency > 1.3) {
    recommendations.push('You\'re moving faster than estimated! Make sure to review key concepts.');
    recommendations.push('Consider taking on more challenging material.');
  }

  if (velocityTrend.direction === 'declining') {
    recommendations.push('Your pace is slowing down. This is normal, but ensure you\'re staying engaged.');
  } else if (velocityTrend.direction === 'improving') {
    recommendations.push('Great! Your learning velocity is improving.');
  }

  return {
    enrollmentId,
    averageEfficiency,
    totalLessonsCompleted: lessonBreakdown.length,
    averageTimePerLesson,
    velocityTrend,
    lessonBreakdown,
    recommendations
  };
}

// ============================================
// SINGLE ENROLLMENT SUMMARY
// ============================================

export async function getEnrollmentSummary(
  enrollmentId: string
): Promise<EnrollmentAnalytics> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true
        }
      },
      moduleProgress: {
        include: {
          courseModule: true
        }
      },
      lessonProgress: true,
      moodEntries: {
        orderBy: { timestamp: 'desc' },
        take: 20
      }
    }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  const completedModules = enrollment.moduleProgress.filter(
    m => m.status === 'COMPLETED' || m.status === 'MASTERED'
  );
  
  const totalModules = enrollment.moduleProgress.length;
  
  const completedLessons = enrollment.lessonProgress.filter(
    l => l.status === 'COMPLETED'
  );
  
  const totalLessons = enrollment.lessonProgress.length;

  const averageMood = calculateAverageMood(enrollment.moodEntries);

  const daysSinceLastAccess = calculateDaysBetween(
    new Date(enrollment.lastAccessedAt),
    new Date()
  );

  const riskLevel = calculateRiskLevel(
    enrollment.overallCompletion,
    daysSinceLastAccess,
    averageMood?.averageIntensity,
    enrollment.averageMasteryScore
  );

  // Get user activities for this enrollment
  const activities = await prisma.userActivity.findMany({
    where: {
      userId: enrollment.userId,
      enrollmentId: enrollment.id,
      activityType: {
        in: ['LESSON_COMPLETED', 'QUIZ_ATTEMPTED', 'MODULE_COMPLETED']
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  const streakData = calculateStreak(activities);

  // Estimate completion date
  let estimatedCompletionDate: Date | undefined;
  if (completedLessons.length > 0 && totalLessons > completedLessons.length) {
    const avgTimePerLesson = enrollment.totalTimeSpent / completedLessons.length;
    const remainingLessons = totalLessons - completedLessons.length;
    const estimatedDays = (remainingLessons * avgTimePerLesson) / 60 / 2;
    estimatedCompletionDate = addDays(new Date(), estimatedDays);
  }

  return {
    enrollmentId: enrollment.id,
    courseId: enrollment.course.id,
    courseTitle: enrollment.course.title,
    thumbnail: enrollment.course.thumbnail ?? undefined,
    overallCompletion: enrollment.overallCompletion,
    averageMasteryScore: enrollment.averageMasteryScore,
    totalTimeSpent: enrollment.totalTimeSpent,
    status: enrollment.status,
    modulesCompleted: completedModules.length,
    totalModules,
    lessonsCompleted: completedLessons.length,
    totalLessons,
    averageMood,
    currentStreak: streakData.current,
    estimatedCompletionDate,
    riskLevel,
    enrolledAt: enrollment.enrolledAt,
    lastAccessedAt: enrollment.lastAccessedAt
  };
}

export const PerformanceAnalyticsService = {
  getPerformanceDashboard,
  getLearningVelocity,
  getEnrollmentSummary
};