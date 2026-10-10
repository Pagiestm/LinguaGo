const UNITS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

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

export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 9999) return String(n);
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const unit = n % 10;
    return unit
      ? `${TENS[Math.floor(n / 10)]} ${UNITS[unit]}`
      : TENS[Math.floor(n / 10)];
  }
  if (n < 1000) {
    const rest = n % 100;
    const head = `${UNITS[Math.floor(n / 100)]} hundred`;
    return rest ? `${head} ${numberToWords(rest)}` : head;
  }
  const rest = n % 1000;
  const head = `${numberToWords(Math.floor(n / 1000))} thousand`;
  return rest ? `${head} ${numberToWords(rest)}` : head;
}

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

export function acceptedAnswers(expected: string): string[] {
  const unique = new Set(
    expected
      .split('|')
      .map((alternative) => canonicalText(alternative))
      .filter(Boolean),
  );
  return [...unique];
}

export function spokenWords(transcript: string): string[] {
  return normalizeText(transcript)
    .split(' ')
    .filter(Boolean)
    .flatMap((word) => {
      const time = word.match(/^(\d{1,2})h?(\d{2})$/);
      if (time) {
        const minutes = Number(time[2]);
        const hour = numberToWords(Number(time[1]));
        return minutes === 0
          ? [...hour.split(' '), 'oclock']
          : [...hour.split(' '), ...numberToWords(minutes).split(' ')];
      }
      if (/^\d+$/.test(word)) return numberToWords(Number(word)).split(' ');
      return [word.replace(/^o'?clock$/, 'oclock')];
    });
}

export function isExactMatch(expected: string, answer: string): boolean {
  return acceptedAnswers(expected).includes(canonicalText(answer));
}

export function isSpokenMatch(expected: string, transcript: string): boolean {
  const said = new Set(spokenWords(transcript));
  return expected.split('|').some((alternative) => {
    const expectedWords = spokenWords(alternative);
    return (
      expectedWords.length > 0 && expectedWords.every((word) => said.has(word))
    );
  });
}

export function isTrueFalseMatch(expected: string, answer: string): boolean {
  const map: Record<string, string> = {
    vrai: 'true',
    faux: 'false',
    yes: 'true',
    no: 'false',
  };
  const given = normalizeText(answer);
  return normalizeText(expected) === (map[given] ?? given);
}
