import { computed, ref } from 'vue';
import { notifications } from '@/shared/api/endpoints';
import { getRegistration } from '@/pwa/register';

export type PushState = 'unsupported' | 'denied' | 'ready';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export function usePush() {
  const permission = ref<NotificationPermission>(
    typeof Notification === 'undefined' ? 'denied' : Notification.permission,
  );
  const supported =
    typeof window !== 'undefined' && 'PushManager' in window && 'Notification' in window;

  const state = computed<PushState>(() => {
    if (!supported) return 'unsupported';
    if (permission.value === 'denied') return 'denied';
    return 'ready';
  });

  async function subscribe(): Promise<PushSubscriptionJSON | null> {
    if (!supported) return null;
    permission.value = await Notification.requestPermission();
    if (permission.value !== 'granted') return null;

    const registration = await getRegistration();
    if (!registration) return null;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const { publicKey } = await notifications.publicKey();
      if (!publicKey) return null;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }
    return subscription.toJSON();
  }

  async function unsubscribe() {
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  }

  return { supported, state, permission, subscribe, unsubscribe };
}
