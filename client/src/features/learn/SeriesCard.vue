<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { SeriesCard as SeriesCardType } from '@/shared/api/types';
import { useFavorite } from '@/shared/composables/useFavorite';
import LevelBadge from '@/shared/ui/LevelBadge.vue';

const props = defineProps<{ series: SeriesCardType; showLevel?: boolean }>();
const favorite = useFavorite();

const ratio = computed(() =>
  props.series.exerciseCount === 0 ? 0 : props.series.completedCount / props.series.exerciseCount,
);
</script>

<template>
  <article
    class="card-pop group relative flex h-full flex-col rounded-2xl border-2 bg-default p-5"
    :class="[
      `level-${series.level.code.toLowerCase()}`,
      series.isCompleted ? 'border-success/50' : 'border-default',
    ]"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2">
        <LevelBadge v-if="showLevel" :code="series.level.code" size="sm" />
        <span
          v-if="series.type === 'TALK'"
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold bg-pink-950 text-pink-300"
        >
          <span class="i-lucide-mic size-3" aria-hidden="true" />Parler
        </span>
        <span
          v-if="series.isCompleted"
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold bg-green-950 text-green-300"
        >
          <span class="i-lucide-circle-check size-3" aria-hidden="true" />Terminée
        </span>
      </div>
      <UButton
        variant="ghost"
        :color="series.isFavorite ? 'error' : 'neutral'"
        icon="i-lucide-heart"
        :class="series.isFavorite ? '[&>span]:fill-current' : ''"
        :aria-label="series.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        :aria-pressed="series.isFavorite"
        :loading="favorite.busy.value === series.id"
        class="relative z-10 -mr-2 -mt-2"
        @click="favorite.toggle(series.id, series.isFavorite)"
      />
    </div>
    <h3 class="mt-3 text-lg">
      <RouterLink
        :to="{ name: 'session', params: { id: series.id } }"
        class="after:absolute after:inset-0 focus-visible:outline-none"
      >
        {{ series.title }}
      </RouterLink>
    </h3>
    <p v-if="series.description" class="mt-1 line-clamp-2 flex-1 text-sm text-muted">
      {{ series.description }}
    </p>
    <div class="mt-5">
      <div class="flex items-center justify-between text-xs font-bold text-muted">
        <span>{{ series.completedCount }} / {{ series.exerciseCount }} exercices</span>
        <span>{{ series.exerciseCount * series.level.pointsPerExercise }} pts</span>
      </div>
      <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-elevated">
        <div
          class="h-full rounded-full transition-all"
          :style="{ width: `${Math.round(ratio * 100)}%`, backgroundColor: 'var(--level)' }"
        />
      </div>
    </div>
  </article>
</template>
