import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#dbeafe' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#dbeafe' } },
  },
  images: ['public/logo.svg'],
});
