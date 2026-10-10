<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string;
    hint?: string;
    icon: string;
    color?: 'blue' | 'green' | 'yellow' | 'purple';
  }>(),
  { hint: undefined, color: 'blue' },
);

const palette = {
  blue: 'bg-blue-950 text-blue-300',
  green: 'bg-green-950 text-green-300',
  yellow: 'bg-yellow-950 text-yellow-300',
  purple: 'bg-purple-950 text-purple-300',
};
</script>

<template>
  <div class="flex items-start gap-4 rounded-2xl border-2 border-default bg-default p-5">
    <span
      class="flex size-12 shrink-0 items-center justify-center rounded-2xl"
      :class="palette[color]"
    >
      <span :class="icon" class="size-6" aria-hidden="true" />
    </span>
    <div class="min-w-0">
      <p class="text-sm font-bold text-muted">{{ label }}</p>
      <p class="mt-0.5 truncate text-3xl font-extrabold tracking-tight">{{ value }}</p>
      <p v-if="hint" class="mt-1 text-xs text-muted">{{ hint }}</p>
    </div>
  </div>
</template>
