import { watchEffect } from 'vue';
import { updateAppBadge } from '@/pwa/badge';
import { useNetworkStore } from '@/shared/stores/network';
import { useStats } from './useQueries';

export function useAppBadge() {
  const network = useNetworkStore();
  const { data: stats } = useStats();
  watchEffect(() => {
    const streak = stats.value?.streak;
    const attention = Boolean(streak && streak.current > 0 && !streak.doneToday);
    void updateAppBadge(network.pendingCount, attention);
  });
}
