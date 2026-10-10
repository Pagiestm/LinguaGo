<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppFooter from '@/shared/ui/AppFooter.vue';
import AppLogo from '@/shared/ui/AppLogo.vue';
import { useSessionStore } from '@/shared/stores/session';

const session = useSessionStore();

const sections = [
  { label: 'Niveaux', to: '/#niveaux', icon: 'i-lucide-layers' },
  { label: 'Fonctionnement', to: '/#fonctionnement', icon: 'i-lucide-route' },
  { label: 'Hors ligne', to: '/#hors-ligne', icon: 'i-lucide-wifi-off' },
];

const mobileItems = computed(() => [
  sections,
  session.isAuthenticated
    ? [{ label: 'Mon espace', to: '/dashboard', icon: 'i-lucide-layout-dashboard' }]
    : [
        { label: 'Connexion', to: '/login', icon: 'i-lucide-log-in' },
        { label: 'Créer un compte', to: '/register', icon: 'i-lucide-sparkles' },
      ],
]);
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="sticky top-0 z-40 border-b-2 border-default bg-default/85 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <RouterLink to="/" aria-label="Accueil LinguaGo"><AppLogo /></RouterLink>
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
              class="btn-pop hidden font-extrabold sm:inline-flex"
              >Mon espace</UButton
            >
          </template>
          <template v-else>
            <UButton
              to="/login"
              variant="ghost"
              color="neutral"
              class="hidden font-bold sm:inline-flex"
              >Connexion</UButton
            >
            <UButton to="/register" class="btn-pop hidden font-extrabold sm:inline-flex"
              >Commencer</UButton
            >
          </template>
          <UDropdownMenu :items="mobileItems" :content="{ align: 'end' }" class="md:hidden">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-menu"
              aria-label="Ouvrir le menu"
              class="md:hidden"
            />
          </UDropdownMenu>
        </div>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
