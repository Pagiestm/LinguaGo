<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { useToast } from '@nuxt/ui/composables';
import { ref } from 'vue';
import { account } from '@/shared/api/endpoints';
import SettingsCard from './SettingsCard.vue';

const toast = useToast();
const busy = ref(false);

async function download() {
  busy.value = true;
  try {
    const response = await fetch(account.exportUrl(), { credentials: 'include' });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `linguago-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.add({
      title: 'Export impossible pour le moment',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <SettingsCard
    title="Mes données"
    description="Un fichier JSON avec votre profil, vos statistiques, vos exercices réussis, vos favoris, vos révisions et vos succès."
  >
    <UButton
      variant="outline"
      color="neutral"
      icon="i-lucide-download"
      :loading="busy"
      class="btn-pop btn-pop-neutral font-extrabold"
      @click="download"
      >Télécharger mes données</UButton
    >
  </SettingsCard>
</template>
