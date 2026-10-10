<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isNetworkError } from '@/shared/api/http';
import type { LevelCode, SeriesType } from '@/shared/api/types';
import { useLevels, useSeriesList } from '@/shared/composables/useQueries';
import LevelBadge from '@/shared/ui/LevelBadge.vue';
import OfflineState from '@/shared/ui/OfflineState.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';
import EmptyState from '@/shared/ui/EmptyState.vue';
import LevelDownloadButton from './LevelDownloadButton.vue';
import ModeSwitch from './ModeSwitch.vue';
import SeriesCard from './SeriesCard.vue';

const props = defineProps<{ level: LevelCode }>();
const route = useRoute();
const router = useRouter();

const mode = ref<SeriesType>(route.query.type === 'TALK' ? 'TALK' : 'DEFAULT');
watch(mode, (value) => router.replace({ query: value === 'TALK' ? { type: 'TALK' } : {} }));

const { data: levels } = useLevels();
const level = computed(() => levels.value?.levels.find((l) => l.code === props.level));
const { data: series, status, error } = useSeriesList(() => props.level, mode);

const completedCount = computed(() => series.value?.filter((s) => s.isCompleted).length ?? 0);
</script>

<template>
  <div>
    <UButton
      to="/dashboard/learn"
      variant="link"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="-ml-2 mb-4"
      >Tous les niveaux</UButton
    >
    <PageHeader
      :eyebrow="`Niveau ${props.level}`"
      :title="level?.title ?? `Niveau ${props.level}`"
      :description="level?.description"
    >
      <template #actions>
        <LevelDownloadButton :level="props.level" :type="mode" />
        <ModeSwitch v-model="mode" />
      </template>
    </PageHeader>

    <div class="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted">
      <LevelBadge :code="props.level" size="sm" />
      <span v-if="series">{{ completedCount }} / {{ series.length }} séries terminées</span>
      <span v-if="mode === 'TALK'" class="inline-flex items-center gap-1.5"
        ><span class="i-lucide-mic size-4" aria-hidden="true" />Exercices de prononciation au
        micro</span
      >
    </div>

    <OfflineState
      v-if="error && isNetworkError(error)"
      description="Ce niveau n'est pas enregistré sur cet appareil. Téléchargez-le une fois connecté pour l'avoir partout."
    />
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-x"
      title="Impossible de charger les séries"
      :description="error.message"
    />
    <div
      v-else-if="status === 'pending' && !series"
      class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      <USkeleton v-for="n in 6" :key="n" class="h-44 rounded-2xl" />
    </div>
    <EmptyState
      v-else-if="series && series.length === 0"
      title="Aucune série pour ce niveau"
      description="Ce niveau ne propose pas encore de série de ce type."
    />
    <ul v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
      <li v-for="item in series" :key="item.id">
        <SeriesCard :series="item" />
      </li>
    </ul>
  </div>
</template>
