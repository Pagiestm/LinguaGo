<script setup lang="ts">
import UApp from '@nuxt/ui/components/App.vue';
import { RouterView } from 'vue-router';
import OfflineBanner from '@/shared/ui/OfflineBanner.vue';
import UpdatePrompt from '@/pwa/UpdatePrompt.vue';
</script>

<template>
  <UApp :toaster="{ position: 'top-right', duration: 4000 }">
    <OfflineBanner />
    <RouterView />
    <UpdatePrompt />
  </UApp>
</template>
