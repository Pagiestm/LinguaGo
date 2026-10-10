<script setup lang="ts">
import UAlert from '@nuxt/ui/components/Alert.vue';
import UButton from '@nuxt/ui/components/Button.vue';
import UFormField from '@nuxt/ui/components/FormField.vue';
import UInput from '@nuxt/ui/components/Input.vue';
import { useQuery } from '@pinia/colada';
import { ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { auth } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import { useSessionStore } from '@/shared/stores/session';
import AuthShell from './AuthShell.vue';
import PasswordField from './PasswordField.vue';

const session = useSessionStore();
const router = useRouter();
const route = useRoute();
const { data: providers } = useQuery({
  key: ['auth', 'providers'],
  query: auth.providers,
  staleTime: Infinity,
});

const email = ref('');
const password = ref('');
const error = ref(route.query.error === 'google' ? 'La connexion avec Google a échoué.' : '');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await session.login(email.value, password.value);
    const next = typeof route.query.next === 'string' ? route.query.next : '/dashboard';
    await router.push(next);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Connexion impossible';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthShell
    title="Content de vous revoir"
    subtitle="Connectez-vous pour reprendre votre progression."
    tip="Re-bonjour ! On reprend là où vous vous étiez arrêté ?"
    expression="wave"
  >
    <form class="space-y-5" novalidate @submit.prevent="submit">
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
      <UFormField label="Mot de passe" name="password" required>
        <PasswordField id="password" v-model="password" />
        <template #hint>
          <RouterLink to="/forgot" class="text-xs font-bold text-primary hover:underline"
            >Mot de passe oublié ?</RouterLink
          >
        </template>
      </UFormField>
      <UButton
        type="submit"
        size="lg"
        block
        class="btn-pop font-extrabold"
        :loading="loading"
        :disabled="!email || !password"
        >Se connecter</UButton
      >
      <template v-if="providers?.google">
        <div class="flex items-center gap-3 text-xs font-bold uppercase text-muted">
          <span class="h-0.5 flex-1 bg-elevated" aria-hidden="true" />ou<span
            class="h-0.5 flex-1 bg-elevated"
            aria-hidden="true"
          />
        </div>
        <UButton
          :to="auth.googleUrl()"
          external
          variant="outline"
          color="neutral"
          size="lg"
          block
          class="btn-pop btn-pop-neutral font-extrabold"
        >
          <svg viewBox="0 0 24 24" class="size-5" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.2 21.3 7.3 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.2C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l4.1-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4.1 3.1c.9-2.9 3.6-4.9 6.7-4.9z"
            />
          </svg>
          Continuer avec Google
        </UButton>
      </template>
    </form>
    <template #footer>
      Pas encore de compte ?
      <RouterLink to="/register" class="font-extrabold text-primary hover:underline"
        >Créer un compte</RouterLink
      >
    </template>
  </AuthShell>
</template>
