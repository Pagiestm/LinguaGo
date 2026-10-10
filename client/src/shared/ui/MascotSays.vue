<script setup lang="ts">
import AppMascot, { type MascotExpression } from './AppMascot.vue';

withDefaults(
  defineProps<{
    expression?: MascotExpression;
    size?: 'sm' | 'md' | 'lg';
    side?: 'left' | 'right';
    animated?: boolean;
  }>(),
  { expression: 'happy', size: 'md', side: 'left', animated: false },
);

const sizes = { sm: 'size-16', md: 'size-24', lg: 'size-40 sm:size-52' };
</script>

<template>
  <div
    class="flex items-center gap-4"
    :class="side === 'right' ? 'flex-row-reverse text-right' : ''"
  >
    <AppMascot
      :expression="expression"
      :animated="animated"
      class="shrink-0"
      :class="sizes[size]"
    />
    <div
      class="bubble relative rounded-2xl border-2 border-default bg-default px-4 py-3 text-sm font-semibold"
      :class="side === 'right' ? 'bubble-right' : 'bubble-left'"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bubble::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: inherit;
  border: 2px solid var(--ui-border);
  transform: translateY(-50%) rotate(45deg);
}
.bubble-left::before {
  left: -9px;
  border-right: 0;
  border-top: 0;
}
.bubble-right::before {
  right: -9px;
  border-left: 0;
  border-bottom: 0;
}
</style>
