import { canonicalText } from './answers';

export interface DiffWord {
  word: string;
  ok: boolean;
}

export interface WordDiff {
  expected: DiffWord[];
  given: DiffWord[];
}

const words = (text: string) => canonicalText(text).split(' ').filter(Boolean);

export function wordDiff(expected: string, given: string): WordDiff {
  const a = words(expected);
  const b = words(given);
  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i]![j] =
        a[i] === b[j] ? table[i + 1]![j + 1]! + 1 : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
    }
  }
  const expectedOk = new Array<boolean>(a.length).fill(false);
  const givenOk = new Array<boolean>(b.length).fill(false);
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      expectedOk[i] = true;
      givenOk[j] = true;
      i++;
      j++;
    } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
      i++;
    } else {
      j++;
    }
  }
  return {
    expected: a.map((word, index) => ({ word, ok: expectedOk[index] ?? false })),
    given: b.map((word, index) => ({ word, ok: givenOk[index] ?? false })),
  };
}
