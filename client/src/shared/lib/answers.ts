const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bit's\b/g, 'it is'],
  [/\bthat's\b/g, 'that is'],
  [/\bwhat's\b/g, 'what is'],
  [/\bwhere's\b/g, 'where is'],
  [/\bthere's\b/g, 'there is'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bi've\b/g, 'i have'],
  [/\byou've\b/g, 'you have'],
  [/\bwe've\b/g, 'we have'],
  [/\bthey've\b/g, 'they have'],
  [/\bi'll\b/g, 'i will'],
  [/\byou'll\b/g, 'you will'],
  [/\bhe'll\b/g, 'he will'],
  [/\bshe'll\b/g, 'she will'],
  [/\bwe'll\b/g, 'we will'],
  [/\bthey'll\b/g, 'they will'],
  [/\bi'd\b/g, 'i would'],
  [/\byou'd\b/g, 'you would'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\blet's\b/g, 'let us'],
  [/n't\b/g, ' not'],
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[.,!?;:'"()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function canonicalText(text: string): string {
  let result = text.toLowerCase().replace(/[’‘`´]/g, "'");
  for (const [pattern, replacement] of CONTRACTIONS) {
    result = result.replace(pattern, replacement);
  }
  return normalizeText(result);
}

export async function answerHash(exerciseId: number, answer: string): Promise<string> {
  const data = new TextEncoder().encode(`${exerciseId}:${canonicalText(answer)}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function matchesOffline(
  exerciseId: number,
  expectedHashes: string | string[],
  answer: string,
): Promise<boolean> {
  const accepted = new Set(Array.isArray(expectedHashes) ? expectedHashes : [expectedHashes]);
  const candidates = [answer];
  const lowered = normalizeText(answer);
  const trueFalse: Record<string, string> = {
    vrai: 'true',
    faux: 'false',
    yes: 'true',
    no: 'false',
  };
  if (trueFalse[lowered]) candidates.push(trueFalse[lowered]);
  for (const candidate of candidates) {
    if (accepted.has(await answerHash(exerciseId, candidate))) return true;
  }
  return false;
}
