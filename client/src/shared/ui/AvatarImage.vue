<script setup lang="ts">
import DOMPurify from 'dompurify';
import { computed } from 'vue';
import { initials } from '@/shared/lib/format';
import type { Avatar } from '@/shared/api/types';

const props = withDefaults(
  defineProps<{ avatar: Avatar | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>(),
  {
    size: 'md',
  },
);

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-24 text-2xl',
};

const svg = computed(() =>
  props.avatar
    ? DOMPurify.sanitize(props.avatar.svg, { USE_PROFILES: { svg: true, svgFilters: true } })
    : '',
);
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary [&>svg]:size-full"
    :class="sizes[size]"
    role="img"
    :aria-label="`Avatar de ${name}`"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <span v-if="svg" class="contents" v-html="svg" />
    <span v-else>{{ initials(name) }}</span>
  </span>
</template>
