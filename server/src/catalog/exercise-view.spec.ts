import { toExerciseView } from './exercise-view';

describe('toExerciseView', () => {
  it('mélange les mots d’un exercice de remise en ordre sans révéler l’ordre', () => {
    const view = toExerciseView(
      {
        id: 42,
        type: 'ORDER',
        question: 'Mettez dans l’ordre',
        answer: 'i am a student',
        choices: [],
      },
      false,
    );
    expect([...view.choices].sort()).toEqual(['a', 'am', 'i', 'student']);
    expect(view.choices.join(' ')).not.toBe('i am a student');
    expect(view).not.toHaveProperty('spokenText');
  });

  it('expose le texte à dicter et garde l’empreinte', () => {
    const view = toExerciseView(
      {
        id: 7,
        type: 'DICTATION',
        question: 'Écoutez et écrivez',
        answer: 'good morning',
        choices: [],
      },
      true,
    );
    expect(view.spokenText).toBe('good morning');
    expect(view.isCompleted).toBe(true);
    expect(view.answerHash).toHaveLength(64);
  });

  it('produit une empreinte par alternative acceptée', () => {
    const view = toExerciseView(
      {
        id: 9,
        type: 'TRANSLATION',
        question: 'Traduisez',
        answer: 'the bill | the check',
        choices: [],
      },
      false,
    );
    expect(view.answerHashes).toHaveLength(2);
    expect(view.answerHash).toBe(view.answerHashes[0]);
  });
});
