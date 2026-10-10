import type { ExerciseType } from '../generated/prisma/enums';
import { answerHashes } from './answer-hash';

export interface ExerciseView {
  id: number;
  type: ExerciseType;
  question: string;
  choices: string[];
  spokenText?: string;
  isCompleted: boolean;
  answerHash: string;
  answerHashes: string[];
}

const seededShuffle = (words: string[], seed: number): string[] => {
  const copy = [...words];
  let state = seed * 2654435761 + 1;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const firstAlternative = (answer: string) =>
  answer.split('|')[0]?.trim() ?? answer;

export function toExerciseView(
  exercise: {
    id: number;
    type: ExerciseType;
    question: string;
    answer: string;
    choices: unknown;
  },
  isCompleted: boolean,
): ExerciseView {
  const hashes = answerHashes(exercise.id, exercise.answer);
  const view: ExerciseView = {
    id: exercise.id,
    type: exercise.type,
    question: exercise.question,
    choices: [],
    isCompleted,
    answerHash: hashes[0] ?? '',
    answerHashes: hashes,
  };
  if (exercise.type === 'MULTIPLE_CHOICE' && Array.isArray(exercise.choices)) {
    view.choices = exercise.choices.map(String);
  } else if (exercise.type === 'ORDER') {
    const words = firstAlternative(exercise.answer)
      .split(/\s+/)
      .filter(Boolean);
    const shuffled = seededShuffle(words, exercise.id);
    view.choices =
      shuffled.join(' ') === words.join(' ') && words.length > 1
        ? [...words].reverse()
        : shuffled;
  } else if (exercise.type === 'DICTATION') {
    view.spokenText = firstAlternative(exercise.answer);
  }
  return view;
}
