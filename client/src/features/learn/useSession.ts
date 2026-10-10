import { useToast } from '@nuxt/ui/composables';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { progress } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import type { AnswerResult, ExerciseView, SeriesDetail } from '@/shared/api/types';
import { useInvalidate } from '@/shared/composables/useQueries';
import { matchesOffline } from '@/shared/lib/answers';
import { enqueue, markCachedExerciseCompleted } from '@/shared/offline/db';
import { useNetworkStore } from '@/shared/stores/network';

export interface Feedback extends AnswerResult {
  offline: boolean;
}

export function useSession(series: () => SeriesDetail | undefined) {
  const network = useNetworkStore();
  const toast = useToast();
  const invalidate = useInvalidate();

  const index = ref(0);
  const feedback = ref<Feedback | null>(null);
  const lastAnswer = ref('');
  const checking = ref(false);
  const results = ref<{ exercise: ExerciseView; correct: boolean }[]>([]);
  const finished = ref(false);
  const elapsed = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;
  let timeReported = false;

  const exercises = computed(() => series()?.exercises ?? []);
  const current = computed(() => exercises.value[index.value]);
  const total = computed(() => exercises.value.length);
  const correctCount = computed(() => results.value.filter((r) => r.correct).length);
  const earned = computed(() => results.value.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0));

  function startTimer() {
    stopTimer();
    timer = setInterval(() => (elapsed.value += 1), 1000);
  }

  function stopTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  async function reportTime() {
    const seriesId = series()?.id;
    if (timeReported || !seriesId || elapsed.value < 5) return;
    timeReported = true;
    const seconds = Math.min(elapsed.value, 3600);
    try {
      if (network.offline)
        await enqueue({ kind: 'time', seriesId, seconds, createdAt: Date.now() });
      else await progress.addTime(seriesId, seconds);
    } catch {
      await enqueue({ kind: 'time', seriesId, seconds, createdAt: Date.now() });
    }
  }

  async function answer(value: string) {
    const exercise = current.value;
    const detail = series();
    if (!exercise || !detail || checking.value) return;
    checking.value = true;
    lastAnswer.value = value;
    try {
      let result: Feedback;
      if (network.offline) {
        const correct = await matchesOffline(
          exercise.id,
          exercise.answerHashes ?? [exercise.answerHash],
          value,
        );
        await enqueue({
          kind: 'answer',
          exerciseId: exercise.id,
          seriesId: detail.id,
          answer: value,
          createdAt: Date.now(),
        });
        network.pendingCount += 1;
        if (correct && detail.id) await markCachedExerciseCompleted(detail.id, exercise.id);
        result = {
          correct,
          alreadyCompleted: exercise.isCompleted,
          pointsWon: correct && !exercise.isCompleted ? detail.level.pointsPerExercise : 0,
          seriesCompleted: false,
          verifiedBy: 'offline',
          offline: true,
        };
      } else {
        try {
          result = { ...(await progress.answer(exercise.id, value)), offline: false };
        } catch (error) {
          if (!(error instanceof ApiError && error.isNetworkError)) throw error;
          const correct = await matchesOffline(
            exercise.id,
            exercise.answerHashes ?? [exercise.answerHash],
            value,
          );
          await enqueue({
            kind: 'answer',
            exerciseId: exercise.id,
            seriesId: detail.id,
            answer: value,
            createdAt: Date.now(),
          });
          network.pendingCount += 1;
          result = {
            correct,
            alreadyCompleted: exercise.isCompleted,
            pointsWon: 0,
            seriesCompleted: false,
            verifiedBy: 'offline',
            offline: true,
          };
        }
      }
      if (result.correct) exercise.isCompleted = true;
      results.value.push({ exercise, correct: result.correct });
      feedback.value = result;
      if (result.seriesCompleted) {
        toast.add({
          title: 'Série terminée',
          description: 'Bravo, tous les exercices sont réussis.',
          icon: 'i-lucide-party-popper',
          color: 'success',
        });
      }
    } catch (error) {
      toast.add({
        title: 'Réponse non envoyée',
        description: error instanceof Error ? error.message : undefined,
        color: 'error',
        icon: 'i-lucide-circle-x',
      });
    } finally {
      checking.value = false;
    }
  }

  async function next() {
    feedback.value = null;
    if (index.value < total.value - 1) {
      index.value += 1;
      return;
    }
    finished.value = true;
    stopTimer();
    await reportTime();
    await invalidate.all();
  }

  function restart() {
    index.value = 0;
    feedback.value = null;
    lastAnswer.value = '';
    results.value = [];
    finished.value = false;
    elapsed.value = 0;
    timeReported = false;
    startTimer();
  }

  watch(
    () => {
      const value = series();
      return value ? `${value.id}:${value.exercises.map((e) => e.id).join(',')}` : null;
    },
    (signature) => {
      if (signature) restart();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopTimer();
    void reportTime();
  });

  return {
    index,
    current,
    total,
    feedback,
    lastAnswer,
    checking,
    results,
    finished,
    elapsed,
    correctCount,
    earned,
    answer,
    next,
    restart,
  };
}
