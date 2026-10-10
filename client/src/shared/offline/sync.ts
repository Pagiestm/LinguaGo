import { useQueryCache } from '@pinia/colada';
import { watch } from 'vue';
import { progress } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import { useNetworkStore } from '@/shared/stores/network';
import { pendingActions, pendingCount, removePending } from './db';

let running: Promise<void> | null = null;

export function syncPendingActions(): Promise<void> {
  running ??= drain().finally(() => {
    running = null;
  });
  return running;
}

async function invalidateAll() {
  const cache = useQueryCache();
  await cache.invalidateQueries({ key: ['me'] });
  await cache.invalidateQueries({ key: ['catalog'] });
}

async function drain() {
  const network = useNetworkStore();
  if (!network.online) return;
  const entries = await pendingActions();
  network.pendingCount = entries.length;
  if (entries.length === 0) return;

  network.syncing = true;
  let synced = 0;
  try {
    for (const { key, action } of entries) {
      try {
        if (action.kind === 'answer') await progress.answer(action.exerciseId, action.answer);
        else await progress.addTime(action.seriesId, action.seconds);
        await removePending(key);
        synced += 1;
      } catch (error) {
        if (error instanceof ApiError && !error.isNetworkError && error.status !== 401) {
          await removePending(key);
          continue;
        }
        break;
      }
    }
  } finally {
    network.syncing = false;
    network.pendingCount = await pendingCount();
  }

  if (synced > 0) await invalidateAll();
}

export function startOfflineSync() {
  const network = useNetworkStore();
  void pendingCount().then((count) => {
    network.pendingCount = count;
  });
  watch(
    () => network.online,
    (online) => {
      if (online) void syncPendingActions();
    },
    { immediate: true },
  );

  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === 'queue-synced') {
      void pendingCount().then((count) => {
        network.pendingCount = count;
      });
      void invalidateAll();
    } else if (event.data?.type === 'favorites-refreshed') {
      void useQueryCache().invalidateQueries({ key: ['me', 'favorites'] });
    }
  });
}
