type RecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
}

function constructor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechSupported = () => constructor() !== null;

export interface Recognizer {
  start(): void;
  stop(): void;
}

export function createRecognizer(handlers: {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd: () => void;
  onError: (code: string) => void;
}): Recognizer | null {
  const Ctor = constructor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]!;
      const transcript = result[0]?.transcript ?? '';
      if (result.isFinal) handlers.onFinal(transcript.trim());
      else interim += transcript;
    }
    if (interim) handlers.onInterim(interim.trim());
  };
  recognition.onend = () => handlers.onEnd();
  recognition.onerror = (event) => handlers.onError(event.error);

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
