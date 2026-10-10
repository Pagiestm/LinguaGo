<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; description?: string }>();
</script>

<template>
  <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p
        v-if="eyebrow"
        class="inline-flex rounded-full bg-secondary/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-200"
      >
        {{ eyebrow }}
      </p>
      <h1 class="mt-3 text-3xl tracking-tight sm:text-4xl">{{ title }}</h1>
      <p v-if="description" class="mt-2 max-w-2xl text-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
