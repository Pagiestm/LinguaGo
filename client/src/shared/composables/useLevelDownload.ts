import { useToast } from '@nuxt/ui/composables';
import { type MaybeRefOrGetter, ref, toValue, watch } from 'vue';
import { ApiError } from '@/shared/api/http';
import type { LevelCode, SeriesType } from '@/shared/api/types';
import { downloadedLevel, removeLevel } from '@/shared/offline/db';
import { downloadLevel } from '@/shared/offline/download';

export function useLevelDownload(
  code: MaybeRefOrGetter<LevelCode>,
  type: MaybeRefOrGetter<SeriesType>,
) {
  const toast = useToast();
  const downloaded = ref<{ count: number; downloadedAt: number } | null>(null);
  const busy = ref(false);
  const progress = ref<{ done: number; total: number } | null>(null);

  async function refresh() {
    const level = await downloadedLevel(toValue(code), toValue(type));
    downloaded.value = level ? { count: level.count, downloadedAt: level.downloadedAt } : null;
  }

  watch([() => toValue(code), () => toValue(type)], () => void refresh(), { immediate: true });

  async function download() {
    busy.value = true;
    try {
      const count = await downloadLevel(toValue(code), toValue(type), (done, total) => {
        progress.value = { done, total };
      });
      await refresh();
      toast.add({
        title: 'Niveau disponible hors connexion',
        description: `${count} série${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''} sur cet appareil.`,
        icon: 'i-lucide-circle-check',
        color: 'success',
      });
    } catch (error) {
      toast.add({
        title: 'Téléchargement interrompu',
        description:
          error instanceof ApiError && error.isNetworkError
            ? 'Le réseau a été perdu en cours de route. Réessayez une fois connecté.'
            : undefined,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    } finally {
      busy.value = false;
      progress.value = null;
    }
  }

  async function remove() {
    busy.value = true;
    try {
      await removeLevel(toValue(code), toValue(type));
      await refresh();
      toast.add({ title: 'Niveau retiré de cet appareil', icon: 'i-lucide-trash-2' });
    } finally {
      busy.value = false;
    }
  }

  return { downloaded, busy, progress, download, remove };
}
