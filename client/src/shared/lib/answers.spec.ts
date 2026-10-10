import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { answerHash, canonicalText, matchesOffline, normalizeText } from './answers';

const serverHash = (id: number, answer: string) =>
  createHash('sha256')
    .update(`${id}:${canonicalText(answer)}`)
    .digest('hex');

describe('normalizeText', () => {
  it('applique les mêmes règles que le serveur', () => {
    expect(normalizeText("  My Name's   Paul! ")).toBe('my names paul');
    expect(normalizeText('“Hello”, world.')).toBe('hello world');
    expect(normalizeText("seven o'clock")).toBe('seven oclock');
  });
});

describe('canonicalText', () => {
  it('développe les contractions comme le serveur', () => {
    expect(canonicalText("I'm a student")).toBe('i am a student');
    expect(canonicalText("They don't know")).toBe('they do not know');
  });
});

describe('answerHash', () => {
  it('produit la même empreinte que le serveur', async () => {
    expect(await answerHash(7, 'Hello')).toBe(serverHash(7, 'hello'));
    expect(await answerHash(7, "It's seven")).toBe(serverHash(7, 'it is seven'));
  });
});

describe('matchesOffline', () => {
  it('reconnaît une bonne réponse hors ligne, casse et ponctuation ignorées', async () => {
    const hash = serverHash(12, 'my name is paul');
    expect(await matchesOffline(12, hash, 'My name is Paul.')).toBe(true);
    expect(await matchesOffline(12, hash, 'my name is john')).toBe(false);
  });

  it('accepte chacune des formulations alternatives', async () => {
    const hashes = [serverHash(5, 'the bill'), serverHash(5, 'the check')];
    expect(await matchesOffline(5, hashes, 'The check')).toBe(true);
    expect(await matchesOffline(5, hashes, 'the receipt')).toBe(false);
  });

  it('accepte vrai et faux en français', async () => {
    expect(await matchesOffline(3, serverHash(3, 'true'), 'Vrai')).toBe(true);
    expect(await matchesOffline(3, serverHash(3, 'false'), 'vrai')).toBe(false);
  });
});
