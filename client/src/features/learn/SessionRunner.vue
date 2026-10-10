<script setup lang="ts">
import confetti from 'canvas-confetti';
import { computed, watch } from 'vue';
import type { SeriesDetail } from '@/shared/api/types';
import { formatClock } from '@/shared/lib/format';
import { usePrefersReducedMotion } from '@/shared/composables/usePrefersReducedMotion';
import ExerciseDictation from './exercises/ExerciseDictation.vue';
import ExerciseFillBlank from './exercises/ExerciseFillBlank.vue';
import ExerciseMultipleChoice from './exercises/ExerciseMultipleChoice.vue';
import ExerciseOrder from './exercises/ExerciseOrder.vue';
import ExerciseTalk from './exercises/ExerciseTalk.vue';
import ExerciseTranslation from './exercises/ExerciseTranslation.vue';
import ExerciseTrueFalse from './exercises/ExerciseTrueFalse.vue';
import FeedbackPanel from './FeedbackPanel.vue';
import SessionSummary from './SessionSummary.vue';
import { useSession } from './useSession';

const props = defineProps<{ series: SeriesDetail }>();
const emit = defineEmits<{ finished: [correct: number, total: number] }>();

const reducedMotion = usePrefersReducedMotion();
const session = useSession(() => props.series);

const progressRatio = computed(() =>
  session.total.value === 0 ? 0 : session.index.value / session.total.value,
);

const components = {
  MULTIPLE_CHOICE: ExerciseMultipleChoice,
  TRUE_FALSE: ExerciseTrueFalse,
  TRANSLATION: ExerciseTranslation,
  TALK: ExerciseTalk,
  FILL_BLANK: ExerciseFillBlank,
  ORDER: ExerciseOrder,
  DICTATION: ExerciseDictation,
} as const;

watch(session.finished, (done) => {
  if (!done) return;
  emit('finished', session.correctCount.value, session.total.value);
  if (
    !reducedMotion.value &&
    session.total.value > 0 &&
    session.correctCount.value === session.total.value
  ) {
    void confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
});
</script>

<template>
  <SessionSummary
    v-if="session.finished.value"
    :series="series"
    :results="session.results.value"
    :elapsed="session.elapsed.value"
    @restart="session.restart"
  />

  <template v-else-if="session.current.value">
    <div class="mb-4 flex items-center justify-between text-sm">
      <span class="font-medium"
        >Exercice {{ session.index.value + 1 }}
        <span class="text-muted">/ {{ session.total.value }}</span></span
      >
      <span class="inline-flex items-center gap-1.5 font-mono text-muted" aria-label="Temps écoulé"
        ><span class="i-lucide-timer size-4" aria-hidden="true" />{{
          formatClock(session.elapsed.value)
        }}</span
      >
    </div>
    <div
      class="mb-6 h-3 overflow-hidden rounded-full bg-elevated"
      role="progressbar"
      :aria-valuenow="session.index.value"
      :aria-valuemin="0"
      :aria-valuemax="session.total.value"
    >
      <div
        class="h-full rounded-full bg-secondary transition-all"
        :style="{ width: `${Math.round(progressRatio * 100)}%` }"
      />
    </div>

    <div
      class="rounded-3xl border-2 border-default bg-default p-6 shadow-[0_8px_0_0_var(--ui-border)] sm:p-8"
    >
      <component
        :is="components[session.current.value.type] ?? ExerciseTranslation"
        :key="session.current.value.id"
        :exercise="session.current.value"
        :disabled="session.feedback.value !== null || session.checking.value"
        :checking="session.checking.value"
        @answer="session.answer"
      />

      <FeedbackPanel
        v-if="session.feedback.value"
        :feedback="session.feedback.value"
        :exercise="session.current.value"
        :last="session.index.value === session.total.value - 1"
        :answer="session.lastAnswer.value"
        class="mt-6"
        @next="session.next"
      />
    </div>
  </template>

  <p v-else class="text-muted">Cette série ne contient aucun exercice.</p>
</template>
