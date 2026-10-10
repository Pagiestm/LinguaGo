import { api, API_BASE } from './http';
import type {
  Achievement,
  ActivityDay,
  AdminExercise,
  AdminOverview,
  AdminSeriesDetail,
  AdminSeriesRow,
  AnswerResult,
  Avatar,
  CompletedByLevel,
  ExerciseType,
  LeaderboardEntry,
  LeagueBoard,
  LevelCode,
  LevelsResponse,
  NotificationSettings,
  PublicLevel,
  ReviewSummary,
  SeriesCard,
  SeriesDetail,
  SeriesType,
  Stats,
  User,
} from './types';

const localTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const tz = () => `tz=${encodeURIComponent(localTimeZone())}`;

export const auth = {
  me: () => api<User>('/auth/me'),
  providers: () => api<{ google: boolean }>('/auth/providers'),
  login: (email: string, password: string) =>
    api<User>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (pseudo: string, email: string, password: string) =>
    api<User>('/auth/register', { method: 'POST', body: { pseudo, email, password } }),
  logout: () => api<void>('/auth/logout', { method: 'POST' }),
  forgot: (email: string) => api<void>('/auth/forgot', { method: 'POST', body: { email } }),
  reset: (token: string, password: string) =>
    api<void>('/auth/reset', { method: 'POST', body: { token, password } }),
  googleUrl: () => `${API_BASE}/auth/google`,
};

export const account = {
  update: (data: { pseudo?: string; avatarId?: number; dailyGoal?: number }) =>
    api<User>('/users/me', { method: 'PATCH', body: data }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api<void>('/users/me/password', { method: 'PATCH', body: { currentPassword, newPassword } }),
  completeFirstLogin: () => api<User>('/users/me/first-login', { method: 'PATCH' }),
  exportUrl: () => `${API_BASE}/users/me/export`,
  remove: () => api<void>('/users/me', { method: 'DELETE' }),
  avatars: () => api<Avatar[]>('/avatars'),
};

export const catalog = {
  publicLevels: () => api<PublicLevel[]>('/levels/public'),
  levels: () => api<LevelsResponse>('/levels'),
  series: (level: LevelCode, type: SeriesType) =>
    api<SeriesCard[]>(`/levels/${level}/series?type=${type}`),
  seriesDetail: (id: number) => api<SeriesDetail>(`/series/${id}`),
  favorites: () => api<SeriesDetail[]>('/me/favorites'),
};

export const progress = {
  answer: (exerciseId: number, answer: string) =>
    api<AnswerResult>(`/exercises/${exerciseId}/answer`, { method: 'POST', body: { answer } }),
  addTime: (seriesId: number, seconds: number) =>
    api<void>(`/series/${seriesId}/time`, { method: 'POST', body: { seconds } }),
  favorite: (seriesId: number) => api<void>(`/series/${seriesId}/favorite`, { method: 'PUT' }),
  unfavorite: (seriesId: number) => api<void>(`/series/${seriesId}/favorite`, { method: 'DELETE' }),
  stats: () => api<Stats>(`/me/stats?${tz()}`),
  activity: (days = 7) => api<ActivityDay[]>(`/me/activity?days=${days}&${tz()}`),
  completedSeries: () => api<CompletedByLevel[]>('/me/completed-series'),
  leaderboard: () => api<LeaderboardEntry[]>('/leaderboard/week'),
  league: () => api<LeagueBoard>('/leaderboard/league'),
  reviews: () => api<ReviewSummary>('/me/reviews'),
  reviewSession: () => api<SeriesDetail>('/me/reviews/session'),
  daily: () => api<SeriesDetail>('/me/daily'),
  achievements: () => api<Achievement[]>(`/me/achievements?${tz()}`),
};

export const notifications = {
  publicKey: () => api<{ publicKey: string | null }>('/push/public-key'),
  get: () => api<NotificationSettings | null>('/me/notification'),
  upsert: (data: {
    subscription: PushSubscriptionJSON;
    enabled?: boolean;
    frequencyDays?: number;
    time?: string;
    timeZone?: string;
  }) => api<NotificationSettings>('/me/notification', { method: 'PUT', body: data }),
  update: (data: { enabled?: boolean; frequencyDays?: number; time?: string; timeZone?: string }) =>
    api<NotificationSettings>('/me/notification', { method: 'PATCH', body: data }),
  test: () => api<void>('/me/notification/test', { method: 'POST' }),
  snooze: (minutes = 60) =>
    api<NotificationSettings>('/me/notification/snooze', { method: 'POST', body: { minutes } }),
  remove: () => api<void>('/me/notification', { method: 'DELETE' }),
};

export interface ExerciseInput {
  question: string;
  answer: string;
  type: ExerciseType;
  choices?: string[];
}

export const admin = {
  overview: () => api<AdminOverview>('/admin/overview'),
  series: (level?: LevelCode, type?: SeriesType) => {
    const params = new URLSearchParams();
    if (level) params.set('level', level);
    if (type) params.set('type', type);
    const query = params.toString();
    return api<AdminSeriesRow[]>(`/admin/series${query ? `?${query}` : ''}`);
  },
  seriesDetail: (id: number) => api<AdminSeriesDetail>(`/admin/series/${id}`),
  createSeries: (data: {
    title: string;
    description?: string;
    levelCode: LevelCode;
    type?: SeriesType;
    exercises?: ExerciseInput[];
  }) => api<{ id: number }>('/admin/series', { method: 'POST', body: data }),
  updateSeries: (
    id: number,
    data: { title?: string; description?: string; levelCode?: LevelCode; type?: SeriesType },
  ) => api<{ id: number }>(`/admin/series/${id}`, { method: 'PATCH', body: data }),
  deleteSeries: (id: number) => api<void>(`/admin/series/${id}`, { method: 'DELETE' }),
  addExercise: (seriesId: number, data: ExerciseInput) =>
    api<AdminExercise>(`/admin/series/${seriesId}/exercises`, { method: 'POST', body: data }),
  updateExercise: (id: number, data: Partial<ExerciseInput>) =>
    api<AdminExercise>(`/admin/exercises/${id}`, { method: 'PATCH', body: data }),
  deleteExercise: (id: number) => api<void>(`/admin/exercises/${id}`, { method: 'DELETE' }),
};
