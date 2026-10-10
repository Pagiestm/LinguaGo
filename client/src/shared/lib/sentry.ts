import type { App } from 'vue';
import type { Router } from 'vue-router';

export async function setupSentry(app: App, router: Router) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import('@sentry/vue');
  Sentry.init({
    app,
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
  });
}
