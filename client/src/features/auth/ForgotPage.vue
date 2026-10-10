<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { auth } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import AuthShell from './AuthShell.vue';

const email = ref('');
const sent = ref(false);
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.forgot(email.value.trim());
    sent.value = true;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Envoi impossible';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell
    title="Mot de passe oublié"
    subtitle="Indiquez votre email : vous recevrez un lien valable une heure."
    tip="Ça arrive à tout le monde. Je vous envoie un lien tout de suite."
    expression="think"
  >
    <UAlert
      v-if="sent"
      color="success"
      variant="subtle"
      icon="i-lucide-mail-check"
      title="Email envoyé"
      description="Si un compte existe avec cette adresse, le lien de réinitialisation est en route. Pensez aux courriers indésirables."
    />
    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-x" :title="error" />
      <UFormField label="Email" name="email" required>
        <UInput
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="vous@exemple.fr"
          size="lg"
          class="w-full"
          required
        />
      </UFormField>
      <UButton
        type="submit"
        size="lg"
        block
        class="btn-pop font-extrabold"
        :loading="loading"
        :disabled="!email"
        >Envoyer le lien</UButton
      >
    </form>
    <template #footer>
      <RouterLink to="/login" class="font-extrabold text-primary hover:underline"
        >Retour à la connexion</RouterLink
      >
    </template>
  </AuthShell>
</template>
