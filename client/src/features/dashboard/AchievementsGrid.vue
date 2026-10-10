<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables';
import { watch } from 'vue';
import type { Achievement } from '@/shared/api/types';

const props = defineProps<{ achievements: Achievement[] }>();
const toast = useToast();

watch(
  () => props.achievements,
  (list) => {
    for (const achievement of list.filter((a) => a.isNew)) {
      toast.add({
        title: `Succès débloqué : ${achievement.title}`,
        description: achievement.description,
        icon: achievement.icon,
        color: 'secondary',
        duration: 6000,
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
    <li
      v-for="achievement in achievements"
      :key="achievement.code"
      class="flex items-center gap-3 rounded-2xl border-2 p-3"
      :class="
        achievement.unlocked
          ? 'border-secondary/60 bg-yellow-950/20'
          : 'border-dashed border-default opacity-60'
      "
      :title="achievement.description"
    >
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-2xl"
        :class="
          achievement.unlocked
            ? 'bg-secondary text-slate-900 shadow-[0_3px_0_0_rgba(0,0,0,0.2)]'
            : 'bg-elevated text-muted'
        "
      >
        <span
          :class="achievement.unlocked ? achievement.icon : 'i-lucide-lock'"
          class="size-5"
          aria-hidden="true"
        />
      </span>
      <div class="min-w-0">
        <p class="truncate text-sm font-extrabold">{{ achievement.title }}</p>
        <p class="line-clamp-2 text-xs text-muted">{{ achievement.description }}</p>
      </div>
    </li>
  </ul>
</template>
