<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import type { SeriesType } from '@/shared/api/types';
import { isNetworkError } from '@/shared/api/http';
import { useLevels } from '@/shared/composables/useQueries';
import LevelBadge from '@/shared/ui/LevelBadge.vue';
import OfflineState from '@/shared/ui/OfflineState.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';
import ModeSwitch from './ModeSwitch.vue';

const route = useRoute();
const mode = ref<SeriesType>(route.query.mode === 'talk' ? 'TALK' : 'DEFAULT');
const { data, status, error } = useLevels();

const levels = computed(() =>
  (data.value?.levels ?? []).map((level) => {
    const series = level.series[mode.value];
    return {
      ...level,
      total: series.total,
      completed: series.completed,
      ratio: series.total === 0 ? 0 : series.completed / series.total,
      isCurrent: data.value?.userLevel.current.code === level.code,
    };
  }),
);
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Apprendre"
      title="Choisissez un niveau"
      description="Les séries sont courtes : entre quatre et dix exercices. Terminez-les toutes pour passer au niveau suivant."
    >
      <template #actions>
        <ModeSwitch v-model="mode" />
      </template>
    </PageHeader>

    <OfflineState v-if="error && isNetworkError(error)" />
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-x"
      title="Impossible de charger les niveaux"
      :description="error.message"
    />

    <div v-else-if="status === 'pending' && !data" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="n in 5" :key="n" class="h-52 rounded-2xl" />
    </div>

    <ul v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="list">
      <li v-for="level in levels" :key="level.code" :class="`level-${level.code.toLowerCase()}`">
        <RouterLink
          :to="{
            name: 'series',
            params: { level: level.code },
            query: mode === 'TALK' ? { type: 'TALK' } : {},
          }"
          class="card-pop group flex h-full flex-col rounded-2xl border-2 bg-default p-5 focus-visible:outline-2 focus-visible:outline-primary"
          :class="level.isCurrent ? 'border-[var(--level)]' : 'border-default'"
        >
          <div class="flex items-start justify-between gap-3">
            <LevelBadge :code="level.code" size="lg" />
            <span
              v-if="level.isCurrent"
              class="rounded-full bg-secondary px-3 py-1 text-xs font-extrabold text-slate-900"
              >Votre niveau</span
            >
          </div>
          <h2 class="mt-4 text-xl">{{ level.title }}</h2>
          <p class="mt-1 line-clamp-3 flex-1 text-sm text-muted">{{ level.description }}</p>
          <div class="mt-5">
            <div class="flex items-center justify-between text-xs font-bold text-muted">
              <span>{{ level.completed }} / {{ level.total }} séries terminées</span>
              <span
                >{{ level.pointsPerExercise }} pt{{ level.pointsPerExercise > 1 ? 's' : '' }} par
                exercice</span
              >
            </div>
            <div class="mt-2 h-3 overflow-hidden rounded-full bg-elevated">
              <div
                class="h-full rounded-full transition-all"
                :style="{
                  width: `${Math.round(level.ratio * 100)}%`,
                  backgroundColor: 'var(--level)',
                }"
              />
            </div>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
