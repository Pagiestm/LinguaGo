<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import USelect from '@nuxt/ui/components/Select.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { useQuery } from '@pinia/colada';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { admin } from '@/shared/api/endpoints';
import type { LevelCode, SeriesType } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import LevelBadge from '@/shared/ui/LevelBadge.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StatTile from '@/shared/ui/StatTile.vue';

const level = ref<LevelCode | 'ALL'>('ALL');
const type = ref<SeriesType | 'ALL'>('ALL');

const { data: overview } = useQuery({ key: ['admin', 'overview'], query: admin.overview });
const { data: series, status } = useQuery({
  key: () => ['admin', 'series', level.value, type.value],
  query: () =>
    admin.series(
      level.value === 'ALL' ? undefined : level.value,
      type.value === 'ALL' ? undefined : type.value,
    ),
});

const levelOptions = [
  { label: 'Tous les niveaux', value: 'ALL' },
  ...(['A1', 'A2', 'B1', 'B2', 'C1'] as const).map((code) => ({ label: code, value: code })),
];
const typeOptions = [
  { label: 'Tous les types', value: 'ALL' },
  { label: "S'exercer", value: 'DEFAULT' },
  { label: 'Parler', value: 'TALK' },
];
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Administration"
      title="Le catalogue"
      description="Niveaux, séries et exercices : tout ce que voient les apprenants, avec les réponses."
    >
      <template #actions>
        <UButton
          :to="{ name: 'admin-series-new' }"
          icon="i-lucide-plus"
          size="lg"
          class="btn-pop font-extrabold"
          >Nouvelle série</UButton
        >
      </template>
    </PageHeader>

    <div v-if="overview" class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Comptes" :value="formatNumber(overview.users)" icon="i-lucide-users" />
      <StatTile
        label="Actifs cette semaine"
        :value="formatNumber(overview.activeWeek)"
        icon="i-lucide-activity"
        color="green"
      />
      <StatTile
        label="Séries"
        :value="formatNumber(overview.series)"
        :hint="`${formatNumber(overview.exercises)} exercices`"
        icon="i-lucide-library"
        color="yellow"
      />
      <StatTile
        label="Exercices réussis"
        :value="formatNumber(overview.completions)"
        hint="Depuis le lancement"
        icon="i-lucide-sparkles"
        color="purple"
      />
    </div>

    <div class="mb-4 flex flex-wrap gap-3">
      <USelect v-model="level" :items="levelOptions" size="lg" class="w-44" />
      <USelect v-model="type" :items="typeOptions" size="lg" class="w-44" />
    </div>

    <div v-if="status === 'pending' && !series" class="space-y-2">
      <USkeleton v-for="n in 6" :key="n" class="h-14 rounded-2xl" />
    </div>
    <ul
      v-else-if="series"
      class="divide-y-2 divide-default rounded-2xl border-2 border-default"
      role="list"
    >
      <li v-for="row in series" :key="row.id">
        <RouterLink
          :to="{ name: 'admin-series', params: { id: row.id } }"
          class="flex items-center gap-4 px-4 py-3 hover:bg-elevated/60"
        >
          <LevelBadge :code="row.level.code" size="sm" />
          <span class="min-w-0 flex-1">
            <span class="block truncate font-extrabold">{{ row.title }}</span>
            <span class="block truncate text-xs text-muted">{{ row.description }}</span>
          </span>
          <span
            v-if="row.type === 'TALK'"
            class="rounded-full px-2 py-0.5 text-xs font-extrabold bg-pink-950 text-pink-300"
            >Parler</span
          >
          <span class="w-20 text-right text-sm text-muted">{{ row.exerciseCount }} ex.</span>
          <span class="hidden w-24 text-right text-sm text-muted sm:block"
            >{{ row.completions }} fini{{ row.completions > 1 ? 's' : '' }}</span
          >
          <span class="i-lucide-chevron-right size-4 text-muted" aria-hidden="true" />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
