<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import type { ActivityDay } from '@/shared/api/types';
import { formatDay } from '@/shared/lib/format';
import { CHART_GRID_COLOR, CHART_TEXT_COLOR } from './charts';

const props = defineProps<{ days: ActivityDay[] }>();

const data = computed(() => ({
  labels: props.days.map((d) => formatDay(d.date)),
  datasets: [
    {
      label: 'Exercices réussis',
      data: props.days.map((d) => d.exercises),
      backgroundColor: '#2563eb',
      borderRadius: 6,
      maxBarThickness: 36,
    },
  ],
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: CHART_TEXT_COLOR } },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: CHART_TEXT_COLOR },
      grid: { color: CHART_GRID_COLOR },
    },
  },
}));
</script>

<template>
  <Bar :data="data" :options="options" aria-label="Exercices réussis par jour" role="img" />
</template>
