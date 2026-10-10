<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { onMounted, ref } from 'vue';
import type { ExerciseView } from '@/shared/api/types';
import { speak, ttsSupported } from '@/shared/lib/tts';

const props = defineProps<{ exercise: ExerciseView; disabled: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();

const supported = ttsSupported();
const value = ref('');
const plays = ref(0);

function play() {
  if (!props.exercise.spokenText) return;
  speak(props.exercise.spokenText);
  plays.value += 1;
}

onMounted(() => {
  if (supported) play();
});

function submit() {
  if (value.value.trim()) emit('answer', value.value.trim());
}
</script>

<template>
  <form @submit.prevent="submit">
    <p class="text-xs font-extrabold uppercase tracking-wider text-muted">Dictée</p>
    <h2 class="mt-2 text-2xl leading-snug">{{ exercise.question }}</h2>

    <UAlert
      v-if="!supported"
      class="mt-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Lecture audio indisponible"
      description="Votre navigateur ne propose pas la synthèse vocale. Essayez avec Chrome, Edge ou Safari."
    />

    <div v-else class="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="btn-pop flex size-20 items-center justify-center rounded-full bg-primary text-white"
        aria-label="Écouter la phrase"
        @click="play"
      >
        <span class="i-lucide-volume-2 size-9" aria-hidden="true" />
      </button>
      <p class="text-sm text-muted">
        Écoutez, puis écrivez la phrase en anglais.
        <span v-if="plays > 1">Lecture {{ plays }}.</span>
      </p>
    </div>

    <UInput
      v-model="value"
      class="mt-6 w-full"
      size="xl"
      placeholder="Écrivez ce que vous entendez"
      :disabled="disabled"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      aria-label="Votre transcription"
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
