<script setup lang="ts">
import { useNetworkStore } from '@/shared/stores/network';

const network = useNetworkStore();
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="-translate-y-full"
    leave-active-class="transition duration-200"
    leave-to-class="-translate-y-full"
  >
    <div
      v-if="network.offline || network.syncing"
      role="status"
      class="flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium"
      :class="network.offline ? 'bg-amber-500 text-amber-950' : 'bg-primary text-white'"
    >
      <span
        :class="network.offline ? 'i-lucide-wifi-off' : 'i-lucide-refresh-cw animate-spin'"
        class="size-3.5"
        aria-hidden="true"
      />
      <span v-if="network.offline">
        Hors connexion : vos séries favorites restent disponibles
        <template v-if="network.pendingCount > 0"
          >· {{ network.pendingCount }} réponse{{ network.pendingCount > 1 ? 's' : '' }} à
          synchroniser</template
        >
      </span>
      <span v-else>Synchronisation de vos réponses…</span>
    </div>
  </Transition>
</template>
