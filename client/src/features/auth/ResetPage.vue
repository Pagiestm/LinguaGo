<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { auth } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import AuthShell from './AuthShell.vue';
import PasswordField from './PasswordField.vue';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const route = useRoute();
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''));
const password = ref('');
const done = ref(false);
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.reset(token.value, password.value);
    done.value = true;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Réinitialisation impossible';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell
    title="Nouveau mot de passe"
    subtitle="Choisissez-en un que vous retiendrez."
    tip="Un nouveau mot de passe, et c'est reparti pour les exercices !"
    expression="happy"
  >
    <UAlert
      v-if="!token"
      color="error"
      variant="subtle"
      icon="i-lucide-link-2-off"
      title="Lien incomplet"
      description="Ouvrez le lien reçu par email, ou demandez-en un nouveau."
    />
    <UAlert
      v-else-if="done"
      color="success"
      variant="subtle"
      icon="i-lucide-circle-check"
      title="Mot de passe modifié"
      description="Vous pouvez vous connecter avec votre nouveau mot de passe."
    />
    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-x" :title="error" />
      <UFormField label="Nouveau mot de passe" name="password" required>
        <PasswordField id="password" v-model="password" autocomplete="new-password" show-rules />
      </UFormField>
      <UButton
        type="submit"
        size="lg"
        block
        class="btn-pop font-extrabold"
        :loading="loading"
        :disabled="!PASSWORD_RULE.test(password)"
        >Enregistrer</UButton
      >
    </form>
    <template #footer>
      <RouterLink to="/login" class="font-extrabold text-primary hover:underline"
        >Retour à la connexion</RouterLink
      >
    </template>
  </AuthShell>
</template>
