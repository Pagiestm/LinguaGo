import { parseSender } from './sender';

describe('parseSender', () => {
  it('sépare le nom et l’adresse', () => {
    expect(parseSender('LinguaGo <no-reply@linguago.test>')).toEqual({
      name: 'LinguaGo',
      email: 'no-reply@linguago.test',
    });
    expect(parseSender('"Lingo, le perroquet" <lingo@linguago.test>')).toEqual({
      name: 'Lingo, le perroquet',
      email: 'lingo@linguago.test',
    });
  });

  it('accepte une adresse nue', () => {
    expect(parseSender('  no-reply@linguago.test ')).toEqual({
      email: 'no-reply@linguago.test',
    });
  });
});
