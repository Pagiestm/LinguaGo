import { useToast } from '@nuxt/ui/composables';
import { ref } from 'vue';
import { progress } from '@/shared/api/endpoints';
import { useInvalidate } from './useQueries';

export function useFavorite() {
  const toast = useToast();
  const invalidate = useInvalidate();
  const busy = ref<number | null>(null);

  async function toggle(seriesId: number, isFavorite: boolean) {
    busy.value = seriesId;
    try {
      if (isFavorite) await progress.unfavorite(seriesId);
      else await progress.favorite(seriesId);
      await invalidate.all();
      toast.add({
        title: isFavorite ? 'Retirée des favoris' : 'Ajoutée aux favoris',
        description: isFavorite ? undefined : 'Cette série reste disponible hors connexion.',
        icon: isFavorite ? 'i-lucide-heart-off' : 'i-lucide-heart',
        color: 'primary',
      });
    } catch {
      toast.add({
        title: 'Impossible de modifier les favoris',
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    } finally {
      busy.value = null;
    }
  }

  return { toggle, busy };
}
