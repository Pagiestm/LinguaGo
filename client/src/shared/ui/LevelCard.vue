<script setup lang="ts">
import type { Stats } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import AppMascot from './AppMascot.vue';

defineProps<{ stats: Stats }>();
</script>

<template>
  <div class="rounded-2xl border-2 border-default bg-default p-4">
    <div class="flex items-center gap-3">
      <AppMascot class="size-12 shrink-0" />
      <div>
        <p class="text-xs font-extrabold uppercase tracking-wide text-muted">
          Niveau {{ stats.level.current.code }}
        </p>
        <p class="text-sm font-extrabold">{{ stats.level.current.title }}</p>
      </div>
    </div>
    <div class="mt-3 h-3 overflow-hidden rounded-full bg-elevated">
      <div
        class="h-full rounded-full bg-secondary transition-all"
        :style="{ width: `${Math.max(4, Math.round(stats.level.progress * 100))}%` }"
      />
    </div>
    <p class="mt-2 text-xs font-bold text-muted">
      {{ formatNumber(stats.points) }} points
      <template v-if="stats.level.next"
        >· {{ formatNumber(stats.level.next.pointsRequired - stats.points) }} avant
        {{ stats.level.next.code }}</template
      >
    </p>
  </div>
</template>
