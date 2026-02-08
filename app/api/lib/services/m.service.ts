
import { AdaptationMetrics, AdaptiveQuizAnalytics, DifficultyAccuracy, LearnerProfileData, MasteryAttempt, MasteryProgression, ModuleMastery, ProgressionTrend, QuizPerformanceMetrics, QuizRecommendation } from '../analytics/analytics';
import { calculateAverage, calculateConsistency, calculateDaysBetween, calculateTrend } from '../analytics/utils';
import { prisma } from '../prisma';



// ============================================
// MASTERY PROGRESSION
// ============================================

export async function getMasteryProgression(
  enrollmentId: string
): Promise<MasteryProgression> {
  const moduleProgress = await prisma.moduleProgress.findMany({
    where: { enrollmentId },
    include: {
      courseModule: {
        select: {
          id: true,
          moduleName: true,
          moduleNumber: true
        }
      },
      assessmentAttempts: {
        orderBy: { submittedAt: 'asc' }
      }
    },
    orderBy: {
      courseModule: {
        moduleNumber: 'asc'
      }
    }
  });

  const modules: ModuleMastery[] = moduleProgress.map(module => {
    const attempts: MasteryAttempt[] = module.assessmentAttempts.map((attempt, index) => {
      let timeSinceLastAttempt: number | undefined;
      
      if (index > 0) {
        const prevAttempt = module.assessmentAttempts[index - 1];
        timeSinceLastAttempt = calculateDaysBetween(
          new Date(prevAttempt.submittedAt),
          new Date(attempt.submittedAt)
        );
      }

      return {
        score: attempt.score,
        assessmentType: attempt.assessmentType,
        date: attempt.submittedAt,
        timeSinceLastAttempt
      };
    });

    let timeToMastery: number | undefined;
    if (module.startedAt && module.masteryAchievedAt) {
      timeToMastery = module.masteryAchievedAt.getTime() - module.startedAt.getTime();
    }

    // Calculate progression (improvement from first to last attempt)
    let progression = 0;
    if (attempts.length >= 2) {
      const firstScore = attempts[0].score;
      const lastScore = attempts[attempts.length - 1].score;
      progression = lastScore - firstScore;
    }

    return {
      moduleId: module.courseModuleId,
      moduleName: module.courseModule.moduleName,
      moduleNumber: module.courseModule.moduleNumber,
      currentMasteryScore: module.masteryScore,
      status: module.status,
      attemptHistory: attempts,
      timeToMastery,
      averageAttempts: attempts.length,
      progression
    };
  });

  // Calculate overall trend
  const allScores = modules.flatMap(m => m.attemptHistory.map(a => a.score));
  const trendData = calculateTrend(allScores.map(s => ({ value: s })));
  
  const improvementRates = modules
    .filter(m => m.progression !== 0)
    .map(m => m.progression);
  
  const averageImprovementRate = calculateAverage(improvementRates);
  
  const consistencyScore = calculateConsistency(
    modules.map(m => m.currentMasteryScore)
  );

  let direction: 'accelerating' | 'steady' | 'slowing' = 'steady';
  if (trendData.direction === 'improving' && trendData.changePercentage > 10) {
    direction = 'accelerating';
  } else if (trendData.direction === 'declining') {
    direction = 'slowing';
  }

  const overallTrend: ProgressionTrend = {
    direction,
    averageImprovementRate,
    consistencyScore
  };

  // Identify strengths and weaknesses
  const sortedByScore = [...modules].sort((a, b) => 
    b.currentMasteryScore - a.currentMasteryScore
  );

  const strengths = sortedByScore
    .slice(0, 3)
    .filter(m => m.currentMasteryScore >= 80)
    .map(m => m.moduleName);

  const weaknesses = sortedByScore
    .slice(-3)
    .filter(m => m.currentMasteryScore < 70)
    .map(m => m.moduleName)
    .reverse();

  // Predict mastery date for incomplete modules
  let predictedMasteryDate: Date | undefined;
  const incompleteModules = modules.filter(m => m.status !== 'MASTERED');
  
  if (incompleteModules.length > 0 && averageImprovementRate > 0) {
    const averageTimeToMaster = calculateAverage(
      modules
        .filter(m => m.timeToMastery)
        .map(m => m.timeToMastery!)
    );
    
    if (averageTimeToMaster > 0) {
      const estimatedDays = (averageTimeToMaster / (1000 * 60 * 60 * 24)) * incompleteModules.length;
      predictedMasteryDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);
    }
  }

  return {
    enrollmentId,
    modules,
    overallTrend,
    predictedMasteryDate,
    strengths,
    weaknesses
  };
}

// ============================================
// ADAPTIVE QUIZ ANALYTICS
// ============================================

export async function getAdaptiveQuizAnalytics(
  userId: string
): Promise<AdaptiveQuizAnalytics> {
  const profile = await prisma.learnerProfile.findUnique({
    where: { userId }
  });

  const quizzes = await prisma.adaptiveQuiz.findMany({
    where: { userId },
    include: {
      attempts: {
        orderBy: { submittedAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Learner profile data
  const learnerProfile: LearnerProfileData = {
    preferredDifficulty: profile?.preferredDifficulty || 'MODERATE',
    averageAccuracy: profile?.averageAccuracy || 0,
    learningVelocity: profile?.learningVelocity || 0,
    retentionRate: profile?.retentionRate || 0,
    optimalQuizLength: profile?.optimalQuizLength ?? undefined,
    bestTimeOfDay: profile?.bestTimeOfDay ?? undefined,
    commonStruggles: profile?.commonStruggles as string[] ?? undefined,
    strongTopics: profile?.strongTopics as string[] ?? undefined
  };

  // Quiz performance metrics
  const allAttempts = quizzes.flatMap(q => q.attempts);
  const scores = allAttempts.map(a => a.score);
  
  const averageScore = calculateAverage(scores);
  
  // Calculate improvement rate
  let improvementRate = 0;
  if (scores.length >= 2) {
    const halfPoint = Math.floor(scores.length / 2);
    const earlyScores = scores.slice(0, halfPoint);
    const recentScores = scores.slice(halfPoint);
    
    const earlyAvg = calculateAverage(earlyScores);
    const recentAvg = calculateAverage(recentScores);
    
    improvementRate = ((recentAvg - earlyAvg) / earlyAvg) * 100;
  }

  // Group attempts by difficulty
  const difficultyGroups = new Map<string, {
    scores: number[];
    attempts: number;
    confidenceLevels: number[];
  }>();

  quizzes.forEach(quiz => {
    const difficulty = quiz.difficultyLevel;
    
    if (!difficultyGroups.has(difficulty)) {
      difficultyGroups.set(difficulty, {
        scores: [],
        attempts: 0,
        confidenceLevels: []
      });
    }

    const group = difficultyGroups.get(difficulty)!;
    
    quiz.attempts.forEach(attempt => {
      group.scores.push(attempt.score);
      group.attempts++;
      
      if (attempt.confidenceLevel) {
        group.confidenceLevels.push(attempt.confidenceLevel);
      }
    });
  });

  const accuracyByDifficulty: DifficultyAccuracy[] = Array.from(difficultyGroups.entries())
    .map(([difficulty, data]) => ({
      difficulty,
      averageScore: calculateAverage(data.scores),
      attempts: data.attempts,
      confidenceLevel: data.confidenceLevels.length > 0 
        ? calculateAverage(data.confidenceLevels) 
        : 0
    }))
    .sort((a, b) => {
      const difficultyOrder = ['VERY_EASY', 'EASY', 'MODERATE', 'CHALLENGING', 'HARD', 'EXPERT'];
      return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
    });

  const totalTimeSpent = allAttempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0);
  const totalQuestions = allAttempts.reduce((sum, a) => 
    sum + a.correctAnswers + a.incorrectAnswers, 0
  );

  const averageTimePerQuestion = totalQuestions > 0 
    ? totalTimeSpent / totalQuestions 
    : 0;

  const completionRate = quizzes.length > 0 
    ? (allAttempts.length / quizzes.length) * 100 
    : 0;

  const quizPerformance: QuizPerformanceMetrics = {
    totalQuizzesTaken: allAttempts.length,
    averageScore,
    improvementRate,
    accuracyByDifficulty,
    averageTimePerQuestion,
    completionRate
  };

  // Adaptation effectiveness metrics
  const adaptedQuizzes = quizzes.filter(q => q.adaptationReason);
  
  let adaptationSuccessRate = 0;
  let averageScoreImprovement = 0;
  
  if (adaptedQuizzes.length > 0) {
    const successfulAdaptations = adaptedQuizzes.filter(quiz => {
      const attempts = quiz.attempts;
      if (attempts.length === 0) return false;
      
      const lastAttempt = attempts[attempts.length - 1];
      return lastAttempt.score >= 70; // Consider 70% as successful
    });
    
    adaptationSuccessRate = (successfulAdaptations.length / adaptedQuizzes.length) * 100;
    
    // Calculate score improvement after adaptation
    const improvements: number[] = [];
    adaptedQuizzes.forEach((quiz, index) => {
      if (index > 0 && quiz.attempts.length > 0) {
        const prevQuiz = quizzes[index - 1];
        if (prevQuiz.attempts.length > 0) {
          const prevScore = prevQuiz.attempts[prevQuiz.attempts.length - 1].score;
          const currentScore = quiz.attempts[quiz.attempts.length - 1].score;
          improvements.push(currentScore - prevScore);
        }
      }
    });
    
    averageScoreImprovement = improvements.length > 0 
      ? calculateAverage(improvements) 
      : 0;
  }

  // Calculate appropriate difficulty rate
  let appropriateDifficultyRate = 0;
  const attemptsWithDifficulty = allAttempts.filter(a => {
    const quiz = quizzes.find(q => q.id === a.adaptiveQuizId);
    return quiz !== undefined;
  });

  if (attemptsWithDifficulty.length > 0) {
    const appropriateAttempts = attemptsWithDifficulty.filter(attempt => {
      // Consider difficulty appropriate if score is between 60-85%
      return attempt.score >= 60 && attempt.score <= 85;
    });
    
    appropriateDifficultyRate = (appropriateAttempts.length / attemptsWithDifficulty.length) * 100;
  }

  const adaptationMetrics: AdaptationMetrics = {
    adaptationSuccessRate,
    averageScoreImprovement,
    engagementIncrease: 0, // Would need additional engagement tracking
    appropriateDifficultyRate
  };

  // Generate recommendations
  const recommendations: QuizRecommendation[] = [];

  // Difficulty recommendations
  const currentDifficultyPerformance = accuracyByDifficulty.find(
    d => d.difficulty === profile?.preferredDifficulty
  );

  if (currentDifficultyPerformance) {
    if (currentDifficultyPerformance.averageScore > 85) {
      recommendations.push({
        type: 'difficulty',
        suggestion: 'Increase quiz difficulty',
        reasoning: `You're consistently scoring above 85% at ${profile?.preferredDifficulty} level`,
        expectedImpact: 'Better challenge and deeper learning'
      });
    } else if (currentDifficultyPerformance.averageScore < 60) {
      recommendations.push({
        type: 'difficulty',
        suggestion: 'Decrease quiz difficulty',
        reasoning: `Your average score at ${profile?.preferredDifficulty} level is below 60%`,
        expectedImpact: 'Build confidence and foundational understanding'
      });
    }
  }

  // Length recommendations
  if (profile?.optimalQuizLength && profile.optimalQuizLength < 5) {
    recommendations.push({
      type: 'length',
      suggestion: 'Shorter, focused quizzes',
      reasoning: 'Your performance is better with shorter quiz sessions',
      expectedImpact: 'Improved focus and retention'
    });
  }

  // Timing recommendations
  if (profile?.bestTimeOfDay) {
    recommendations.push({
      type: 'timing',
      suggestion: `Study during ${profile.bestTimeOfDay}`,
      reasoning: 'Your performance data shows this is your most productive time',
      expectedImpact: 'Higher scores and better retention'
    });
  }

  const struggles = profile?.commonStruggles as string[] | null;

 
 if (Array.isArray(struggles) && struggles.length > 0) {
  recommendations.push({
    type: 'focus',
    suggestion: 'Review struggling topics',
    reasoning: `You've shown difficulty with: ${struggles.slice(0, 3).join(', ')}`,
    expectedImpact: 'Fill knowledge gaps and improve overall mastery'
  });
}

  return {
    userId,
    learnerProfile,
    quizPerformance,
    adaptationEffectiveness: adaptationMetrics,
    recommendations
  };
}

export const MasteryAnalyticsService = {
  getMasteryProgression,
  getAdaptiveQuizAnalytics
};