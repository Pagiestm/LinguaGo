import { ref } from 'vue';
import { Workbox } from 'workbox-window';

export const updateAvailable = ref(false);
export const swRegistration = ref<ServiceWorkerRegistration | null>(null);

const REFRESH_TAG = 'linguago-refresh';
const DAY = 24 * 60 * 60_000;

let workbox: Workbox | null = null;

type PeriodicRegistration = ServiceWorkerRegistration & {
  periodicSync?: { register(tag: string, options: { minInterval: number }): Promise<void> };
};

async function registerPeriodicRefresh(registration: ServiceWorkerRegistration) {
  const periodic = (registration as PeriodicRegistration).periodicSync;
  if (!periodic || !('permissions' in navigator)) return;
  try {
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName,
    });
    if (status.state === 'granted') await periodic.register(REFRESH_TAG, { minInterval: DAY });
  } catch {
    return;
  }
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  workbox = import.meta.env.DEV
    ? new Workbox('/dev-sw.js?dev-sw', { scope: '/', type: 'module' })
    : new Workbox('/service-worker.js', { scope: '/' });
  workbox.addEventListener('waiting', () => {
    if (import.meta.env.DEV) workbox?.messageSkipWaiting();
    else updateAvailable.value = true;
  });
  workbox.addEventListener('controlling', (event) => {
    if (event.isUpdate) window.location.reload();
  });
  void workbox.register().then((registration) => {
    swRegistration.value = registration ?? null;
    if (registration) void registerPeriodicRefresh(registration);
  });
}

export function applyUpdate() {
  if (!workbox) return;
  workbox.messageSkipWaiting();
  updateAvailable.value = false;
}

export async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (swRegistration.value) return swRegistration.value;
  if (!('serviceWorker' in navigator)) return null;
  return (await navigator.serviceWorker.getRegistration()) ?? null;
}
