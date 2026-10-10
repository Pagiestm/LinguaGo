<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { ref } from 'vue';
import type { ExerciseView } from '@/shared/api/types';

const props = defineProps<{ exercise: ExerciseView; disabled: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();

const selected = ref<string | null>(null);

function move(event: KeyboardEvent, index: number) {
  const keys: Record<string, number> = {
    ArrowRight: 1,
    ArrowDown: 1,
    ArrowLeft: -1,
    ArrowUp: -1,
  };
  const delta = keys[event.key];
  if (delta === undefined) return;
  event.preventDefault();
  const total = props.exercise.choices.length;
  const next = (index + delta + total) % total;
  const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button');
  buttons?.[next]?.focus();
  selected.value = props.exercise.choices[next] ?? null;
}
</script>

<template>
  <div>
    <p class="text-xs font-extrabold uppercase tracking-wider text-muted">Choix multiple</p>
    <h2 class="mt-2 text-2xl leading-snug">{{ exercise.question }}</h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Réponses possibles">
      <button
        v-for="(choice, index) in exercise.choices"
        :key="choice"
        type="button"
        role="radio"
        :aria-checked="selected === choice"
        :tabindex="selected === choice || (selected === null && index === 0) ? 0 : -1"
        :disabled="disabled"
        class="card-pop rounded-2xl border-2 px-5 py-4 text-left text-base font-bold transition focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
        :class="
          selected === choice
            ? 'border-primary text-primary bg-blue-950/40'
            : 'border-default bg-default hover:border-primary/60'
        "
        @click="selected = choice"
        @keydown="move($event, index)"
      >
        {{ choice }}
      </button>
    </div>
    <UButton
      v-if="!disabled"
      class="btn-pop mt-6 font-extrabold"
      size="xl"
      :disabled="selected === null"
      @click="selected !== null && emit('answer', selected)"
      >Valider</UButton
    >
  </div>
</template>
