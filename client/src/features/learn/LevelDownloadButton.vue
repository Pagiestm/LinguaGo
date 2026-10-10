<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { toRef } from 'vue';
import type { LevelCode, SeriesType } from '@/shared/api/types';
import { useLevelDownload } from '@/shared/composables/useLevelDownload';
import { useNetworkStore } from '@/shared/stores/network';

const props = defineProps<{ level: LevelCode; type: SeriesType }>();
const network = useNetworkStore();
const { downloaded, busy, progress, download, remove } = useLevelDownload(
  toRef(props, 'level'),
  toRef(props, 'type'),
);
</script>

<template>
  <UButton
    v-if="downloaded"
    variant="soft"
    color="success"
    icon="i-lucide-circle-check"
    :loading="busy"
    class="font-extrabold"
    :title="`Enregistré sur cet appareil, ${downloaded.count} séries. Cliquer pour retirer.`"
    @click="remove"
    >Disponible hors ligne</UButton
  >
  <UButton
    v-else
    variant="outline"
    color="neutral"
    icon="i-lucide-download"
    :loading="busy"
    :disabled="network.offline"
    class="btn-pop btn-pop-neutral font-extrabold"
    @click="download"
  >
    <template v-if="progress">{{ progress.done }} / {{ progress.total }}</template>
    <template v-else>Télécharger le niveau</template>
  </UButton>
</template>
