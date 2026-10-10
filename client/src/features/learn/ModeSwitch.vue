<script setup lang="ts">
import type { SeriesType } from '@/shared/api/types';

const model = defineModel<SeriesType>({ required: true });

const modes: { value: SeriesType; label: string; icon: string }[] = [
  { value: 'DEFAULT', label: "S'exercer", icon: 'i-lucide-pencil-line' },
  { value: 'TALK', label: 'Parler', icon: 'i-lucide-mic' },
];
</script>

<template>
  <div
    class="inline-flex rounded-full border-2 border-default bg-elevated/60 p-1"
    role="radiogroup"
    aria-label="Type de série"
  >
    <button
      v-for="mode in modes"
      :key="mode.value"
      type="button"
      role="radio"
      :aria-checked="model === mode.value"
      class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-extrabold transition"
      :class="
        model === mode.value ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-default'
      "
      @click="model = mode.value"
    >
      <span :class="mode.icon" class="size-4" aria-hidden="true" />
      {{ mode.label }}
    </button>
  </div>
</template>
