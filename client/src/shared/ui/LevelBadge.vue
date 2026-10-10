<script setup lang="ts">
import type { LevelCode } from '@/shared/api/types';

withDefaults(defineProps<{ code: LevelCode; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' });

const sizes = {
  sm: 'h-7 min-w-7 px-1.5 text-xs rounded-lg',
  md: 'h-9 min-w-9 px-2 text-sm rounded-xl',
  lg: 'h-14 min-w-14 px-3 text-xl rounded-2xl',
};
</script>

<template>
  <span
    class="inline-flex items-center justify-center font-extrabold text-white shadow-[0_3px_0_0_rgba(0,0,0,0.22)]"
    :class="[sizes[size], `level-${code.toLowerCase()}`]"
    :style="{ backgroundColor: 'var(--level)' }"
  >
    {{ code }}
  </span>
</template>
