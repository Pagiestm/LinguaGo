<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import { computed, onBeforeUnmount, ref } from 'vue';
import type { ExerciseView } from '@/shared/api/types';
import { createRecognizer, speechSupported, type Recognizer } from '@/shared/lib/speech';
import { speak, ttsSupported } from '@/shared/lib/tts';

const props = defineProps<{ exercise: ExerciseView; disabled: boolean; checking: boolean }>();
const emit = defineEmits<{ answer: [value: string] }>();

const supported = speechSupported();
const canListen = ttsSupported();
const listening = ref(false);
const interim = ref('');
const transcript = ref('');
const errorCode = ref('');
let recognizer: Recognizer | null = null;

function start() {
  errorCode.value = '';
  interim.value = '';
  transcript.value = '';
  recognizer = createRecognizer({
    onInterim: (text) => (interim.value = text),
    onFinal: (text) => {
      transcript.value = text;
      interim.value = '';
    },
    onEnd: () => {
      listening.value = false;
      if (transcript.value) emit('answer', transcript.value);
    },
    onError: (code) => {
      listening.value = false;
      errorCode.value = code;
    },
  });
  if (!recognizer) return;
  listening.value = true;
  recognizer.start();
}

function stop() {
  recognizer?.stop();
}

onBeforeUnmount(() => recognizer?.stop());

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const missedWords = computed(() => {
  if (!transcript.value) return [];
  const said = new Set(normalize(transcript.value));
  return normalize(props.exercise.question).filter((word) => !said.has(word));
});

const errorMessages: Record<string, string> = {
  'not-allowed': 'Le micro est bloqué. Autorisez-le dans les réglages du navigateur.',
  'no-speech': 'Aucune parole détectée. Réessayez en parlant plus près du micro.',
  network: 'La reconnaissance vocale a besoin d’une connexion internet.',
  'audio-capture': 'Aucun micro disponible.',
};
</script>

<template>
  <div>
    <p class="text-xs font-semibold uppercase tracking-wider text-muted">Prononciation</p>
    <p class="mt-2 text-sm text-muted">Dites à voix haute, en anglais :</p>
    <div class="mt-1 flex flex-wrap items-center gap-3">
      <h2 class="text-3xl font-bold leading-snug">« {{ props.exercise.question }} »</h2>
      <UButton
        v-if="canListen"
        variant="soft"
        color="neutral"
        icon="i-lucide-volume-2"
        aria-label="Écouter la phrase"
        class="font-bold"
        @click="speak(props.exercise.question)"
        >Écouter</UButton
      >
    </div>

    <UAlert
      v-if="!supported"
      class="mt-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Reconnaissance vocale indisponible"
      description="Votre navigateur ne propose pas la reconnaissance vocale. Essayez avec Chrome, Edge ou Safari."
    />

    <div v-else class="mt-8 flex flex-col items-center gap-4">
      <button
        type="button"
        class="relative flex size-28 items-center justify-center rounded-full text-white shadow-[0_6px_0_0_rgba(0,0,0,0.25)] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60"
        :class="listening ? 'bg-error' : 'bg-primary hover:scale-105'"
        :disabled="disabled || checking"
        :aria-label="listening ? 'Arrêter l’écoute' : 'Commencer à parler'"
        :aria-pressed="listening"
        @click="listening ? stop() : start()"
      >
        <span
          v-if="listening"
          class="absolute inset-0 animate-ping rounded-full bg-error/40"
          aria-hidden="true"
        />
        <span
          :class="listening ? 'i-lucide-square' : 'i-lucide-mic'"
          class="relative size-9"
          aria-hidden="true"
        />
      </button>
      <p class="text-sm text-muted" aria-live="polite">
        <template v-if="checking">Vérification…</template>
        <template v-else-if="listening">Écoute en cours… {{ interim }}</template>
        <template v-else-if="transcript"
          >Vous avez dit :
          <span class="font-medium text-default">« {{ transcript }} »</span></template
        >
        <template v-else>Appuyez sur le micro puis prononcez la phrase.</template>
      </p>
      <p
        v-if="transcript && !listening && missedWords.length"
        class="flex flex-wrap items-center justify-center gap-1.5 text-sm"
        aria-live="polite"
      >
        <span class="text-muted">Mots non reconnus :</span>
        <span
          v-for="word in missedWords"
          :key="word"
          class="rounded-full px-2 py-0.5 font-bold bg-red-950/40 text-red-300"
          >{{ word }}</span
        >
      </p>
      <UAlert
        v-if="errorCode"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-x"
        :title="errorMessages[errorCode] ?? `Erreur de reconnaissance (${errorCode})`"
        class="max-w-md"
      />
      <UButton
        v-if="!disabled && transcript && !listening"
        variant="ghost"
        color="neutral"
        icon="i-lucide-rotate-ccw"
        @click="start"
        >Réessayer</UButton
      >
    </div>
  </div>
</template>
