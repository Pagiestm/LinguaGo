<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { applyUpdate, updateAvailable } from './register';
</script>

<template>
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="translate-y-4 opacity-0"
    leave-active-class="transition duration-200"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="updateAvailable"
      role="status"
      class="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-default bg-elevated p-4 shadow-lg"
    >
      <span class="i-lucide-sparkles size-5 shrink-0 text-primary" aria-hidden="true" />
      <p class="flex-1 text-sm">Une nouvelle version de LinguaGo est prête.</p>
      <UButton size="sm" @click="applyUpdate">Mettre à jour</UButton>
    </div>
  </Transition>
</template>
