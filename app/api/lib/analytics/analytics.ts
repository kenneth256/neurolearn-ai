// ============================================
// ANALYTICS TYPES
// ============================================

export interface PerformanceDashboard {
  userId: string;
  enrollments: EnrollmentAnalytics[];
  overallStats: OverallStats;
  generatedAt: Date;
}

export interface EnrollmentAnalytics {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  thumbnail?: string;
  overallCompletion: number;
  averageMasteryScore: number;
  totalTimeSpent: number;
  status: string;
  modulesCompleted: number;
  totalModules: number;
  lessonsCompleted: number;
  totalLessons: number;
  averageMood?: MoodAnalytics;
  currentStreak: number;
  estimatedCompletionDate?: Date;
  riskLevel: RiskLevel;
  enrolledAt: Date;
  lastAccessedAt: Date;
}

export interface OverallStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalTimeSpent: number;
  averageMasteryScore: number;
  totalModulesCompleted: number;
  totalLessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

export interface MoodAnalytics {
  dominantMood: string;
  averageIntensity: number;
  moodDistribution: MoodDistribution[];
  recentTrend: 'improving' | 'declining' | 'stable';
}

export interface MoodDistribution {
  mood: string;
  count: number;
  percentage: number;
  averageIntensity: number;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================
// LEARNING VELOCITY
// ============================================

export interface LearningVelocity {
  enrollmentId: string;
  averageEfficiency: number; // actual time / estimated time
  totalLessonsCompleted: number;
  averageTimePerLesson: number;
  velocityTrend: VelocityTrend;
  lessonBreakdown: LessonVelocity[];
  recommendations: string[];
}

export interface LessonVelocity {
  lessonId: string;
  lessonTitle: string;
  day: number;
  actualTime: number;
  estimatedTime: number;
  efficiency: number;
  completedAt?: Date;
}

export interface VelocityTrend {
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  recentAverage: number;
  earlyAverage: number;
}

// ============================================
// STRUGGLE AREAS
// ============================================

export interface StruggleAnalysis {
  userId: string;
  topStruggleAreas: StruggleArea[];
  improvementAreas: ImprovementArea[];
  recommendations: Recommendation[];
  overallDifficulty: number;
}

export interface StruggleArea {
  topic: string;
  conceptId?: string;
  frequency: number;
  averageScore: number;
  lastAttemptDate: Date;
  trend: 'improving' | 'declining' | 'stable';
  relatedLessons: string[];
}

export interface ImprovementArea {
  topic: string;
  previousScore: number;
  currentScore: number;
  improvement: number;
  lastPracticed: Date;
}

export interface Recommendation {
  type: 'review' | 'practice' | 'resource' | 'break';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionUrl?: string;
}

// ============================================
// MOOD IMPACT
// ============================================

export interface MoodImpactAnalysis {
  enrollmentId: string;
  correlations: MoodPerformanceCorrelation[];
  insights: MoodInsight[];
  triggerPatterns: TriggerPattern[];
  interventionEffectiveness: InterventionEffect[];
}

export interface MoodPerformanceCorrelation {
  mood: string;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
  sampleSize: number;
}

export interface MoodInsight {
  insight: string;
  confidence: number;
  supportingData: any;
}

export interface TriggerPattern {
  trigger: string;
  frequency: number;
  associatedMoods: string[];
  timeOfDay?: string;
}

export interface InterventionEffect {
  actionTaken: string;
  successRate: number;
  averageImprovement: number;
  timesUsed: number;
}

// ============================================
// MASTERY PROGRESSION
// ============================================

export interface MasteryProgression {
  enrollmentId: string;
  modules: ModuleMastery[];
  overallTrend: ProgressionTrend;
  predictedMasteryDate?: Date;
  strengths: string[];
  weaknesses: string[];
}

export interface ModuleMastery {
  moduleId: string;
  moduleName: string;
  moduleNumber: number;
  currentMasteryScore: number;
  status: string;
  attemptHistory: MasteryAttempt[];
  timeToMastery?: number; // in milliseconds
  averageAttempts: number;
  progression: number; // percentage improvement
}

export interface MasteryAttempt {
  score: number;
  assessmentType: string;
  date: Date;
  timeSinceLastAttempt?: number;
}

export interface ProgressionTrend {
  direction: 'accelerating' | 'steady' | 'slowing';
  averageImprovementRate: number;
  consistencyScore: number;
}

// ============================================
// ADAPTIVE QUIZ ANALYTICS
// ============================================

export interface AdaptiveQuizAnalytics {
  userId: string;
  learnerProfile: LearnerProfileData;
  quizPerformance: QuizPerformanceMetrics;
  adaptationEffectiveness: AdaptationMetrics;
  recommendations: QuizRecommendation[];
}

export interface LearnerProfileData {
  preferredDifficulty: string;
  averageAccuracy: number;
  learningVelocity: number;
  retentionRate: number;
  optimalQuizLength?: number;
  bestTimeOfDay?: string;
  commonStruggles?: string[];
  strongTopics?: string[];
}

export interface QuizPerformanceMetrics {
  totalQuizzesTaken: number;
  averageScore: number;
  improvementRate: number;
  accuracyByDifficulty: DifficultyAccuracy[];
  averageTimePerQuestion: number;
  completionRate: number;
}

export interface DifficultyAccuracy {
  difficulty: string;
  averageScore: number;
  attempts: number;
  confidenceLevel: number;
}

export interface AdaptationMetrics {
  adaptationSuccessRate: number;
  averageScoreImprovement: number;
  engagementIncrease: number;
  appropriateDifficultyRate: number;
}

export interface QuizRecommendation {
  type: 'difficulty' | 'length' | 'timing' | 'focus';
  suggestion: string;
  reasoning: string;
  expectedImpact: string;
}

// ============================================
// COMPLETION PREDICTION
// ============================================

export interface CompletionPrediction {
  enrollmentId: string;
  currentProgress: number;
  estimatedCompletionDate: Date;
  onTrackForDeadline: boolean;
  deadline?: string;
  daysRemaining?: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendations: string[];
  milestones: Milestone[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  mitigation?: string;
}

export interface Milestone {
  name: string;
  targetDate: Date;
  achieved: boolean;
  progress: number;
}

// ============================================
// SPACED REPETITION ANALYTICS
// ============================================

export interface SpacedRepetitionAnalytics {
  enrollmentId: string;
  totalReviewItems: number;
  completedReviews: number;
  overdueReviews: number;
  upcomingReviews: number;
  averageRepetitions: number;
  retentionRate: number;
  effectiveness: EffectivenessMetrics;
  schedule: ReviewSchedule[];
}

export interface EffectivenessMetrics {
  successRate: number;
  averageRecallStrength: number;
  optimalInterval: number;
  adherenceRate: number;
}

export interface ReviewSchedule {
  date: Date;
  itemCount: number;
  estimatedTime: number;
  topics: string[];
}

// ============================================
// COHORT ANALYTICS
// ============================================

export interface CohortAnalytics {
  cohortId: string;
  cohortName: string;
  totalLearners: number;
  averageCompletion: number;
  averageMastery: number;
  topPerformers: LearnerSummary[];
  strugglingLearners: LearnerSummary[];
  dropoutRate: number;
  engagementRate: number;
  comparisonWithUser?: UserCohortComparison;
}

export interface LearnerSummary {
  userId: string;
  name: string;
  completion: number;
  masteryScore: number;
  rank: number;
}

export interface UserCohortComparison {
  userRank: number;
  percentile: number;
  comparisonToAverage: {
    completion: number;
    mastery: number;
    timeSpent: number;
  };
}

// ============================================
// TIME ANALYTICS
// ============================================

export interface TimeAnalytics {
  userId: string;
  dailyActivity: DailyActivity[];
  weeklyPatterns: WeeklyPattern;
  productiveHours: ProductiveHour[];
  studyStreak: StreakData;
  timeDistribution: TimeDistribution;
}

export interface DailyActivity {
  date: Date;
  timeSpent: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  averageFocus: number;
}

export interface WeeklyPattern {
  mostActiveDay: string;
  leastActiveDay: string;
  averageDailyTime: number;
  consistency: number;
}

export interface ProductiveHour {
  hour: number;
  averageScore: number;
  averageCompletion: number;
  sessionsCount: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  nextMilestone: number;
}

export interface TimeDistribution {
  lessons: number;
  quizzes: number;
  reviews: number;
  other: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AnalyticsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  courseId?: string;
  moduleId?: string;
  enrollmentId?: string;
}

// ============================================
// CHART DATA TYPES
// ============================================

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface ProgressChartData {
  completed: number;
  inProgress: number;
  notStarted: number;
  mastered: number;
}