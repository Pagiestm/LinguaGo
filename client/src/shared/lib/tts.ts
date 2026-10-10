export const ttsSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  'SpeechSynthesisUtterance' in window;

export function speak(text: string, lang = 'en-US') {
  if (!ttsSupported()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  const voice = speechSynthesis
    .getVoices()
    .find((candidate) => candidate.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (voice) utterance.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
