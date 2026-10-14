import { fileURLToPath } from 'node:url';
import ui from '@nuxt/ui/vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { uiConfig } from './ui.config.ts';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  const apiTarget = env.API_URL || `http://localhost:${env.PORT || 3000}`;
  return {
    plugins: [
      vue(),
      ui({
        ui: uiConfig,
        autoImport: false,
        components: false,
        colorMode: false,
        icon: { clientBundle: { scan: { globInclude: ['src/**/*.{vue,ts}'], globExclude: [] } } },
      }),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src/pwa',
        filename: 'service-worker.ts',
        registerType: 'autoUpdate',
        injectRegister: false,
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
          globIgnores: ['**/screenshots/**'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
        manifest: {
          id: '/',
          name: 'LinguaGo',
          short_name: 'LinguaGo',
          description: "Apprenez l'anglais à votre rythme : exercices, prononciation, progression.",
          lang: 'fr',
          categories: ['education'],
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          scope: '/',
          start_url: '/dashboard',
          icons: [
            { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'Continuer à apprendre',
              short_name: 'Apprendre',
              url: '/dashboard/learn',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Mes favoris',
              short_name: 'Favoris',
              url: '/dashboard/favorites',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
              name: 'Parler',
              short_name: 'Parler',
              url: '/dashboard/learn?mode=talk',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
            },
          ],
          screenshots: [
            {
              src: '/screenshots/session-desktop.png',
              sizes: '1440x900',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Une série d’exercices sur ordinateur',
            },
            {
              src: '/screenshots/session-mobile.png',
              sizes: '780x1688',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Une série d’exercices sur mobile',
            },
          ],
        },
        devOptions: { enabled: true, type: 'module', navigateFallback: 'index.html' },
      }),
    ],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    envDir: rootDir,
    server: {
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      watch: env.VITE_USE_POLLING === 'true' ? { usePolling: true } : undefined,
    },
    preview: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      include: ['src/**/*.spec.ts'],
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
