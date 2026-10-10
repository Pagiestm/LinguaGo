<script setup lang="ts">
defineProps<{ title: string; description?: string; danger?: boolean }>();
</script>

<template>
  <section
    class="rounded-xl border p-5 sm:p-6"
    :class="danger ? 'border-error/40' : 'border-default'"
    :aria-label="title"
  >
    <h2 class="font-semibold" :class="danger ? 'text-error' : ''">{{ title }}</h2>
    <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </section>
</template>
