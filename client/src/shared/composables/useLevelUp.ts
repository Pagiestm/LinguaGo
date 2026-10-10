import { useToast } from '@nuxt/ui/composables';
import confetti from 'canvas-confetti';
import { watch } from 'vue';
import { useStats } from './useQueries';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const STORAGE_KEY = 'linguago.level';

export function useLevelUp() {
  const toast = useToast();
  const reducedMotion = usePrefersReducedMotion();
  const { data: stats } = useStats();

  watch(
    () => stats.value?.level.current.code,
    (code) => {
      if (!code) return;
      let previous: string | null;
      try {
        previous = localStorage.getItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        return;
      }
      if (!previous || previous === code) return;
      toast.add({
        title: `Niveau ${code} atteint !`,
        description: `Lingo est fier de vous : ${stats.value?.level.current.title}.`,
        icon: 'i-lucide-party-popper',
        color: 'secondary',
        duration: 8000,
      });
      if (!reducedMotion.value) {
        void confetti({ particleCount: 180, spread: 90, origin: { y: 0.3 } });
      }
    },
  );
}
