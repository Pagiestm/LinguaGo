import { useQuery, useQueryCache } from '@pinia/colada';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { catalog, progress } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import type { LevelCode, SeriesDetail, SeriesType } from '@/shared/api/types';
import {
  cacheFavorites,
  cachedFavorites,
  cachedSeries,
  cachedSeriesForLevel,
} from '@/shared/offline/db';

export const keys = {
  stats: ['me', 'stats'] as const,
  activity: (days: number) => ['me', 'activity', days] as const,
  completedSeries: ['me', 'completed-series'] as const,
  leaderboard: ['me', 'leaderboard'] as const,
  favorites: ['me', 'favorites'] as const,
  notification: ['me', 'notification'] as const,
  reviews: ['me', 'reviews'] as const,
  achievements: ['me', 'achievements'] as const,
  league: ['me', 'league'] as const,
  levels: ['catalog', 'levels'] as const,
  series: (level: LevelCode, type: SeriesType) => ['catalog', 'series', level, type] as const,
  seriesDetail: (id: number) => ['catalog', 'series-detail', id] as const,
};

export const useStats = () => useQuery({ key: keys.stats, query: progress.stats });

export const useActivity = (days = 7) =>
  useQuery({ key: keys.activity(days), query: () => progress.activity(days) });

export const useCompletedSeries = () =>
  useQuery({ key: keys.completedSeries, query: progress.completedSeries });

export const useLeaderboard = () =>
  useQuery({ key: keys.leaderboard, query: progress.leaderboard, staleTime: 60_000 });

export const useReviews = () => useQuery({ key: keys.reviews, query: progress.reviews });

export const useAchievements = () =>
  useQuery({ key: keys.achievements, query: progress.achievements });

export const useLeague = () =>
  useQuery({ key: keys.league, query: progress.league, staleTime: 60_000 });

export const useLevels = () => useQuery({ key: keys.levels, query: catalog.levels });

export const useSeriesList = (
  level: MaybeRefOrGetter<LevelCode>,
  type: MaybeRefOrGetter<SeriesType>,
) =>
  useQuery({
    key: () => keys.series(toValue(level), toValue(type)),
    query: async () => {
      try {
        return await catalog.series(toValue(level), toValue(type));
      } catch (error) {
        if (error instanceof ApiError && error.isNetworkError) {
          const cached = await cachedSeriesForLevel(toValue(level), toValue(type));
          if (cached.length > 0) return cached;
        }
        throw error;
      }
    },
  });

export const useFavorites = () =>
  useQuery({
    key: keys.favorites,
    query: async () => {
      try {
        const favorites = await catalog.favorites();
        void cacheFavorites(favorites);
        return favorites;
      } catch (error) {
        if (error instanceof ApiError && error.isNetworkError) return cachedFavorites();
        throw error;
      }
    },
  });

export function useSeriesDetail(id: MaybeRefOrGetter<number>) {
  const query = useQuery({
    key: () => keys.seriesDetail(toValue(id)),
    query: async (): Promise<SeriesDetail & { offline?: boolean }> => {
      try {
        return await catalog.seriesDetail(toValue(id));
      } catch (error) {
        if (error instanceof ApiError && error.isNetworkError) {
          const cached = await cachedSeries(toValue(id));
          if (cached) return { ...cached, offline: true };
        }
        throw error;
      }
    },
  });
  const fromCache = computed(() => query.data.value?.offline === true);
  return { ...query, fromCache };
}

export function useInvalidate() {
  const cache = useQueryCache();
  return {
    me: () => cache.invalidateQueries({ key: ['me'] }),
    catalog: () => cache.invalidateQueries({ key: ['catalog'] }),
    all: () =>
      Promise.all([
        cache.invalidateQueries({ key: ['me'] }),
        cache.invalidateQueries({ key: ['catalog'] }),
      ]),
  };
}
