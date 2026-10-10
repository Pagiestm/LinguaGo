<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { computed, onMounted, useTemplateRef } from 'vue';
import type { ExerciseView } from '@/shared/api/types';
import { wordDiff } from '@/shared/lib/diff';
import AppMascot from '@/shared/ui/AppMascot.vue';
import type { Feedback } from './useSession';

const props = defineProps<{
  feedback: Feedback;
  exercise: ExerciseView;
  last: boolean;
  answer: string;
}>();
defineEmits<{ next: [] }>();

const nextButton = useTemplateRef<{ $el?: HTMLElement } | HTMLElement>('nextButton');

const CHEERS = [
  'Bien joué !',
  'Exactement.',
  'Tu progresses vite.',
  'Lingo approuve.',
  'Encore un de plus !',
  'Parfait, continue.',
];
const COMFORTS = [
  'Pas grave, on apprend comme ça.',
  'Presque. Regarde la réponse attendue.',
  'Lingo note ça pour une révision.',
  'Ça reviendra bientôt, tu l’auras.',
];
const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)] ?? '';
const encouragement = computed(() => pick(props.feedback.correct ? CHEERS : COMFORTS));

const TEXT_TYPES = ['TRANSLATION', 'FILL_BLANK', 'ORDER', 'DICTATION', 'TALK'];
const diff = computed(() => {
  if (props.feedback.correct || !props.feedback.expectedAnswer) return null;
  if (!TEXT_TYPES.includes(props.exercise.type)) return null;
  const result = wordDiff(props.feedback.expectedAnswer, props.answer);
  return result.given.length > 0 ? result : null;
});

onMounted(() => {
  const target = nextButton.value;
  const element = target instanceof HTMLElement ? target : target?.$el;
  element?.focus?.();
});
</script>

<template>
  <div
    class="motion-safe:animate-pop rounded-2xl border-2 p-4"
    :class="
      feedback.correct ? 'border-success/50 bg-green-950/30' : 'border-error/50 bg-red-950/30'
    "
    role="status"
    aria-live="polite"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="flex flex-1 items-center gap-4">
        <AppMascot :expression="feedback.correct ? 'cheer' : 'oops'" class="size-16 shrink-0" />
        <div class="flex-1">
          <p
            class="text-lg font-extrabold"
            :class="feedback.correct ? 'text-success' : 'text-error'"
          >
            <template v-if="feedback.correct && feedback.alreadyCompleted"
              >Bonne réponse, déjà validée</template
            >
            <template v-else-if="feedback.correct"
              >Bonne réponse<span v-if="feedback.pointsWon">
                · +{{ feedback.pointsWon }} point{{ feedback.pointsWon > 1 ? 's' : '' }}</span
              ></template
            >
            <template v-else>Ce n'est pas ça</template>
          </p>
          <p class="text-sm font-bold text-muted">{{ encouragement }}</p>
          <template v-if="diff">
            <p class="mt-2 text-sm text-muted">
              Réponse attendue :
              <span class="inline-flex flex-wrap gap-x-1">
                <span
                  v-for="(item, index) in diff.expected"
                  :key="`e-${index}`"
                  class="font-bold"
                  :class="item.ok ? 'text-default' : 'px-1 text-slate-900 bg-yellow-400'"
                  >{{ item.word }}</span
                >
              </span>
            </p>
            <p class="text-sm text-muted">
              Votre réponse :
              <span class="inline-flex flex-wrap gap-x-1">
                <span
                  v-for="(item, index) in diff.given"
                  :key="`g-${index}`"
                  :class="item.ok ? 'text-default' : 'text-error line-through'"
                  >{{ item.word }}</span
                >
              </span>
            </p>
          </template>
          <p
            v-else-if="!feedback.correct && feedback.expectedAnswer"
            class="mt-1 text-sm text-muted"
          >
            Réponse attendue :
            <span class="font-bold text-default">{{ feedback.expectedAnswer }}</span>
          </p>
          <p v-if="feedback.offline" class="mt-1 text-xs text-muted">
            Hors connexion : réponse vérifiée localement, les points seront attribués à la
            synchronisation.
          </p>
        </div>
      </div>
      <UButton
        ref="nextButton"
        :icon="last ? 'i-lucide-flag' : 'i-lucide-arrow-right'"
        :color="feedback.correct ? 'success' : 'error'"
        size="lg"
        class="btn-pop self-end font-extrabold sm:self-auto"
        :style="{
          '--pop-color': feedback.correct
            ? 'color-mix(in oklab, var(--ui-success) 65%, black)'
            : 'color-mix(in oklab, var(--ui-error) 65%, black)',
        }"
        trailing
        @click="$emit('next')"
        >{{ last ? 'Voir le résumé' : 'Suivant' }}</UButton
      >
    </div>
  </div>
</template>
