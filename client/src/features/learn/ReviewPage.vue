<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { progress } from '@/shared/api/endpoints';
import { isNetworkError } from '@/shared/api/http';
import EmptyState from '@/shared/ui/EmptyState.vue';
import OfflineState from '@/shared/ui/OfflineState.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';
import SessionRunner from './SessionRunner.vue';

const props = defineProps<{ mode: 'review' | 'daily' }>();

const {
  data: series,
  status,
  error,
} = useQuery({
  key: () => ['session', props.mode],
  query: () => (props.mode === 'daily' ? progress.daily() : progress.reviewSession()),
  staleTime: 0,
});

const copy = computed(() =>
  props.mode === 'daily'
    ? {
        eyebrow: 'Cinq minutes',
        title: 'La session du jour',
        description:
          'Vos révisions dues en premier, puis de nouveaux exercices de votre niveau. Dix minutes montre en main, souvent moins.',
      }
    : {
        eyebrow: 'Révision',
        title: 'Les exercices à revoir',
        description:
          'Les exercices ratés reviennent à intervalles croissants : 1, 3, 7, 14, 30 puis 60 jours. Réussis, ils s’espacent ; ratés, ils reviennent demain.',
      },
);
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UButton
      to="/dashboard"
      variant="link"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="-ml-2 mb-4"
      >Tableau de bord</UButton
    >
    <PageHeader :eyebrow="copy.eyebrow" :title="copy.title" :description="copy.description" />

    <OfflineState
      v-if="error && isNetworkError(error)"
      description="Les révisions se préparent sur le serveur. Vos favoris et niveaux téléchargés restent jouables."
    />
    <div v-else-if="status === 'pending' && !series" class="space-y-4">
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-72 rounded-xl" />
    </div>
    <EmptyState
      v-else-if="series && series.exercises.length === 0"
      expression="cheer"
      title="Rien à revoir pour le moment"
      description="Aucun exercice n’est dû aujourd’hui. Continuez une série, les ratés reviendront ici au bon moment."
    >
      <UButton to="/dashboard/learn" icon="i-lucide-graduation-cap" class="btn-pop font-extrabold"
        >Choisir un niveau</UButton
      >
    </EmptyState>
    <SessionRunner v-else-if="series" :series="series" />
  </div>
</template>
