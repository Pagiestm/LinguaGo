<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import USelect from '@nuxt/ui/components/Select.vue';
import USwitch from '@nuxt/ui/components/Switch.vue';
import { useToast } from '@nuxt/ui/composables';
import { useQuery, useQueryCache } from '@pinia/colada';
import { computed, ref, watch } from 'vue';
import { notifications } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import { keys } from '@/shared/composables/useQueries';
import { usePush } from '@/shared/composables/usePush';
import { formatDateTime } from '@/shared/lib/format';
import SettingsCard from './SettingsCard.vue';

const toast = useToast();
const cache = useQueryCache();
const push = usePush();
const { data: settings, status } = useQuery({ key: keys.notification, query: notifications.get });
const { data: key } = useQuery({
  key: ['push', 'key'],
  query: notifications.publicKey,
  staleTime: Infinity,
});

const serverReady = computed(() => key.value === undefined || key.value.publicKey !== null);
const enabled = ref(false);
const time = ref('17:00');
const frequencyDays = ref(1);
const saving = ref(false);
const testing = ref(false);

watch(
  settings,
  (value) => {
    enabled.value = value?.enabled ?? false;
    time.value = value?.time ?? '17:00';
    frequencyDays.value = value?.frequencyDays ?? 1;
  },
  { immediate: true },
);

const frequencies = [
  { label: 'Tous les jours', value: 1 },
  { label: 'Tous les deux jours', value: 2 },
  { label: 'Tous les trois jours', value: 3 },
  { label: 'Deux fois par semaine', value: 4 },
  { label: 'Une fois par semaine', value: 7 },
];

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

async function toggle(value: boolean) {
  enabled.value = value;
  saving.value = true;
  try {
    if (value) {
      const subscription = await push.subscribe();
      if (!subscription) {
        enabled.value = false;
        toast.add({
          title: 'Notifications refusées',
          description:
            'Autorisez les notifications dans votre navigateur pour recevoir des rappels.',
          color: 'warning',
          icon: 'i-lucide-bell-off',
        });
        return;
      }
      await notifications.upsert({
        subscription,
        enabled: true,
        time: time.value,
        frequencyDays: frequencyDays.value,
        timeZone,
      });
    } else if (settings.value) {
      await notifications.update({ enabled: false });
    }
    await cache.invalidateQueries({ key: keys.notification });
    toast.add({
      title: value ? 'Rappels activés' : 'Rappels désactivés',
      icon: value ? 'i-lucide-bell-ring' : 'i-lucide-bell-off',
      color: 'success',
    });
  } catch (error) {
    enabled.value = !value;
    toast.add({
      title: error instanceof ApiError ? error.message : 'Modification impossible',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    saving.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    await notifications.update({ time: time.value, frequencyDays: frequencyDays.value, timeZone });
    await cache.invalidateQueries({ key: keys.notification });
    toast.add({ title: 'Rappel mis à jour', icon: 'i-lucide-circle-check', color: 'success' });
  } catch (error) {
    toast.add({
      title: error instanceof ApiError ? error.message : 'Modification impossible',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    saving.value = false;
  }
}

async function sendTest() {
  testing.value = true;
  try {
    await notifications.test();
    toast.add({
      title: 'Notification envoyée',
      description: 'Elle devrait apparaître dans quelques secondes.',
      icon: 'i-lucide-send',
      color: 'success',
    });
  } catch (error) {
    toast.add({
      title: error instanceof ApiError ? error.message : 'Envoi impossible',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    testing.value = false;
  }
}
</script>

<template>
  <SettingsCard
    title="Rappels"
    description="Une notification sur cet appareil pour penser à pratiquer."
  >
    <UAlert
      v-if="push.state.value === 'unsupported'"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="Notifications non prises en charge"
      description="Installez LinguaGo sur l'écran d'accueil ou utilisez un navigateur compatible avec les notifications push."
    />
    <UAlert
      v-else-if="!serverReady"
      color="neutral"
      variant="subtle"
      icon="i-lucide-info"
      title="Rappels indisponibles"
      description="Le serveur n'est pas configuré pour envoyer des notifications."
    />
    <UAlert
      v-else-if="push.state.value === 'denied'"
      color="warning"
      variant="subtle"
      icon="i-lucide-bell-off"
      title="Notifications bloquées"
      description="Vous avez refusé les notifications pour ce site. Réautorisez-les dans les réglages du navigateur."
    />
    <div v-else class="space-y-6">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="font-medium">Recevoir des rappels</p>
          <p v-if="settings?.enabled && settings.nextNotifyAt" class="text-sm text-muted">
            Prochain rappel : {{ formatDateTime(settings.nextNotifyAt) }}
          </p>
          <p v-else class="text-sm text-muted">Désactivé</p>
        </div>
        <USwitch
          :model-value="enabled"
          :disabled="saving || status === 'pending'"
          aria-label="Activer les rappels"
          @update:model-value="toggle"
        />
      </div>
      <form v-if="enabled" class="grid gap-4 sm:grid-cols-2" @submit.prevent="save">
        <UFormField label="Heure" name="time">
          <UInput v-model="time" type="time" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Fréquence" name="frequency">
          <USelect v-model="frequencyDays" :items="frequencies" size="lg" class="w-full" />
        </UFormField>
        <div class="flex flex-wrap gap-2 sm:col-span-2">
          <UButton type="submit" class="btn-pop font-extrabold" :loading="saving"
            >Enregistrer</UButton
          >
          <UButton
            variant="outline"
            color="neutral"
            icon="i-lucide-send"
            class="btn-pop btn-pop-neutral font-extrabold"
            :loading="testing"
            @click="sendTest"
            >Envoyer un test</UButton
          >
        </div>
      </form>
    </div>
  </SettingsCard>
</template>
