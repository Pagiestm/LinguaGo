<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import type { CompletedByLevel } from '@/shared/api/types';
import EmptyState from '@/shared/ui/EmptyState.vue';
import { CHART_TEXT_COLOR, LEVEL_COLORS } from './charts';

const props = defineProps<{ levels: CompletedByLevel[] }>();

const total = computed(() => props.levels.reduce((sum, l) => sum + l.count, 0));

const data = computed(() => ({
  labels: props.levels.map((l) => `${l.code} · ${l.title}`),
  datasets: [
    {
      data: props.levels.map((l) => l.count),
      backgroundColor: props.levels.map((l) => LEVEL_COLORS[l.code] ?? '#64748b'),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: CHART_TEXT_COLOR, boxWidth: 10, usePointStyle: true },
    },
  },
}));
</script>

<template>
  <Doughnut
    v-if="total > 0"
    :data="data"
    :options="options"
    aria-label="Séries terminées par niveau"
    role="img"
  />
  <EmptyState
    v-else
    title="Aucune série terminée"
    description="Terminez une série complète pour la voir apparaître ici."
    class="h-full justify-center"
  />
</template>
