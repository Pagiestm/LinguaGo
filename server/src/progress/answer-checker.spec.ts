import {
  acceptedAnswers,
  canonicalText,
  isExactMatch,
  isSpokenMatch,
  isTrueFalseMatch,
  normalizeText,
  numberToWords,
  spokenWords,
} from './answer-checker';

describe('normalizeText', () => {
  it('ignore la casse, la ponctuation et les espaces superflus', () => {
    expect(normalizeText("  My Name's   Paul! ")).toBe('my names paul');
    expect(normalizeText('“Hello”, world.')).toBe('hello world');
  });
});

describe('canonicalText', () => {
  it('développe les contractions avant de normaliser', () => {
    expect(canonicalText("I'm a student")).toBe('i am a student');
    expect(canonicalText('It’s seven')).toBe('it is seven');
    expect(canonicalText("They don't know")).toBe('they do not know');
    expect(canonicalText("We can't")).toBe('we cannot');
  });
});

describe('acceptedAnswers', () => {
  it('sépare les alternatives et retire les doublons', () => {
    expect(acceptedAnswers("I am a student | I'm a student|")).toEqual([
      'i am a student',
    ]);
    expect(acceptedAnswers('the bill | the check')).toEqual([
      'the bill',
      'the check',
    ]);
  });
});

describe('numberToWords', () => {
  it('écrit les nombres en toutes lettres', () => {
    expect(numberToWords(7)).toBe('seven');
    expect(numberToWords(21)).toBe('twenty one');
    expect(numberToWords(100)).toBe('one hundred');
    expect(numberToWords(345)).toBe('three hundred forty five');
    expect(numberToWords(2024)).toBe('two thousand twenty four');
  });
});

describe('spokenWords', () => {
  it('convertit les heures et les nombres reconnus en mots', () => {
    expect(spokenWords('It is 7:00')).toEqual(['it', 'is', 'seven', 'oclock']);
    expect(spokenWords('at 7:30')).toEqual(['at', 'seven', 'thirty']);
    expect(spokenWords('I have 3 cats')).toEqual([
      'i',
      'have',
      'three',
      'cats',
    ]);
    expect(spokenWords("seven o'clock")).toEqual(['seven', 'oclock']);
  });
});

describe('isSpokenMatch', () => {
  it('accepte une transcription qui contient tous les mots attendus', () => {
    expect(isSpokenMatch('it is seven oclock', 'It is 7:00')).toBe(true);
    expect(isSpokenMatch('green', 'the colour is green')).toBe(true);
  });

  it('refuse une transcription incomplète ou vide', () => {
    expect(isSpokenMatch('good morning', 'good')).toBe(false);
    expect(isSpokenMatch('cow', '')).toBe(false);
  });
});

describe('isExactMatch et isTrueFalseMatch', () => {
  it('compare après normalisation', () => {
    expect(isExactMatch('my name is paul', "My name's is Paul.")).toBe(false);
    expect(isExactMatch('my name is paul', 'My Name Is Paul.')).toBe(true);
  });

  it('accepte les contractions et les alternatives déclarées', () => {
    expect(isExactMatch('i am a student', "I'm a student")).toBe(true);
    expect(
      isExactMatch(
        'the bill | the check',
        'The check, please'.replace(', please', ''),
      ),
    ).toBe(true);
    expect(isExactMatch('the bill | the check', 'the receipt')).toBe(false);
  });

  it('accepte vrai/faux en français', () => {
    expect(isTrueFalseMatch('true', 'Vrai')).toBe(true);
    expect(isTrueFalseMatch('false', 'true')).toBe(false);
  });
});
