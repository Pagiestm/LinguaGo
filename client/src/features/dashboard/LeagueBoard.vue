<script setup lang="ts">
import type { LeagueBoard } from '@/shared/api/types';
import { formatNumber } from '@/shared/lib/format';
import AvatarImage from '@/shared/ui/AvatarImage.vue';

const props = defineProps<{ board: LeagueBoard }>();

const colors: Record<number, string> = {
  1: 'bg-orange-950/40 text-orange-300',
  2: 'bg-slate-800 text-slate-200',
  3: 'bg-yellow-950/40 text-yellow-200',
  4: 'bg-sky-950/40 text-sky-200',
};

const zone = (rank: number) => {
  if (props.board.promote && rank <= props.board.promote) return 'up';
  if (props.board.relegate && rank > props.board.entries.length - props.board.relegate)
    return 'down';
  return 'stay';
};

const endsIn = () => {
  const days = Math.max(0, Math.ceil((Date.parse(props.board.resetsAt) - Date.now()) / 86_400_000));
  return days <= 1 ? 'se termine demain' : `se termine dans ${days} jours`;
};
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold"
        :class="colors[board.tier] ?? colors[1]"
      >
        <span class="i-lucide-shield size-4" aria-hidden="true" />Ligue {{ board.name }}
      </span>
      <span class="text-sm text-muted">
        {{ board.members }} membre{{ board.members > 1 ? 's' : '' }} · {{ endsIn() }}
      </span>
    </div>
    <ol class="space-y-1.5" role="list">
      <li
        v-for="entry in board.entries"
        :key="entry.rank"
        class="flex items-center gap-3 rounded-2xl border-2 px-3 py-2"
        :class="[
          zone(entry.rank) === 'up'
            ? 'border-success/40 bg-green-950/20'
            : zone(entry.rank) === 'down'
              ? 'border-error/40 bg-red-950/20'
              : 'border-transparent',
          entry.isMe ? 'ring-2 ring-primary/50' : '',
        ]"
      >
        <span class="w-6 text-center text-sm font-extrabold tabular-nums text-muted">{{
          entry.rank
        }}</span>
        <span
          v-if="zone(entry.rank) === 'up'"
          class="i-lucide-chevron-up size-4 text-success"
          aria-label="Zone de montée"
        />
        <span
          v-else-if="zone(entry.rank) === 'down'"
          class="i-lucide-chevron-down size-4 text-error"
          aria-label="Zone de descente"
        />
        <span v-else class="size-4" aria-hidden="true" />
        <AvatarImage :avatar="entry.avatar" :name="entry.pseudo" size="sm" />
        <span class="flex-1 truncate text-sm font-extrabold">
          {{ entry.pseudo }}
          <span
            v-if="entry.isMe"
            class="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-extrabold text-white"
            >vous</span
          >
        </span>
        <span class="text-sm font-extrabold tabular-nums"
          >{{ formatNumber(entry.points) }} <span class="text-xs text-muted">pts</span></span
        >
      </li>
    </ol>
    <p class="mt-3 text-xs text-muted">
      <template v-if="board.top">Vous êtes dans la ligue la plus haute. </template>
      <template v-else>Les {{ board.promote }} premiers montent de ligue lundi. </template>
      <template v-if="board.relegate">Les {{ board.relegate }} derniers descendent.</template>
    </p>
  </div>
</template>
