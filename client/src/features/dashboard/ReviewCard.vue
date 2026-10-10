<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import type { ReviewSummary } from '@/shared/api/types';
import { formatDateTime } from '@/shared/lib/format';
import AppMascot from '@/shared/ui/AppMascot.vue';

defineProps<{ reviews: ReviewSummary }>();
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-2xl border-2 border-default bg-default p-5 sm:flex-row sm:items-center"
    aria-labelledby="review-title"
  >
    <AppMascot :expression="reviews.due > 0 ? 'think' : 'happy'" class="size-16 shrink-0" />
    <div class="flex-1">
      <h2 id="review-title" class="text-lg">
        <template v-if="reviews.due > 0"
          >{{ reviews.due }} exercice{{ reviews.due > 1 ? 's' : '' }} à revoir</template
        >
        <template v-else>Rien à revoir aujourd'hui</template>
      </h2>
      <p class="mt-1 text-sm text-muted">
        <template v-if="reviews.due > 0"
          >Les ratés reviennent à intervalles croissants, jusqu'à être acquis.</template
        >
        <template v-else-if="reviews.nextDueAt"
          >Prochaine révision : {{ formatDateTime(reviews.nextDueAt) }}.</template
        >
        <template v-else>Ratez un exercice et il reviendra ici au bon moment.</template>
      </p>
    </div>
    <div class="flex shrink-0 flex-wrap gap-2 self-end sm:self-auto">
      <UButton
        to="/dashboard/daily"
        icon="i-lucide-timer"
        color="secondary"
        class="btn-pop btn-pop-secondary font-extrabold text-slate-900"
        >Cinq minutes</UButton
      >
      <UButton
        v-if="reviews.due > 0"
        to="/dashboard/review"
        icon="i-lucide-rotate-ccw"
        class="btn-pop font-extrabold"
        >Réviser</UButton
      >
    </div>
  </section>
</template>
