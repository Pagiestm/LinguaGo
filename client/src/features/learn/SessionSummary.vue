<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { useToast } from '@nuxt/ui/composables';
import { computed } from 'vue';
import InstallBanner from '@/pwa/InstallBanner.vue';
import type { ExerciseView, SeriesDetail } from '@/shared/api/types';
import { formatClock } from '@/shared/lib/format';
import { shareText } from '@/shared/lib/share';
import AppMascot from '@/shared/ui/AppMascot.vue';

const props = defineProps<{
  series: SeriesDetail;
  results: { exercise: ExerciseView; correct: boolean }[];
  elapsed: number;
}>();
defineEmits<{ restart: [] }>();

const toast = useToast();

const correct = computed(() => props.results.filter((r) => r.correct).length);
const perfect = computed(() => correct.value === props.results.length && props.results.length > 0);
const stars = computed(() => {
  if (props.results.length === 0) return 0;
  const ratio = correct.value / props.results.length;
  return ratio === 1 ? 3 : ratio >= 0.5 ? 2 : correct.value > 0 ? 1 : 0;
});

async function share() {
  const outcome = await shareText({
    title: 'LinguaGo',
    text: `${correct.value} bonne${correct.value > 1 ? 's' : ''} réponse${correct.value > 1 ? 's' : ''} sur ${props.results.length} à « ${props.series.title} » (niveau ${props.series.level.code}) avec LinguaGo !`,
    url: window.location.origin,
  });
  if (outcome === 'copied') {
    toast.add({ title: 'Score copié dans le presse-papiers', icon: 'i-lucide-clipboard-check' });
  } else if (outcome === 'unavailable') {
    toast.add({ title: 'Partage indisponible sur ce navigateur', color: 'warning' });
  }
}
</script>

<template>
  <section
    class="motion-safe:animate-pop rounded-3xl border-2 border-default bg-default p-6 shadow-[0_8px_0_0_var(--ui-border)] sm:p-8"
    aria-labelledby="summary-title"
  >
    <div class="flex flex-col items-center text-center">
      <AppMascot
        :expression="perfect ? 'cheer' : correct > 0 ? 'happy' : 'oops'"
        animated
        class="size-28"
      />
      <div class="mt-4 flex gap-1" aria-hidden="true">
        <span
          v-for="n in 3"
          :key="n"
          class="i-lucide-star size-8"
          :class="n <= stars ? 'text-secondary' : 'text-elevated'"
        />
      </div>
      <h2 id="summary-title" class="mt-3 text-3xl">
        {{ perfect ? 'Sans faute !' : 'Série terminée' }}
      </h2>
      <p class="mt-1 font-bold text-muted">
        {{ correct }} bonne{{ correct > 1 ? 's' : '' }} réponse{{ correct > 1 ? 's' : '' }} sur
        {{ results.length }} · {{ formatClock(elapsed) }}
      </p>
    </div>

    <ol class="mt-8 divide-y-2 divide-default" role="list">
      <li
        v-for="(result, i) in results"
        :key="result.exercise.id"
        class="flex items-start gap-3 py-3"
      >
        <span
          :class="
            result.correct ? 'i-lucide-circle-check text-success' : 'i-lucide-circle-x text-error'
          "
          class="mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <p class="text-sm font-bold">
          <span class="text-muted">{{ i + 1 }}.</span> {{ result.exercise.question }}
        </p>
      </li>
    </ol>

    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <UButton
        :to="{
          name: 'series',
          params: { level: series.level.code },
          query: series.type === 'TALK' ? { type: 'TALK' } : {},
        }"
        variant="outline"
        color="neutral"
        size="lg"
        icon="i-lucide-list"
        class="btn-pop btn-pop-neutral font-extrabold"
        >Autres séries</UButton
      >
      <UButton
        v-if="!perfect"
        icon="i-lucide-rotate-ccw"
        size="lg"
        class="btn-pop font-extrabold"
        @click="$emit('restart')"
        >Recommencer</UButton
      >
      <UButton
        v-else
        to="/dashboard"
        icon="i-lucide-layout-dashboard"
        size="lg"
        class="btn-pop font-extrabold"
        >Tableau de bord</UButton
      >
      <UButton
        variant="ghost"
        color="neutral"
        size="lg"
        icon="i-lucide-share-2"
        class="font-bold"
        @click="share"
        >Partager</UButton
      >
    </div>

    <InstallBanner class="mt-8" />
  </section>
</template>
