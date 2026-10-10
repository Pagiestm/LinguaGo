import ui from '@nuxt/ui/vue-plugin';
import { PiniaColada } from '@pinia/colada';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './app/App.vue';
import { router } from './app/router';
import './assets/css/main.css';
import { setupInstallPrompt } from './pwa/install';
import { registerServiceWorker } from './pwa/register';
import { startOfflineSync } from './shared/offline/sync';
import { useSessionStore } from './shared/stores/session';

setupInstallPrompt();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(PiniaColada);
app.use(ui);

const session = useSessionStore(pinia);
await session.bootstrap();

app.use(router);

app.mount('#app');

registerServiceWorker();
startOfflineSync();
void navigator.storage?.persist?.();
