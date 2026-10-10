import { computed, ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'linguago.install-dismissed';
const DISMISS_FOR = 30 * 24 * 60 * 60_000;

const deferred = ref<BeforeInstallPromptEvent | null>(null);
const installed = ref(false);
const dismissedAt = ref(0);

function readDismissed(): number {
  try {
    return Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function setupInstallPrompt() {
  if (typeof window === 'undefined') return;
  installed.value = isStandalone();
  dismissedAt.value = readDismissed();
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred.value = event as BeforeInstallPromptEvent;
  });
  window.addEventListener('appinstalled', () => {
    installed.value = true;
    deferred.value = null;
  });
}

export function useInstallPrompt() {
  const canInstall = computed(() => !installed.value && deferred.value !== null);
  const isIOS = computed(
    () =>
      !installed.value &&
      typeof navigator !== 'undefined' &&
      /iphone|ipad|ipod/i.test(navigator.userAgent),
  );
  const recentlyDismissed = computed(() => Date.now() - dismissedAt.value < DISMISS_FOR);
  const suggested = computed(() => (canInstall.value || isIOS.value) && !recentlyDismissed.value);

  async function install(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    const event = deferred.value;
    if (!event) return 'unavailable';
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') installed.value = true;
    deferred.value = null;
    return outcome;
  }

  function dismiss() {
    dismissedAt.value = Date.now();
    try {
      localStorage.setItem(DISMISSED_KEY, String(dismissedAt.value));
    } catch {
      return;
    }
  }

  return { installed, canInstall, isIOS, suggested, install, dismiss };
}
