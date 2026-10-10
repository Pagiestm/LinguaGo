<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { computed } from 'vue';
import type { Streak } from '@/shared/api/types';
import AppMascot from '@/shared/ui/AppMascot.vue';

const props = defineProps<{ streak: Streak; today: { points: number; goal: number } }>();

const plural = (n: number) => (n > 1 ? 's' : '');
const ratio = computed(() => Math.min(1, props.today.points / Math.max(1, props.today.goal)));
const circumference = 2 * Math.PI * 26;
</script>

<template>
  <section
    class="mb-6 flex flex-col gap-4 rounded-2xl border-2 p-5 sm:flex-row sm:items-center"
    :class="
      streak.doneToday ? 'border-success/40 bg-green-950/30' : 'border-orange-900 bg-orange-950/30'
    "
    aria-labelledby="streak-title"
  >
    <AppMascot
      :expression="streak.doneToday ? 'cheer' : streak.current > 0 ? 'think' : 'wave'"
      class="size-16 shrink-0"
    />
    <div class="flex-1">
      <p class="flex items-center gap-2">
        <span
          class="i-lucide-flame size-7"
          :class="streak.current > 0 ? 'text-orange-500' : 'text-muted'"
          aria-hidden="true"
        />
        <span id="streak-title" class="text-2xl font-extrabold tabular-nums"
          >{{ streak.current }} jour{{ plural(streak.current) }} d'affilée</span
        >
      </p>
      <p class="mt-1 text-sm text-muted">
        <template v-if="streak.doneToday">Objectif du jour atteint, la série continue.</template>
        <template v-else-if="streak.current > 0"
          >Atteignez votre objectif aujourd'hui pour la garder vivante.</template
        >
        <template v-else>Commencez votre série : l'objectif du jour suffit.</template>
        <template v-if="streak.best > 1"> Record : {{ streak.best }} jours.</template>
      </p>
    </div>
    <div class="flex items-center gap-4 self-end sm:self-auto">
      <div
        class="relative size-16 shrink-0"
        role="img"
        :aria-label="`${today.points} points sur ${today.goal} aujourd'hui`"
      >
        <svg viewBox="0 0 64 64" class="size-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="currentColor"
            stroke-width="7"
            class="text-elevated"
          />
          <circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke="currentColor"
            stroke-width="7"
            stroke-linecap="round"
            class="transition-all duration-700"
            :class="streak.doneToday ? 'text-success' : 'text-secondary'"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circumference * (1 - ratio)"
          />
        </svg>
        <span
          class="absolute inset-0 flex flex-col items-center justify-center text-xs font-extrabold leading-none"
          aria-hidden="true"
          ><span class="text-sm">{{ today.points }}</span
          ><span class="text-muted">/ {{ today.goal }}</span></span
        >
      </div>
      <UButton
        v-if="!streak.doneToday"
        to="/dashboard/daily"
        icon="i-lucide-flame"
        color="warning"
        class="btn-pop font-extrabold text-slate-900"
        :style="{ '--pop-color': 'color-mix(in oklab, var(--ui-warning) 65%, black)' }"
        >Cinq minutes</UButton
      >
    </div>
  </section>
</template>
