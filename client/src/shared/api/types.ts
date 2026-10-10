export type Role = 'USER' | 'ADMIN';
export type LevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type SeriesType = 'DEFAULT' | 'TALK';
export type ExerciseType =
  'MULTIPLE_CHOICE' | 'TRANSLATION' | 'TRUE_FALSE' | 'TALK' | 'FILL_BLANK' | 'ORDER' | 'DICTATION';

export interface Avatar {
  id: number;
  svg: string;
}

export interface User {
  id: string;
  pseudo: string;
  email: string;
  role: Role;
  firstLogin: boolean;
  dailyGoal: number;
  leagueTier: number;
  hasGoogle: boolean;
  createdAt: string;
  avatar: Avatar | null;
}

export interface LevelProgress {
  current: { code: LevelCode; title: string };
  next: { code: LevelCode; title: string; pointsRequired: number } | null;
  pointsInLevel: number;
  pointsForLevel: number;
  progress: number;
}

export interface LevelOverview {
  code: LevelCode;
  title: string;
  description: string;
  position: number;
  pointsPerExercise: number;
  exerciseCount: number;
  completedExercises: number;
  series: Record<SeriesType, { total: number; completed: number }>;
}

export interface LevelsResponse {
  userLevel: LevelProgress;
  levels: LevelOverview[];
}

export interface PublicLevel {
  code: LevelCode;
  title: string;
  position: number;
  pointsPerExercise: number;
  exerciseCount: number;
  winnablePoints: number;
}

export interface SeriesCard {
  id: number;
  title: string;
  description: string | null;
  type: SeriesType;
  level: { code: LevelCode; title: string; pointsPerExercise: number };
  exerciseCount: number;
  completedCount: number;
  isFavorite: boolean;
  isCompleted: boolean;
}

export interface ExerciseView {
  id: number;
  type: ExerciseType;
  question: string;
  choices: string[];
  spokenText?: string;
  isCompleted: boolean;
  answerHash: string;
  answerHashes?: string[];
}

export interface SeriesDetail extends SeriesCard {
  exercises: ExerciseView[];
}

export interface AnswerResult {
  correct: boolean;
  alreadyCompleted: boolean;
  pointsWon: number;
  seriesCompleted: boolean;
  expectedAnswer?: string;
  verifiedBy: 'exact' | 'spoken' | 'offline';
}

export interface Streak {
  current: number;
  best: number;
  doneToday: boolean;
}

export interface Stats {
  points: number;
  successfulExercises: number;
  failedExercises: number;
  completedSeries: number;
  timeSpentSeconds: number;
  favoritesCount: number;
  level: LevelProgress;
  streak: Streak;
  today: { points: number; goal: number };
  league: { tier: number; name: string };
}

export interface ReviewSummary {
  due: number;
  total: number;
  nextDueAt: string | null;
}

export interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  isNew: boolean;
}

export interface LeagueBoard {
  tier: number;
  name: string;
  top: boolean;
  promote: number;
  relegate: number;
  members: number;
  resetsAt: string;
  entries: LeaderboardEntry[];
}

export interface AdminSeriesRow {
  id: number;
  title: string;
  description: string | null;
  type: SeriesType;
  level: { code: LevelCode; title: string };
  exerciseCount: number;
  completions: number;
  createdAt: string;
}

export interface AdminExercise {
  id: number;
  question: string;
  answer: string;
  type: ExerciseType;
  choices: string[];
}

export interface AdminSeriesDetail {
  id: number;
  title: string;
  description: string | null;
  type: SeriesType;
  level: { code: LevelCode; title: string };
  exercises: AdminExercise[];
}

export interface AdminOverview {
  users: number;
  series: number;
  exercises: number;
  completions: number;
  activeWeek: number;
}

export interface ActivityDay {
  date: string;
  exercises: number;
  points: number;
}

export interface CompletedByLevel {
  code: LevelCode;
  title: string;
  count: number;
}

export interface LeaderboardEntry {
  rank: number;
  pseudo: string;
  avatar: Avatar | null;
  points: number;
  isMe: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  frequencyDays: number;
  time: string;
  timeZone: string;
  nextNotifyAt: string;
  endpoint: string;
}
