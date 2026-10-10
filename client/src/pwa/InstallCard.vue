<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { useToast } from '@nuxt/ui/composables';
import SettingsCard from '@/features/account/SettingsCard.vue';
import AppMascot from '@/shared/ui/AppMascot.vue';
import { useInstallPrompt } from './install';

const toast = useToast();
const { installed, canInstall, isIOS, install } = useInstallPrompt();

async function run() {
  const outcome = await install();
  if (outcome === 'accepted') {
    toast.add({
      title: 'LinguaGo est installée',
      description: 'Retrouvez-la sur votre écran d’accueil ou votre bureau.',
      icon: 'i-lucide-party-popper',
      color: 'success',
    });
  }
}
</script>

<template>
  <SettingsCard
    title="Installer l'application"
    description="Une icône sur l'écran d'accueil, un démarrage instantané et le hors connexion complet."
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <AppMascot :expression="installed ? 'cheer' : 'wave'" class="size-16 shrink-0" />
      <div class="flex-1 text-sm">
        <template v-if="installed">
          <p class="font-extrabold">LinguaGo est installée sur cet appareil.</p>
          <p class="mt-1 text-muted">
            Lancez-la depuis son icône : elle s'ouvre sans la barre du navigateur.
          </p>
        </template>
        <template v-else-if="canInstall">
          <p class="font-extrabold">Prête à être installée.</p>
          <p class="mt-1 text-muted">Un clic suffit, aucun magasin d'applications.</p>
        </template>
        <template v-else-if="isIOS">
          <p class="font-extrabold">Sur iPhone et iPad</p>
          <ol class="mt-1 list-inside list-decimal space-y-1 text-muted">
            <li>Ouvrez LinguaGo dans Safari.</li>
            <li>
              Touchez <span class="i-lucide-share size-4 align-[-3px]" aria-hidden="true" />
              Partager.
            </li>
            <li>Choisissez « Sur l'écran d'accueil ».</li>
          </ol>
        </template>
        <template v-else>
          <p class="font-extrabold">Installation non proposée ici</p>
          <p class="mt-1 text-muted">
            Ouvrez LinguaGo dans Chrome, Edge ou Safari : le navigateur proposera de l'installer.
          </p>
        </template>
      </div>
      <UButton
        v-if="canInstall"
        icon="i-lucide-download"
        size="lg"
        class="btn-pop shrink-0 font-extrabold"
        @click="run"
        >Installer LinguaGo</UButton
      >
    </div>
  </SettingsCard>
</template>
