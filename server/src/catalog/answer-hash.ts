import { createHash } from 'node:crypto';
import { acceptedAnswers, canonicalText } from '../progress/answer-checker';

export const answerHash = (exerciseId: number, answer: string) =>
  createHash('sha256')
    .update(`${exerciseId}:${canonicalText(answer)}`)
    .digest('hex');

export const answerHashes = (exerciseId: number, expected: string) =>
  acceptedAnswers(expected).map((alternative) =>
    answerHash(exerciseId, alternative),
  );
