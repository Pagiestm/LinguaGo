<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { computed, ref } from 'vue';
import type { ExerciseView } from '@/shared/api/types';

const props = defineProps<{ exercise: ExerciseView; disabled: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();

const value = ref('');
const parts = computed(() => props.exercise.question.replace(/^Complete:\s*/i, '').split('___'));

function submit() {
  if (value.value.trim()) emit('answer', value.value.trim());
}
</script>

<template>
  <form @submit.prevent="submit">
    <p class="text-xs font-extrabold uppercase tracking-wider text-muted">Texte à trous</p>
    <h2 class="mt-2 text-2xl leading-relaxed">
      <template v-for="(part, index) in parts" :key="index">
        <span>{{ part }}</span>
        <span
          v-if="index < parts.length - 1"
          class="mx-1 inline-block min-w-24 rounded-xl border-b-4 border-primary px-3 text-center text-primary bg-blue-950/40"
          >{{ value || '…' }}</span
        >
      </template>
    </h2>
    <UInput
      v-model="value"
      class="mt-6 w-full sm:max-w-sm"
      size="xl"
      placeholder="Le mot manquant"
      :disabled="disabled"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      aria-label="Mot manquant"
    />
    <UButton
      v-if="!disabled"
      type="submit"
      class="btn-pop mt-6 font-extrabold"
      size="xl"
      :disabled="!value.trim()"
      >Valider</UButton
    >
  </form>
</template>
