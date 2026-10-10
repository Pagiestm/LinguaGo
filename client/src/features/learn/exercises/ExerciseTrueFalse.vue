<script setup lang="ts">
import type { ExerciseView } from '@/shared/api/types';

defineProps<{ exercise: ExerciseView; disabled: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();
</script>

<template>
  <div>
    <p class="text-xs font-extrabold uppercase tracking-wider text-muted">Vrai ou faux</p>
    <h2 class="mt-2 text-2xl leading-snug">{{ exercise.question }}</h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        :disabled="disabled"
        class="card-pop rounded-2xl border-2 border-success/50 px-4 py-6 text-xl font-extrabold text-success focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-70 bg-green-950/30"
        @click="emit('answer', 'true')"
      >
        <span class="i-lucide-check mr-2 inline-block size-6 align-[-4px]" aria-hidden="true" />Vrai
      </button>
      <button
        type="button"
        :disabled="disabled"
        class="card-pop rounded-2xl border-2 border-error/50 px-4 py-6 text-xl font-extrabold text-error focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-70 bg-red-950/30"
        @click="emit('answer', 'false')"
      >
        <span class="i-lucide-x mr-2 inline-block size-6 align-[-4px]" aria-hidden="true" />Faux
      </button>
    </div>
  </div>
</template>
