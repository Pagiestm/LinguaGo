<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import MascotSays from '@/shared/ui/MascotSays.vue';
import { useInstallPrompt } from './install';

const { suggested, canInstall, install, dismiss } = useInstallPrompt();

async function run() {
  const outcome = await install();
  if (outcome === 'dismissed') dismiss();
}
</script>

<template>
  <div
    v-if="suggested"
    class="motion-safe:animate-pop flex flex-col gap-4 rounded-2xl border-2 border-primary/30 p-4 sm:flex-row sm:items-center sm:justify-between bg-blue-950/30"
  >
    <MascotSays expression="wave" size="sm"
      >Garde-moi sous la main : installe LinguaGo sur ton appareil.</MascotSays
    >
    <div class="flex shrink-0 gap-2 self-end sm:self-auto">
      <UButton variant="ghost" color="neutral" class="font-bold" @click="dismiss"
        >Plus tard</UButton
      >
      <UButton
        v-if="canInstall"
        icon="i-lucide-download"
        class="btn-pop font-extrabold"
        @click="run"
        >Installer</UButton
      >
      <UButton v-else to="/dashboard/settings" icon="i-lucide-info" class="btn-pop font-extrabold"
        >Comment faire</UButton
      >
    </div>
  </div>
</template>
