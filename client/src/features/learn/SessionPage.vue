<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useSeriesDetail } from '@/shared/composables/useQueries';
import { useFavorite } from '@/shared/composables/useFavorite';
import { useNetworkStore } from '@/shared/stores/network';
import LevelBadge from '@/shared/ui/LevelBadge.vue';
import MascotSays from '@/shared/ui/MascotSays.vue';
import SessionRunner from './SessionRunner.vue';

const props = defineProps<{ id: number }>();
const route = useRoute();
const network = useNetworkStore();
const favorite = useFavorite();

const { data: series, status, error, fromCache } = useSeriesDetail(() => props.id);

const challenge = computed(() => {
  const from = typeof route.query.challenge === 'string' ? route.query.challenge : '';
  const score = typeof route.query.score === 'string' ? route.query.score : '';
  return from ? { from, score } : null;
});
const challengeOutcome = ref<'won' | 'lost' | null>(null);

function onFinished(correct: number, total: number) {
  if (!challenge.value?.score) return;
  const [theirs] = challenge.value.score.split('/').map(Number);
  challengeOutcome.value =
    correct > (theirs ?? 0) || (correct === total && total > 0) ? 'won' : 'lost';
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-x"
      title="Série indisponible"
      :description="
        network.offline
          ? 'Cette série n’est ni dans vos favoris ni dans un niveau téléchargé : elle n’est pas disponible hors connexion.'
          : error.message
      "
      class="mb-6"
    />

    <div v-else-if="status === 'pending' && !series" class="space-y-4">
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-72 rounded-xl" />
    </div>

    <template v-else-if="series">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <UButton
          :to="{
            name: 'series',
            params: { level: series.level.code },
            query: series.type === 'TALK' ? { type: 'TALK' } : {},
          }"
          variant="link"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="-ml-2"
        >
          Niveau {{ series.level.code }}
        </UButton>
        <div class="flex items-center gap-2">
          <span
            v-if="fromCache"
            class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300"
            ><span class="i-lucide-wifi-off size-3" aria-hidden="true" />Version hors ligne</span
          >
          <UButton
            variant="soft"
            :color="series.isFavorite ? 'error' : 'neutral'"
            icon="i-lucide-heart"
            :class="series.isFavorite ? '[&>span]:fill-current' : ''"
            :loading="favorite.busy.value === series.id"
            :aria-pressed="series.isFavorite"
            @click="favorite.toggle(series.id, series.isFavorite)"
          >
            {{ series.isFavorite ? 'Favori' : 'Ajouter aux favoris' }}
          </UButton>
        </div>
      </div>

      <header class="mb-6">
        <div class="flex items-center gap-3">
          <LevelBadge :code="series.level.code" size="sm" />
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            {{ series.type === 'TALK' ? 'Prononciation' : 'Série' }}
          </p>
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{{ series.title }}</h1>
        <p v-if="series.description" class="mt-1 text-muted">{{ series.description }}</p>
      </header>

      <div v-if="challenge" class="mb-6">
        <MascotSays :expression="challengeOutcome === 'won' ? 'cheer' : 'think'" size="sm">
          <template v-if="challengeOutcome === 'won'"
            >Défi relevé ! Vous avez fait mieux que {{ challenge.from }}.</template
          >
          <template v-else-if="challengeOutcome === 'lost'"
            >Pas cette fois : {{ challenge.from }} garde la main. On recommence ?</template
          >
          <template v-else
            >{{ challenge.from }} vous défie<template v-if="challenge.score">
              : faites mieux que {{ challenge.score }}</template
            >.</template
          >
        </MascotSays>
      </div>

      <SessionRunner :series="series" @finished="onFinished" />
    </template>
  </div>
</template>
