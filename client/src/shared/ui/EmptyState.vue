<script setup lang="ts">
import AppMascot, { type MascotExpression } from './AppMascot.vue';

withDefaults(
  defineProps<{ title: string; description?: string; expression?: MascotExpression }>(),
  { description: undefined, expression: 'think' },
);
</script>

<template>
  <div
    class="flex flex-col items-center rounded-2xl border-2 border-dashed border-default px-6 py-10 text-center"
  >
    <AppMascot :expression="expression" class="size-20" />
    <p class="mt-4 font-extrabold">{{ title }}</p>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
