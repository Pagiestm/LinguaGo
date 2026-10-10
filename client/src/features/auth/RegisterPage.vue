<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ApiError } from '@/shared/api/http';
import { useSessionStore } from '@/shared/stores/session';
import AuthShell from './AuthShell.vue';
import PasswordField from './PasswordField.vue';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const session = useSessionStore();
const router = useRouter();

const pseudo = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const valid = computed(
  () =>
    pseudo.value.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
    PASSWORD_RULE.test(password.value),
);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await session.register(pseudo.value.trim(), email.value.trim(), password.value);
    await router.push('/dashboard');
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Inscription impossible';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell
    title="Créer un compte"
    subtitle="Gratuit, sans carte bancaire. Vous commencez au niveau A1."
    tip="Moi c'est Lingo ! Je vous accompagne du niveau A1 au niveau C1."
    expression="cheer"
  >
    <form class="space-y-5" novalidate @submit.prevent="submit">
      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-x" :title="error" />
      <UFormField
        label="Pseudo"
        name="pseudo"
        help="Visible dans le classement de la semaine."
        required
      >
        <UInput
          id="pseudo"
          v-model="pseudo"
          autocomplete="nickname"
          placeholder="Camille"
          size="lg"
          class="w-full"
          maxlength="40"
          required
        />
      </UFormField>
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
      <UFormField label="Mot de passe" name="password" required>
        <PasswordField id="password" v-model="password" autocomplete="new-password" show-rules />
      </UFormField>
      <UButton
        type="submit"
        size="lg"
        block
        class="btn-pop font-extrabold"
        :loading="loading"
        :disabled="!valid"
        >Créer mon compte</UButton
      >
    </form>
    <template #footer>
      Déjà inscrit ?
      <RouterLink to="/login" class="font-extrabold text-primary hover:underline"
        >Se connecter</RouterLink
      >
    </template>
  </AuthShell>
</template>
