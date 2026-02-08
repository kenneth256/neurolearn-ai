import { MoodType } from '@prisma/client';



export function parseEstimatedHours(duration: string): number {
  
  const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr)/i);
  const minuteMatch = duration.match(/(\d+)\s*(?:minute|min)/i);
  
  let totalMinutes = 0;
  
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60;
  }
  
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }
  
  return totalMinutes || 60; 
}

export function parseAvailableTime(availableTime: string): number {
  
  return parseEstimatedHours(availableTime);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isBeforeDeadline(estimatedDate: Date, deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  return estimatedDate <= deadlineDate;
}

export function calculateDaysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

export function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// ============================================
// STATISTICAL UTILITIES
// ============================================

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

export function calculateStandardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map(num => Math.pow(num - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  
  return Math.sqrt(avgSquareDiff);
}

export function calculatePercentile(numbers: number[], value: number): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = sorted.findIndex(num => num >= value);
  
  if (index === -1) return 100;
  
  return (index / sorted.length) * 100;
}

export function calculateTrend(data: { value: number }[]): {
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
} {
  if (data.length < 2) {
    return { direction: 'stable', changePercentage: 0 };
  }
  
  const halfPoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, halfPoint).map(d => d.value);
  const secondHalf = data.slice(halfPoint).map(d => d.value);
  
  const firstAvg = calculateAverage(firstHalf);
  const secondAvg = calculateAverage(secondHalf);
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (Math.abs(change) < 5) {
    return { direction: 'stable', changePercentage: change };
  }
  
  return {
    direction: change > 0 ? 'improving' : 'declining',
    changePercentage: Math.abs(change)
  };
}

export function calculateConsistency(data: number[]): number {
  if (data.length === 0) return 0;
  
  const stdDev = calculateStandardDeviation(data);
  const avg = calculateAverage(data);
  
  if (avg === 0) return 0;
  
  const coefficientOfVariation = stdDev / avg;
  

  return Math.max(0, 100 - (coefficientOfVariation * 100));
}

// ============================================
// MOOD UTILITIES
// ============================================

export function calculateAverageMood(moodEntries: any[]): {
  dominantMood: string;
  averageIntensity: number;
  moodDistribution: any[];
  recentTrend: 'improving' | 'declining' | 'stable';
} | undefined {
  if (!moodEntries || moodEntries.length === 0) {
    return undefined;
  }
  
  // Count mood occurrences
  const moodCounts = new Map<string, { count: number; totalIntensity: number }>();
  
  moodEntries.forEach(entry => {
    const current = moodCounts.get(entry.mood) || { count: 0, totalIntensity: 0 };
    moodCounts.set(entry.mood, {
      count: current.count + 1,
      totalIntensity: current.totalIntensity + entry.intensity
    });
  });
  
  // Find dominant mood
  let dominantMood = '';
  let maxCount = 0;
  
  moodCounts.forEach((data, mood) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      dominantMood = mood;
    }
  });
  
  // Calculate distribution
  const moodDistribution = Array.from(moodCounts.entries()).map(([mood, data]) => ({
    mood,
    count: data.count,
    percentage: (data.count / moodEntries.length) * 100,
    averageIntensity: data.totalIntensity / data.count
  }));
  
  // Calculate average intensity
  const averageIntensity = calculateAverage(moodEntries.map(e => e.intensity));
  
  // Calculate trend from recent moods
  const positiveMoods = ['ENGAGED', 'EXCITED'];
  const negativeMoods = ['FRUSTRATED', 'CONFUSED', 'OVERWHELMED', 'BORED'];
  
  const recentCount = Math.min(10, moodEntries.length);
  const recentMoods = moodEntries.slice(-recentCount);
  const earlyMoods = moodEntries.slice(0, recentCount);
  
  const recentPositive = recentMoods.filter(m => positiveMoods.includes(m.mood)).length;
  const earlyPositive = earlyMoods.filter(m => positiveMoods.includes(m.mood)).length;
  
  const trendDiff = recentPositive - earlyPositive;
  
  let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (trendDiff > 1) recentTrend = 'improving';
  else if (trendDiff < -1) recentTrend = 'declining';
  
  return {
    dominantMood,
    averageIntensity,
    moodDistribution,
    recentTrend
  };
}

export function getMoodScore(mood: MoodType): number {
  const moodScores: Record<MoodType, number> = {
    EXCITED: 5,
    ENGAGED: 4,
    NEUTRAL: 3,
    BORED: 2,
    CONFUSED: 2,
    FRUSTRATED: 1,
    OVERWHELMED: 1
  };
  
  return moodScores[mood] || 3;
}

// ============================================
// RISK ASSESSMENT UTILITIES
// ============================================

export function calculateRiskLevel(
  completion: number,
  lastAccessDays: number,
  averageMood?: number,
  masteryScore?: number
): 'low' | 'medium' | 'high' | 'critical' {
  let riskScore = 0;
  
  // Completion factor
  if (completion < 20) riskScore += 3;
  else if (completion < 50) riskScore += 1;
  
  // Inactivity factor
  if (lastAccessDays > 14) riskScore += 3;
  else if (lastAccessDays > 7) riskScore += 2;
  else if (lastAccessDays > 3) riskScore += 1;
  
  // Mood factor
  if (averageMood && averageMood < 2) riskScore += 2;
  else if (averageMood && averageMood < 3) riskScore += 1;
  
  // Mastery factor
  if (masteryScore && masteryScore < 50) riskScore += 2;
  else if (masteryScore && masteryScore < 70) riskScore += 1;
  
  if (riskScore >= 7) return 'critical';
  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

// ============================================
// AGGREGATION UTILITIES
// ============================================

export function aggregateByTopic(items: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();
  
  items.forEach(item => {
    const topic = item.topic || item.conceptId || 'Unknown';
    const existing = grouped.get(topic) || [];
    grouped.set(topic, [...existing, item]);
  });
  
  return grouped;
}

export function groupByDate(items: any[], dateField: string): Map<string, any[]> {
  const grouped = new Map<string, any[]>();
  
  items.forEach(item => {
    const date = new Date(item[dateField]);
    const dateKey = date.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, item]);
  });
  
  return grouped;
}

// ============================================
// SCORING UTILITIES
// ============================================

export function normalizeScore(score: number, min: number = 0, max: number = 100): number {
  if (max === min) return 0;
  return ((score - min) / (max - min)) * 100;
}

export function calculateWeightedScore(scores: { value: number; weight: number }[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  
  if (totalWeight === 0) return 0;
  
  const weightedSum = scores.reduce((sum, s) => sum + (s.value * s.weight), 0);
  
  return weightedSum / totalWeight;
}

// ============================================
// STREAK UTILITIES
// ============================================

export function calculateStreak(activities: { timestamp: Date }[]): {
  current: number;
  longest: number;
  startDate?: Date;
} {
  if (activities.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  const sortedDates = activities
    .map(a => new Date(a.timestamp).toISOString().split('T')[0])
    .sort()
    .reverse();
  
  const uniqueDates = [...new Set(sortedDates)];
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let streakStart: Date | undefined;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = addDays(new Date(), -1).toISOString().split('T')[0];
  
  // Calculate current streak
  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    streakStart = new Date(uniqueDates[0]);
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);
      const dayDiff = calculateDaysBetween(currentDate, previousDate);
      
      if (dayDiff === 1) {
        currentStreak++;
        streakStart = currentDate;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i - 1]);
    const dayDiff = calculateDaysBetween(currentDate, previousDate);
    
    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  return {
    current: currentStreak,
    longest: longestStreak,
    startDate: streakStart
  };
}

// ============================================
// RECOMMENDATION UTILITIES
// ============================================

export function generateRecommendations(
  analytics: {
    completion: number;
    masteryScore: number;
    riskLevel: string;
    mood?: any;
    velocity?: number;
  }
): string[] {
  const recommendations: string[] = [];
  
  // Completion-based
  if (analytics.completion < 30) {
    recommendations.push('Set a daily study goal to build momentum');
  }
  
  // Mastery-based
  if (analytics.masteryScore < 70) {
    recommendations.push('Review previous modules to strengthen foundation');
    recommendations.push('Try practice exercises to improve understanding');
  }
  
  // Risk-based
  if (analytics.riskLevel === 'high' || analytics.riskLevel === 'critical') {
    recommendations.push('Schedule regular study sessions to stay on track');
    recommendations.push('Consider adjusting your learning pace');
  }
  
  // Mood-based
  if (analytics.mood?.dominantMood === 'FRUSTRATED') {
    recommendations.push('Take a break and return with fresh perspective');
    recommendations.push('Reach out to instructor for help');
  } else if (analytics.mood?.dominantMood === 'BORED') {
    recommendations.push('Try more challenging content');
    recommendations.push('Explore practical applications of concepts');
  }
  
  // Velocity-based
  if (analytics.velocity && analytics.velocity < 0.7) {
    recommendations.push('Allocate more study time per session');
  } else if (analytics.velocity && analytics.velocity > 1.3) {
    recommendations.push('Great pace! Consider tackling advanced topics');
  }
  
  return recommendations;
}

// ============================================
// EXPORT ALL
// ============================================

export const AnalyticsUtils = {
  time: {
    parseEstimatedHours,
    parseAvailableTime,
    addDays,
    isBeforeDeadline,
    calculateDaysBetween,
    formatDuration,
    getTimeOfDay
  },
  stats: {
    calculateAverage,
    calculateMedian,
    calculateStandardDeviation,
    calculatePercentile,
    calculateTrend,
    calculateConsistency
  },
  mood: {
    calculateAverageMood,
    getMoodScore
  },
  risk: {
    calculateRiskLevel
  },
  aggregation: {
    aggregateByTopic,
    groupByDate
  },
  scoring: {
    normalizeScore,
    calculateWeightedScore
  },
  streak: {
    calculateStreak
  },
  recommendations: {
    generateRecommendations
  }
};