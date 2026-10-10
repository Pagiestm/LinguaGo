import { useOnline } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useNetworkStore = defineStore('network', () => {
  const online = useOnline();
  const pendingCount = ref(0);
  const syncing = ref(false);

  const offline = computed(() => !online.value);

  return { online, offline, pendingCount, syncing };
});
