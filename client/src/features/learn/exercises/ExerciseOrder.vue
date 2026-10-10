<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { computed, ref } from 'vue';
import type { ExerciseView } from '@/shared/api/types';

const props = defineProps<{ exercise: ExerciseView; disabled: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();

const picked = ref<number[]>([]);
const remaining = computed(() =>
  props.exercise.choices
    .map((word, index) => ({ word, index }))
    .filter(({ index }) => !picked.value.includes(index)),
);
const sentence = computed(() =>
  picked.value.map((index) => props.exercise.choices[index]).join(' '),
);

function pick(index: number) {
  if (props.disabled) return;
  picked.value = [...picked.value, index];
}

function unpick(position: number) {
  if (props.disabled) return;
  picked.value = picked.value.filter((_, i) => i !== position);
}

function submit() {
  if (remaining.value.length === 0) emit('answer', sentence.value);
}
</script>

<template>
  <div>
    <p class="text-xs font-extrabold uppercase tracking-wider text-muted">Remise dans l'ordre</p>
    <h2 class="mt-2 text-2xl leading-snug">{{ exercise.question }}</h2>

    <div
      class="mt-6 flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-default p-3"
      aria-label="Votre phrase"
      aria-live="polite"
    >
      <span v-if="picked.length === 0" class="text-sm text-muted"
        >Touchez les mots dans l'ordre pour former la phrase.</span
      >
      <button
        v-for="(index, position) in picked"
        :key="`${index}-${position}`"
        type="button"
        class="card-pop rounded-xl border-2 border-primary px-3 py-1.5 text-base font-bold text-primary bg-blue-950/40"
        :disabled="disabled"
        :aria-label="`Retirer ${exercise.choices[index]}`"
        @click="unpick(position)"
      >
        {{ exercise.choices[index] }}
      </button>
    </div>

    <div class="mt-4 flex flex-wrap gap-2" aria-label="Mots disponibles">
      <button
        v-for="{ word, index } in remaining"
        :key="index"
        type="button"
        class="card-pop rounded-xl border-2 border-default bg-default px-3 py-1.5 text-base font-bold"
        :disabled="disabled"
        @click="pick(index)"
      >
        {{ word }}
      </button>
    </div>

    <UButton
      v-if="!disabled"
      class="btn-pop mt-6 font-extrabold"
      size="xl"
      :disabled="remaining.length > 0"
      @click="submit"
      >Valider</UButton
    >
  </div>
</template>
