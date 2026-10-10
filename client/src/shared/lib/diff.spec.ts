import { describe, expect, it } from 'vitest';
import { wordDiff } from './diff';

describe('wordDiff', () => {
  it('marque les mots manquants et les mots en trop', () => {
    const diff = wordDiff('i am a student', 'I is a student.');
    expect(diff.expected.map((w) => `${w.word}${w.ok ? '' : '!'}`)).toEqual([
      'i',
      'am!',
      'a',
      'student',
    ]);
    expect(diff.given.map((w) => `${w.word}${w.ok ? '' : '!'}`)).toEqual([
      'i',
      'is!',
      'a',
      'student',
    ]);
  });

  it('considère une contraction comme équivalente', () => {
    const diff = wordDiff('i am a student', "I'm a student");
    expect(diff.expected.every((w) => w.ok)).toBe(true);
    expect(diff.given.every((w) => w.ok)).toBe(true);
  });

  it('gère une réponse vide', () => {
    const diff = wordDiff('hello', '');
    expect(diff.expected).toEqual([{ word: 'hello', ok: false }]);
    expect(diff.given).toEqual([]);
  });
});
