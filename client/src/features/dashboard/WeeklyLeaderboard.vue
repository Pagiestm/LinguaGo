<script setup lang="ts">
import type { LeaderboardEntry } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import AvatarImage from '@/shared/ui/AvatarImage.vue';
import EmptyState from '@/shared/ui/EmptyState.vue';

defineProps<{ entries: LeaderboardEntry[] }>();

const medals = ['🥇', '🥈', '🥉'];
const podium = ['bg-yellow-950/40', 'bg-slate-800/60', 'bg-orange-950/40'];
</script>

<template>
  <ol v-if="entries.length" class="space-y-2" role="list">
    <li
      v-for="entry in entries"
      :key="entry.rank"
      class="flex items-center gap-4 rounded-2xl px-3 py-2.5"
      :class="[
        podium[entry.rank - 1] ?? '',
        entry.isMe ? 'border-2 border-primary/50' : 'border-2 border-transparent',
      ]"
    >
      <span class="w-8 text-center text-lg font-extrabold tabular-nums text-muted">{{
        medals[entry.rank - 1] ?? entry.rank
      }}</span>
      <AvatarImage :avatar="entry.avatar" :name="entry.pseudo" size="sm" />
      <span class="flex-1 truncate font-extrabold">
        {{ entry.pseudo }}
        <span
          v-if="entry.isMe"
          class="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-extrabold text-white"
          >vous</span
        >
      </span>
      <span class="font-extrabold tabular-nums"
        >{{ formatNumber(entry.points) }}
        <span class="text-xs font-bold text-muted">pts</span></span
      >
    </li>
  </ol>
  <EmptyState
    v-else
    title="Pas encore de classement"
    description="Les points gagnés cette semaine apparaîtront ici."
  />
</template>
