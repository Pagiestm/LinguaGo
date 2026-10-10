<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import USkeleton from '@nuxt/ui/components/Skeleton.vue';
import { computed } from 'vue';
import { isNetworkError } from '@/shared/api/http';
import {
  useAchievements,
  useActivity,
  useCompletedSeries,
  useLeague,
  useReviews,
  useStats,
} from '@/shared/composables/useQueries';
import { formatDuration, formatNumber } from '@/shared/lib/format';
import { useSessionStore } from '@/shared/stores/session';
import OfflineState from '@/shared/ui/OfflineState.vue';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StatTile from '@/shared/ui/StatTile.vue';
import AchievementsGrid from './AchievementsGrid.vue';
import ActivityChart from './ActivityChart.vue';
import LeagueBoard from './LeagueBoard.vue';
import OnboardingCard from './OnboardingCard.vue';
import ReviewCard from './ReviewCard.vue';
import SeriesByLevelChart from './SeriesByLevelChart.vue';
import StreakCard from './StreakCard.vue';

const session = useSessionStore();
const { data: stats, status, error } = useStats();
const { data: activity } = useActivity(7);
const { data: completed } = useCompletedSeries();
const { data: league } = useLeague();
const { data: reviews } = useReviews();
const { data: achievements } = useAchievements();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Bonne nuit';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
});

const successRate = computed(() => {
  if (!stats.value) return null;
  const total = stats.value.successfulExercises + stats.value.failedExercises;
  return total === 0 ? null : Math.round((stats.value.successfulExercises / total) * 100);
});

const offline = computed(() => !stats.value && isNetworkError(error.value));
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Tableau de bord"
      :title="`${greeting}, ${session.user?.pseudo}`"
      :description="
        stats?.level.next
          ? `Encore ${formatNumber(stats.level.next.pointsRequired - stats.points)} points avant le niveau ${stats.level.next.code}.`
          : 'Vous avez atteint le dernier niveau. Continuez à pratiquer pour garder le rythme.'
      "
    >
      <template #actions>
        <UButton to="/dashboard/learn" icon="i-lucide-play" size="lg" class="btn-pop font-extrabold"
          >Continuer à apprendre</UButton
        >
      </template>
    </PageHeader>

    <OnboardingCard v-if="session.user?.firstLogin" />

    <OfflineState v-if="offline" />

    <template v-else>
      <StreakCard v-if="stats?.streak && stats.today" :streak="stats.streak" :today="stats.today" />

      <ReviewCard v-if="reviews" :reviews="reviews" class="mb-6" />

      <div v-if="status === 'pending' && !stats" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="n in 4" :key="n" class="h-28 rounded-2xl" />
      </div>
      <div v-else-if="stats" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Points"
          :value="formatNumber(stats.points)"
          :hint="`Niveau ${stats.level.current.code} · ${stats.level.current.title}`"
          icon="i-lucide-star"
          color="yellow"
        />
        <StatTile
          label="Exercices réussis"
          :value="formatNumber(stats.successfulExercises)"
          :hint="
            successRate === null ? 'Aucune réponse pour le moment' : `${successRate} % de réussite`
          "
          icon="i-lucide-circle-check"
          color="green"
        />
        <StatTile
          label="Séries terminées"
          :value="formatNumber(stats.completedSeries)"
          :hint="`${stats.favoritesCount} en favoris`"
          icon="i-lucide-flag"
          color="blue"
        />
        <StatTile
          label="Temps d'entraînement"
          :value="formatDuration(stats.timeSpentSeconds)"
          hint="Cumulé sur toutes vos séries"
          icon="i-lucide-timer"
          color="purple"
        />
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <section
          class="min-w-0 rounded-2xl border-2 border-default p-5 lg:col-span-2"
          aria-labelledby="activity-title"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 id="activity-title" class="text-lg">Exercices réussis</h2>
              <p class="text-sm text-muted">Sur les sept derniers jours</p>
            </div>
          </div>
          <div class="relative mt-4 h-64 min-w-0">
            <ActivityChart v-if="activity" :days="activity" />
            <USkeleton v-else class="size-full rounded-2xl" />
          </div>
        </section>

        <section
          class="min-w-0 rounded-2xl border-2 border-default p-5"
          aria-labelledby="levels-title"
        >
          <h2 id="levels-title" class="text-lg">Séries terminées</h2>
          <p class="text-sm text-muted">Par niveau</p>
          <div class="relative mt-4 h-64 min-w-0">
            <SeriesByLevelChart v-if="completed" :levels="completed" />
            <USkeleton v-else class="size-full rounded-2xl" />
          </div>
        </section>
      </div>

      <section
        class="mt-6 rounded-2xl border-2 border-default p-5"
        aria-labelledby="achievements-title"
      >
        <h2 id="achievements-title" class="text-lg">Succès</h2>
        <p class="text-sm text-muted">
          <template v-if="achievements"
            >{{ achievements.filter((a) => a.unlocked).length }} sur
            {{ achievements.length }} débloqués</template
          >
          <template v-else>Vos badges, au fil des exercices</template>
        </p>
        <div class="mt-4">
          <AchievementsGrid v-if="achievements" :achievements="achievements" />
          <USkeleton v-else class="h-32 rounded-2xl" />
        </div>
      </section>

      <section
        class="mt-6 rounded-2xl border-2 border-default p-5"
        aria-labelledby="leaderboard-title"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 id="leaderboard-title" class="text-lg">Classement de la semaine</h2>
            <p class="text-sm text-muted">Points gagnés ces sept derniers jours dans votre ligue</p>
          </div>
        </div>
        <div class="mt-4">
          <LeagueBoard v-if="league" :board="league" />
          <USkeleton v-else class="h-40 rounded-2xl" />
        </div>
      </section>
    </template>
  </div>
</template>
