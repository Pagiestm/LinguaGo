<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UTextarea from '@nuxt/ui/components/Textarea.vue';
import { ref } from 'vue';
import type { ExerciseView } from '@/shared/api/types';
import { useNetworkStore } from '@/shared/stores/network';

defineProps<{ exercise: ExerciseView; disabled: boolean; checking: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();

const network = useNetworkStore();
const value = ref('');

function submit() {
  if (value.value.trim()) emit('answer', value.value.trim());
}
</script>

<template>
  <form @submit.prevent="submit">
    <p class="text-xs font-semibold uppercase tracking-wider text-muted">Traduction</p>
    <h2 class="mt-2 text-xl font-semibold leading-snug">{{ exercise.question }}</h2>
    <UTextarea
      v-model="value"
      class="mt-6 w-full"
      :rows="3"
      autoresize
      size="lg"
      placeholder="Écrivez la traduction en anglais"
      :disabled="disabled"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      aria-label="Votre traduction"
      @keydown.enter.exact.prevent="submit"
    />
    <p class="mt-2 text-xs text-muted">
      <template v-if="network.offline"
        >Hors connexion : seule une traduction identique à la réponse attendue est
        reconnue.</template
      >
      <template v-else>Une formulation différente mais correcte est acceptée.</template>
    </p>
    <UButton
      v-if="!disabled"
      type="submit"
      class="btn-pop mt-5 font-extrabold"
      size="lg"
      :loading="checking"
      :disabled="!value.trim()"
      >Valider</UButton
    >
  </form>
</template>
