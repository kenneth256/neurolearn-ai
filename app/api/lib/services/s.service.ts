
import { ImprovementArea, InterventionEffect, MoodImpactAnalysis, MoodInsight, MoodPerformanceCorrelation, Recommendation, StruggleAnalysis, StruggleArea, TriggerPattern } from '../analytics/analytics';
import { calculateAverage, calculateTrend, getMoodScore } from '../analytics/utils';
import { prisma } from '../prisma';




// ============================================
// STRUGGLE AREAS ANALYSIS
// ============================================

export async function getStruggleAnalysis(userId: string): Promise<StruggleAnalysis> {
  const quizAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    include: {
      adaptiveQuiz: {
        include: {
          lessonModule: {
            select: {
              id: true,
              title: true,
              day: true
            }
          },
          courseModule: {
            select: {
              id: true,
              moduleName: true,
              moduleNumber: true
            }
          }
        }
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  // Extract struggled questions
  const struggledQuestions: any[] = [];
  quizAttempts.forEach(attempt => {
    if (attempt.struggledQuestions) {
      const questions = attempt.struggledQuestions as any[];
      questions.forEach(q => {
        struggledQuestions.push({
          ...q,
          attemptDate: attempt.submittedAt,
          score: attempt.score,
          lessonId: attempt.adaptiveQuiz.lessonModuleId,
          lessonTitle: attempt.adaptiveQuiz.lessonModule?.title,
          moduleId: attempt.adaptiveQuiz.courseModuleId,
          moduleName: attempt.adaptiveQuiz.courseModule?.moduleName
        });
      });
    }
  });

  // Group by topic/concept
  const topicMap = new Map<string, {
    questions: any[];
    scores: number[];
    dates: Date[];
    relatedLessons: Set<string>;
  }>();

  struggledQuestions.forEach(q => {
    const topic = q.topic || q.concept || 'Unknown';
    
    if (!topicMap.has(topic)) {
      topicMap.set(topic, {
        questions: [],
        scores: [],
        dates: [],
        relatedLessons: new Set()
      });
    }

    const data = topicMap.get(topic)!;
    data.questions.push(q);
    data.scores.push(q.score || 0);
    data.dates.push(new Date(q.attemptDate));
    
    if (q.lessonTitle) {
      data.relatedLessons.add(q.lessonTitle);
    }
  });

  //struggle areas
  const topStruggleAreas: StruggleArea[] = Array.from(topicMap.entries())
    .map(([topic, data]) => {
      const averageScore = calculateAverage(data.scores);
      const trend = calculateTrend(
        data.scores.map(s => ({ value: s }))
      );

      return {
        topic,
        frequency: data.questions.length,
        averageScore,
        lastAttemptDate: new Date(Math.max(...data.dates.map(d => d.getTime()))),
        trend: trend.direction,
        relatedLessons: Array.from(data.relatedLessons)
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // Find improvement areas (topics that improved over time)
  const improvementAreas: ImprovementArea[] = Array.from(topicMap.entries())
    .map(([topic, data]) => {
      if (data.scores.length < 2) return null;

      const sortedByDate = data.scores
        .map((score, i) => ({ score, date: data.dates[i] }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const previousScore = calculateAverage(
        sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2)).map(s => s.score)
      );
      
      const currentScore = calculateAverage(
        sortedByDate.slice(Math.ceil(sortedByDate.length / 2)).map(s => s.score)
      );

      const improvement = currentScore - previousScore;

      if (improvement > 10) {
        return {
          topic,
          previousScore,
          currentScore,
          improvement,
          lastPracticed: sortedByDate[sortedByDate.length - 1].date
        };
      }

      return null;
    })
    .filter((area): area is ImprovementArea => area !== null)
    .sort((a, b) => b.improvement - a.improvement)
    .slice(0, 5);

  // Generate recommendations
  const recommendations: Recommendation[] = [];

  topStruggleAreas.slice(0, 3).forEach(area => {
    if (area.trend === 'declining' || area.trend === 'stable') {
      recommendations.push({
        type: 'review',
        priority: 'high',
        title: `Review ${area.topic}`,
        description: `You've struggled with this concept ${area.frequency} times. Let's strengthen your understanding.`,
        actionUrl: area.relatedLessons[0] ? `/lesson/${area.relatedLessons[0]}` : undefined
      });
    }

    recommendations.push({
      type: 'practice',
      priority: area.averageScore < 50 ? 'high' : 'medium',
      title: `Practice ${area.topic}`,
      description: `Additional exercises could help improve your mastery of this topic.`
    });
  });

  if (improvementAreas.length > 0) {
    recommendations.push({
      type: 'resource',
      priority: 'low',
      title: 'Keep up the great work!',
      description: `You've shown improvement in ${improvementAreas.length} areas. Continue practicing regularly.`
    });
  }

  const overallDifficulty = calculateAverage(
    quizAttempts.map(a => a.score)
  );

  return {
    userId,
    topStruggleAreas,
    improvementAreas,
    recommendations,
    overallDifficulty
  };
}

// ============================================
// MOOD IMPACT ANALYSIS
// ============================================

export async function getMoodImpactAnalysis(
  enrollmentId: string
): Promise<MoodImpactAnalysis> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      moodEntries: {
        include: {
          lessonModule: {
            include: {
              lessonProgress: {
                where: { enrollmentId }
              }
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      }
    }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  // Calculate mood-performance correlations
  const moodGroups = new Map<string, {
    scores: number[];
    timeSpent: number[];
    completed: number;
    total: number;
  }>();

  enrollment.moodEntries.forEach(entry => {
    if (!moodGroups.has(entry.mood)) {
      moodGroups.set(entry.mood, {
        scores: [],
        timeSpent: [],
        completed: 0,
        total: 0
      });
    }

    const group = moodGroups.get(entry.mood)!;
    
    if (entry.lessonModule?.lessonProgress[0]) {
      const progress = entry.lessonModule.lessonProgress[0];
      
      if (progress.quizScore) {
        group.scores.push(progress.quizScore);
      }
      
      group.timeSpent.push(progress.timeSpentMinutes);
      group.total++;
      
      if (progress.status === 'COMPLETED') {
        group.completed++;
      }
    }
  });

  const correlations: MoodPerformanceCorrelation[] = Array.from(moodGroups.entries())
    .map(([mood, data]) => ({
      mood,
      averageScore: data.scores.length > 0 ? calculateAverage(data.scores) : 0,
      averageTimeSpent: calculateAverage(data.timeSpent),
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      sampleSize: data.total
    }))
    .filter(c => c.sampleSize >= 2); // Only include moods with sufficient data

  // Generate insights
  const insights: MoodInsight[] = [];

  const bestMood = correlations.reduce((best, current) => 
    current.averageScore > best.averageScore ? current : best
  , correlations[0]);

  const worstMood = correlations.reduce((worst, current) => 
    current.averageScore < worst.averageScore ? current : worst
  , correlations[0]);

  if (bestMood && worstMood) {
    insights.push({
      insight: `You perform best when feeling ${bestMood.mood.toLowerCase()} (avg score: ${bestMood.averageScore.toFixed(1)}%)`,
      confidence: bestMood.sampleSize >= 5 ? 0.8 : 0.6,
      supportingData: { mood: bestMood.mood, score: bestMood.averageScore }
    });

    insights.push({
      insight: `Performance drops when feeling ${worstMood.mood.toLowerCase()} (avg score: ${worstMood.averageScore.toFixed(1)}%)`,
      confidence: worstMood.sampleSize >= 5 ? 0.8 : 0.6,
      supportingData: { mood: worstMood.mood, score: worstMood.averageScore }
    });
  }

  // Analyze trigger patterns
  const triggerMap = new Map<string, {
    count: number;
    moods: string[];
    times: string[];
  }>();

  enrollment.moodEntries
    .filter(e => e.trigger)
    .forEach(entry => {
      const trigger = entry.trigger!;
      
      if (!triggerMap.has(trigger)) {
        triggerMap.set(trigger, {
          count: 0,
          moods: [],
          times: []
        });
      }

      const data = triggerMap.get(trigger)!;
      data.count++;
      data.moods.push(entry.mood);
      data.times.push(new Date(entry.timestamp).getHours().toString());
    });

  const triggerPatterns: TriggerPattern[] = Array.from(triggerMap.entries())
    .map(([trigger, data]) => ({
      trigger,
      frequency: data.count,
      associatedMoods: [...new Set(data.moods)],
      timeOfDay: data.times.length > 0 ? data.times[0] : undefined
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Analyze intervention effectiveness
  const interventionMap = new Map<string, {
    used: number;
    helpful: number;
    improvements: number[];
  }>();

  enrollment.moodEntries
    .filter(e => e.actionTaken)
    .forEach(entry => {
      const action = entry.actionTaken!;
      
      if (!interventionMap.has(action)) {
        interventionMap.set(action, {
          used: 0,
          helpful: 0,
          improvements: []
        });
      }

      const data = interventionMap.get(action)!;
      data.used++;
      
      if (entry.wasHelpful) {
        data.helpful++;
      }

      // Try to measure improvement (if we can find a mood entry after this one)
      const beforeScore = getMoodScore(entry.mood as any);
      const laterEntries = enrollment.moodEntries.filter(
        e => e.timestamp > entry.timestamp
      );
      
      if (laterEntries.length > 0) {
        const afterScore = getMoodScore(laterEntries[0].mood as any);
        data.improvements.push(afterScore - beforeScore);
      }
    });

  const interventionEffectiveness: InterventionEffect[] = Array.from(interventionMap.entries())
    .map(([action, data]) => ({
      actionTaken: action,
      successRate: data.used > 0 ? (data.helpful / data.used) * 100 : 0,
      averageImprovement: data.improvements.length > 0 
        ? calculateAverage(data.improvements) 
        : 0,
      timesUsed: data.used
    }))
    .filter(e => e.timesUsed >= 2)
    .sort((a, b) => b.successRate - a.successRate);

  return {
    enrollmentId,
    correlations,
    insights,
    triggerPatterns,
    interventionEffectiveness
  };
}

export const StruggleAnalyticsService = {
  getStruggleAnalysis,
  getMoodImpactAnalysis
};