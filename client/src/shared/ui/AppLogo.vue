<script setup lang="ts">
import AppMascot from './AppMascot.vue';

defineProps<{ compact?: boolean }>();
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-950">
      <AppMascot class="size-8 translate-y-0.5" />
    </span>
    <span v-if="!compact" class="text-xl font-extrabold tracking-tight"
      >Lingua<span class="text-secondary">Go</span></span
    >
  </span>
</template>
