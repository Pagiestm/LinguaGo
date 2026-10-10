<script setup lang="ts">
import { useToast } from '@nuxt/ui/composables';
import { useQueryCache } from '@pinia/colada';
import { ref, watch } from 'vue';
import { account } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import { keys } from '@/shared/composables/useQueries';
import { useSessionStore } from '@/shared/stores/session';
import SettingsCard from './SettingsCard.vue';

const session = useSessionStore();
const toast = useToast();
const cache = useQueryCache();
const saving = ref(false);
const goal = ref(session.user?.dailyGoal ?? 5);

watch(
  () => session.user?.dailyGoal,
  (value) => {
    if (value) goal.value = value;
  },
);

const options = [
  { value: 5, label: 'Tranquille', hint: '5 points, deux ou trois exercices' },
  { value: 10, label: 'Régulier', hint: '10 points, une série courte' },
  { value: 20, label: 'Sérieux', hint: '20 points, deux séries' },
  { value: 40, label: 'Intensif', hint: '40 points, une vraie session' },
];

async function choose(value: number) {
  if (value === goal.value || saving.value) return;
  saving.value = true;
  try {
    session.setUser(await account.update({ dailyGoal: value }));
    goal.value = value;
    await cache.invalidateQueries({ key: keys.stats });
    toast.add({ title: 'Objectif mis à jour', icon: 'i-lucide-flame', color: 'success' });
  } catch (error) {
    toast.add({
      title: error instanceof ApiError ? error.message : 'Modification impossible',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <SettingsCard
    title="Objectif quotidien"
    description="Les points à gagner chaque jour pour entretenir votre série."
  >
    <div class="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Objectif quotidien">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="goal === option.value"
        :disabled="saving"
        class="card-pop flex items-center gap-3 rounded-2xl border-2 p-4 text-left"
        :class="
          goal === option.value ? 'border-secondary bg-yellow-950/20' : 'border-default bg-default'
        "
        @click="choose(option.value)"
      >
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold"
          :class="goal === option.value ? 'bg-secondary text-slate-900' : 'bg-elevated text-muted'"
          >{{ option.value }}</span
        >
        <span>
          <span class="block font-extrabold">{{ option.label }}</span>
          <span class="block text-xs text-muted">{{ option.hint }}</span>
        </span>
      </button>
    </div>
  </SettingsCard>
</template>
