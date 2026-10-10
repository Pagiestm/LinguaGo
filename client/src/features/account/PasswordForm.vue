<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import { useToast } from '@nuxt/ui/composables';
import { computed, ref } from 'vue';
import PasswordField from '@/features/auth/PasswordField.vue';
import { account } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import SettingsCard from './SettingsCard.vue';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const toast = useToast();
const current = ref('');
const next = ref('');
const saving = ref(false);
const valid = computed(() => current.value.length > 0 && PASSWORD_RULE.test(next.value));

async function save() {
  saving.value = true;
  try {
    await account.changePassword(current.value, next.value);
    current.value = '';
    next.value = '';
    toast.add({ title: 'Mot de passe modifié', icon: 'i-lucide-circle-check', color: 'success' });
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
</script>

<template>
  <SettingsCard
    title="Mot de passe"
    description="Au moins dix caractères, une majuscule, un chiffre et un caractère spécial."
  >
    <form class="space-y-5 sm:max-w-sm" @submit.prevent="save">
      <UFormField label="Mot de passe actuel" name="current" required>
        <PasswordField id="current-password" v-model="current" autocomplete="current-password" />
      </UFormField>
      <UFormField label="Nouveau mot de passe" name="next" required>
        <PasswordField id="new-password" v-model="next" autocomplete="new-password" show-rules />
      </UFormField>
      <UButton type="submit" class="btn-pop font-extrabold" :loading="saving" :disabled="!valid"
        >Changer le mot de passe</UButton
      >
    </form>
  </SettingsCard>
</template>
