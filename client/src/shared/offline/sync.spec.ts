import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/http';
import { useNetworkStore } from '@/shared/stores/network';
import { clearOfflineData, enqueue, pendingCount } from './db';
import { syncPendingActions } from './sync';

const answer = vi.fn();
const addTime = vi.fn();
vi.mock('@/shared/api/endpoints', () => ({
  progress: {
    answer: (...args: unknown[]) => answer(...args),
    addTime: (...args: unknown[]) => addTime(...args),
  },
}));
vi.mock('@pinia/colada', () => ({
  useQueryCache: () => ({ invalidateQueries: vi.fn().mockResolvedValue(undefined) }),
}));

describe('syncPendingActions', () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    answer.mockReset();
    addTime.mockReset();
    await clearOfflineData();
    vi.stubGlobal('navigator', { onLine: true });
  });

  it('rejoue les réponses en attente dans l’ordre puis vide la file', async () => {
    await enqueue({ kind: 'answer', exerciseId: 1, seriesId: 9, answer: 'hello', createdAt: 1 });
    await enqueue({ kind: 'time', seriesId: 9, seconds: 42, createdAt: 2 });
    answer.mockResolvedValue({ correct: true });
    addTime.mockResolvedValue(undefined);

    await syncPendingActions();

    expect(answer).toHaveBeenCalledWith(1, 'hello');
    expect(addTime).toHaveBeenCalledWith(9, 42);
    expect(await pendingCount()).toBe(0);
    expect(useNetworkStore().pendingCount).toBe(0);
  });

  it('abandonne une action refusée par le serveur mais garde la file en cas de coupure', async () => {
    await enqueue({ kind: 'answer', exerciseId: 1, seriesId: 9, answer: 'x', createdAt: 1 });
    await enqueue({ kind: 'answer', exerciseId: 2, seriesId: 9, answer: 'y', createdAt: 2 });
    answer
      .mockRejectedValueOnce(new ApiError(404, 'Exercice introuvable'))
      .mockRejectedValueOnce(new ApiError(0, 'Connexion impossible'));

    await syncPendingActions();

    expect(await pendingCount()).toBe(1);
    expect(useNetworkStore().pendingCount).toBe(1);
  });
});
