<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import EmptyState from './EmptyState.vue';

withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: 'Pas de réseau pour le moment',
  description:
    'Vos séries favorites et les niveaux téléchargés restent disponibles. Le reste reviendra avec la connexion.',
});
</script>

<template>
  <EmptyState expression="think" :title="title" :description="description">
    <UButton to="/dashboard/favorites" icon="i-lucide-heart" class="btn-pop font-extrabold"
      >Mes favoris</UButton
    >
  </EmptyState>
</template>
