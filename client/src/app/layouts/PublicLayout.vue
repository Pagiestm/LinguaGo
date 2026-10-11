<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AppFooter from '@/shared/ui/AppFooter.vue';
import AppLogo from '@/shared/ui/AppLogo.vue';
import MascotSays from '@/shared/ui/MascotSays.vue';
import MobileDrawer from '@/shared/ui/MobileDrawer.vue';
import { useSessionStore } from '@/shared/stores/session';

const session = useSessionStore();
const route = useRoute();
const menuOpen = ref(false);

const sections = [
  { label: 'Niveaux', to: '/#niveaux', icon: 'i-lucide-layers' },
  { label: 'Fonctionnement', to: '/#fonctionnement', icon: 'i-lucide-route' },
  { label: 'Hors ligne', to: '/#hors-ligne', icon: 'i-lucide-wifi-off' },
];

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
);
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="sticky top-0 z-40 border-b-2 border-default bg-default/85 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div class="flex items-center gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-menu"
            aria-label="Ouvrir le menu"
            aria-haspopup="dialog"
            :aria-expanded="menuOpen"
            class="md:hidden"
            @click="menuOpen = true"
          />
          <RouterLink to="/" aria-label="Accueil LinguaGo"><AppLogo /></RouterLink>
        </div>
        <nav
          class="hidden items-center gap-1 text-sm font-bold text-muted md:flex"
          aria-label="Navigation principale"
        >
          <RouterLink
            v-for="section in sections"
            :key="section.to"
            :to="section.to"
            class="rounded-full px-3 py-1.5 hover:bg-elevated hover:text-default"
            >{{ section.label }}</RouterLink
          >
        </nav>
        <div class="flex items-center gap-2">
          <template v-if="session.isAuthenticated">
            <UButton
              to="/dashboard"
              icon="i-lucide-layout-dashboard"
              class="btn-pop hidden font-extrabold md:inline-flex"
              >Mon espace</UButton
            >
          </template>
          <template v-else>
            <UButton
              to="/login"
              variant="ghost"
              color="neutral"
              class="hidden font-bold md:inline-flex"
              >Connexion</UButton
            >
            <UButton to="/register" class="btn-pop hidden font-extrabold md:inline-flex"
              >Commencer</UButton
            >
          </template>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />

    <MobileDrawer v-model:open="menuOpen" hide-from="md" label="Menu principal">
      <nav class="flex flex-col gap-1.5 px-3 py-2" aria-label="Navigation mobile">
        <RouterLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          class="flex items-center gap-3 rounded-full px-4 py-3 text-base font-extrabold text-muted transition hover:bg-elevated hover:text-default"
          @click="menuOpen = false"
        >
          <span :class="section.icon" class="size-5 text-primary" aria-hidden="true" />
          {{ section.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto space-y-4 p-4">
        <MascotSays expression="wave" size="sm">Dix minutes par jour, même sans réseau.</MascotSays>
        <template v-if="session.isAuthenticated">
          <UButton
            to="/dashboard"
            icon="i-lucide-layout-dashboard"
            size="lg"
            block
            class="btn-pop font-extrabold"
            >Mon espace</UButton
          >
        </template>
        <template v-else>
          <UButton to="/register" size="lg" block class="btn-pop font-extrabold"
            >Créer un compte</UButton
          >
          <UButton
            to="/login"
            variant="outline"
            color="neutral"
            size="lg"
            block
            class="btn-pop btn-pop-neutral font-extrabold"
            >Se connecter</UButton
          >
        </template>
      </div>
    </MobileDrawer>
  </div>
</template>
