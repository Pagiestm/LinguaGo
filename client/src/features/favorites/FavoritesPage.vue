<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { isNetworkError } from '@/shared/api/http';
import { useFavorites } from '@/shared/composables/useQueries';
import OfflineState from '@/shared/ui/OfflineState.vue';
import { useNetworkStore } from '@/shared/stores/network';
import SeriesCard from '@/features/learn/SeriesCard.vue';
import EmptyState from '@/shared/ui/EmptyState.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';

const network = useNetworkStore();
const { data: favorites, status, error } = useFavorites();
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Favoris"
      title="Vos séries à portée de main"
      description="Les séries favorites sont enregistrées sur cet appareil : vous pouvez les faire sans connexion, les réponses se synchronisent ensuite."
    />

    <UAlert
      v-if="network.offline"
      class="mb-6"
      color="warning"
      variant="subtle"
      icon="i-lucide-wifi-off"
      title="Vous êtes hors connexion"
      description="Voici la dernière version enregistrée de vos favoris."
    />
    <OfflineState
      v-else-if="error && isNetworkError(error)"
      title="Favoris indisponibles"
      description="Aucun favori n'est enregistré sur cet appareil et le réseau manque pour les récupérer."
    />
    <UAlert
      v-else-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-x"
      title="Impossible de charger les favoris"
      :description="error.message"
    />

    <div v-if="status === 'pending' && !favorites" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="n in 3" :key="n" class="h-44 rounded-xl" />
    </div>
    <EmptyState
      v-else-if="favorites && favorites.length === 0"
      title="Aucun favori pour le moment"
      description="Ajoutez une série depuis un niveau avec le cœur : elle restera disponible hors connexion."
    >
      <UButton to="/dashboard/learn" icon="i-lucide-graduation-cap">Parcourir les niveaux</UButton>
    </EmptyState>
    <ul v-else-if="favorites" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
      <li v-for="series in favorites" :key="series.id">
        <SeriesCard :series="series" show-level />
      </li>
    </ul>
  </div>
</template>
