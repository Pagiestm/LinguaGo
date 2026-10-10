<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { ref } from 'vue';
import { account } from '@/shared/api/endpoints';
import { useSessionStore } from '@/shared/stores/session';
import AppMascot from '@/shared/ui/AppMascot.vue';

const session = useSessionStore();
const loading = ref(false);

async function dismiss() {
  loading.value = true;
  try {
    session.setUser(await account.completeFirstLogin());
  } catch {
    if (session.user) session.setUser({ ...session.user, firstLogin: false });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section
    class="mb-6 rounded-2xl border-2 border-primary/30 p-5 bg-blue-950/30"
    aria-labelledby="onboarding-title"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <AppMascot expression="wave" animated class="size-20 shrink-0" />
        <div>
          <h2 id="onboarding-title" class="text-lg">Bienvenue sur LinguaGo</h2>
          <p class="mt-1 text-sm text-muted">
            Commencez par une série du niveau A1, ajoutez vos séries préférées en favoris pour les
            garder hors connexion, et activez un rappel depuis votre compte.
          </p>
        </div>
      </div>
      <div class="flex shrink-0 gap-2">
        <UButton to="/dashboard/learn" icon="i-lucide-play" class="btn-pop font-extrabold"
          >Première série</UButton
        >
        <UButton
          variant="ghost"
          color="neutral"
          :loading="loading"
          class="font-bold"
          @click="dismiss"
          >Compris</UButton
        >
      </div>
    </div>
  </section>
</template>
