/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import type { SeriesDetail } from '../shared/api/types';
import {
  BACKGROUND_SYNC_TAG,
  cacheFavorites,
  pendingActions,
  removePending,
} from '../shared/offline/db';

declare let self: ServiceWorkerGlobalScope;

interface SyncEventLike extends ExtendableEvent {
  tag: string;
}

interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

const API = '/api';
const REFRESH_TAG = 'linguago-refresh';

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist: [/^\/api\//, /^\/docs/] }),
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.pathname.startsWith('/api/') &&
    /^\/api\/(levels|series\/\d+|me\/(favorites|stats|activity|completed-series)|leaderboard|avatars)/.test(
      url.pathname,
    ),
  new NetworkFirst({
    cacheName: 'linguago-api',
    networkTimeoutSeconds: 4,
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 })],
  }),
);

registerRoute(
  ({ request }) => request.destination === 'font' || request.destination === 'image',
  new CacheFirst({
    cacheName: 'linguago-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 })],
  }),
);

async function broadcast(message: { type: string; count?: number }) {
  const windows = await self.clients.matchAll({ type: 'window' });
  for (const client of windows) client.postMessage(message);
}

async function replayQueue() {
  const entries = await pendingActions();
  let synced = 0;
  for (const { key, action } of entries) {
    const url =
      action.kind === 'answer'
        ? `${API}/exercises/${action.exerciseId}/answer`
        : `${API}/series/${action.seriesId}/time`;
    const body = action.kind === 'answer' ? { answer: action.answer } : { seconds: action.seconds };
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const rejected = response.status >= 400 && response.status < 500 && response.status !== 401;
    if (!response.ok && !rejected)
      throw new Error(`Synchronisation à reprendre (${response.status})`);
    await removePending(key);
    if (response.ok) synced += 1;
  }
  if (synced > 0) await broadcast({ type: 'queue-synced', count: synced });
}

async function refreshFavorites() {
  const response = await fetch(`${API}/me/favorites`, { credentials: 'include' });
  if (!response.ok) return;
  await cacheFavorites((await response.json()) as SeriesDetail[]);
  await broadcast({ type: 'favorites-refreshed' });
}

self.addEventListener('sync', ((event: SyncEventLike) => {
  if (event.tag === BACKGROUND_SYNC_TAG) event.waitUntil(replayQueue());
}) as EventListener);

self.addEventListener('periodicsync', ((event: SyncEventLike) => {
  if (event.tag === REFRESH_TAG) event.waitUntil(refreshFavorites());
}) as EventListener);

self.addEventListener('push', (event) => {
  const payload = (event.data?.json() ?? {}) as PushPayload;
  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'LinguaGo', {
      body: payload.body ?? "C'est l'heure de pratiquer votre anglais.",
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      data: { url: payload.url ?? '/dashboard' },
      tag: payload.tag ?? 'linguago-reminder',
      actions: payload.actions ?? [],
    } as NotificationOptions),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'snooze') {
    event.waitUntil(
      fetch(`${API}/me/notification/snooze`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }).catch(() => undefined),
    );
    return;
  }
  const data = event.notification.data as { url?: string } | undefined;
  const path = event.action === 'start' ? '/dashboard/learn' : (data?.url ?? '/dashboard');
  const target = new URL(path, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
      const existing = windows.find((w) => w.url.startsWith(self.location.origin));
      if (existing) {
        await existing.focus();
        await existing.navigate(target);
        return;
      }
      await self.clients.openWindow(target);
    }),
  );
});

self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | null)?.type === 'SKIP_WAITING') void self.skipWaiting();
});

clientsClaim();
