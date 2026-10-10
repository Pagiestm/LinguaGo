<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import UModal from '@nuxt/ui/components/Modal.vue';
import { useToast } from '@nuxt/ui/composables';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { account } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import { clearOfflineData } from '@/shared/offline/db';
import { useSessionStore } from '@/shared/stores/session';
import SettingsCard from './SettingsCard.vue';

const session = useSessionStore();
const router = useRouter();
const toast = useToast();
const open = ref(false);
const confirmation = ref('');
const deleting = ref(false);

async function remove() {
  deleting.value = true;
  try {
    await account.remove();
    session.setUser(null);
    await clearOfflineData();
    open.value = false;
    await router.push('/');
    toast.add({
      title: 'Compte supprimé',
      description: 'Toutes vos données ont été effacées.',
      icon: 'i-lucide-circle-check',
    });
  } catch (error) {
    toast.add({
      title: error instanceof ApiError ? error.message : 'Suppression impossible',
      color: 'error',
      icon: 'i-lucide-circle-x',
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <SettingsCard
    title="Supprimer mon compte"
    description="Vos exercices, favoris, statistiques et rappels seront définitivement effacés."
    danger
  >
    <UButton
      color="error"
      icon="i-lucide-trash-2"
      class="btn-pop btn-pop-error font-extrabold"
      @click="open = true"
      >Supprimer mon compte</UButton
    >
    <UModal
      v-model:open="open"
      title="Supprimer définitivement ?"
      description="Cette action est irréversible. Tapez SUPPRIMER pour confirmer."
    >
      <template #body>
        <UInput
          v-model="confirmation"
          placeholder="SUPPRIMER"
          size="lg"
          class="w-full"
          aria-label="Confirmation"
        />
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton variant="ghost" color="neutral" class="font-bold" @click="open = false"
            >Annuler</UButton
          >
          <UButton
            color="error"
            class="btn-pop btn-pop-error font-extrabold"
            :disabled="confirmation !== 'SUPPRIMER'"
            :loading="deleting"
            @click="remove"
            >Supprimer</UButton
          >
        </div>
      </template>
    </UModal>
  </SettingsCard>
</template>
