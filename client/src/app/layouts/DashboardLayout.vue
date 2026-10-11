<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import UDropdownMenu from '@nuxt/ui/components/DropdownMenu.vue';
import { computed, ref, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import AppLogo from '@/shared/ui/AppLogo.vue';
import AvatarImage from '@/shared/ui/AvatarImage.vue';
import LevelBadge from '@/shared/ui/LevelBadge.vue';
import LevelCard from '@/shared/ui/LevelCard.vue';
import MobileDrawer from '@/shared/ui/MobileDrawer.vue';
import { useSessionStore } from '@/shared/stores/session';
import { useAppBadge } from '@/shared/composables/useAppBadge';
import { useLevelUp } from '@/shared/composables/useLevelUp';
import { useStats } from '@/shared/composables/useQueries';

const session = useSessionStore();
const route = useRoute();
const router = useRouter();
const { data: stats } = useStats();
useAppBadge();
useLevelUp();
const menuOpen = ref(false);

const links = computed(() => [
  { label: 'Tableau de bord', icon: 'i-lucide-layout-dashboard', to: '/dashboard', exact: true },
  { label: 'Apprendre', icon: 'i-lucide-graduation-cap', to: '/dashboard/learn' },
  { label: 'Révision', icon: 'i-lucide-rotate-ccw', to: '/dashboard/review' },
  { label: 'Favoris', icon: 'i-lucide-heart', to: '/dashboard/favorites' },
  { label: 'Mon compte', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  ...(session.isAdmin
    ? [{ label: 'Administration', icon: 'i-lucide-shield', to: '/dashboard/admin' }]
    : []),
]);

const isActive = (link: { to: string; exact?: boolean }) =>
  link.exact ? route.path === link.to : route.path.startsWith(link.to);

watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
);

async function logout() {
  menuOpen.value = false;
  await session.logout();
  await router.push('/');
}

const accountItems = computed(() => [
  [{ label: session.user?.pseudo ?? '', description: session.user?.email, type: 'label' as const }],
  [
    { label: 'Mon compte', icon: 'i-lucide-user', to: '/dashboard/settings' },
    { label: 'Favoris', icon: 'i-lucide-heart', to: '/dashboard/favorites' },
  ],
  [{ label: 'Se déconnecter', icon: 'i-lucide-log-out', onSelect: logout }],
]);
</script>

<template>
  <div class="flex min-h-dvh bg-default">
    <aside
      class="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r-2 border-default bg-blue-950/20 lg:flex"
    >
      <div class="flex h-16 items-center px-5">
        <RouterLink to="/" aria-label="Accueil LinguaGo"><AppLogo /></RouterLink>
      </div>
      <nav
        class="flex flex-1 flex-col gap-1.5 px-3 py-4"
        aria-label="Navigation du tableau de bord"
      >
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-extrabold transition"
          :class="
            isActive(link)
              ? 'bg-primary text-white shadow-[0_3px_0_0_color-mix(in_oklab,var(--ui-primary)_65%,black)]'
              : 'text-muted hover:bg-default hover:text-default'
          "
          :aria-current="isActive(link) ? 'page' : undefined"
        >
          <span :class="link.icon" class="size-5" aria-hidden="true" />
          {{ link.label }}
        </RouterLink>
      </nav>
      <LevelCard v-if="stats" :stats="stats" class="m-3" />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b-2 border-default bg-default/85 px-4 backdrop-blur sm:px-6"
      >
        <div class="flex items-center gap-2 lg:hidden">
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-menu"
            aria-label="Ouvrir le menu"
            aria-haspopup="dialog"
            :aria-expanded="menuOpen"
            @click="menuOpen = true"
          />
          <RouterLink to="/dashboard" aria-label="Tableau de bord"><AppLogo compact /></RouterLink>
        </div>
        <h2 class="hidden text-sm font-extrabold text-muted lg:block">{{ route.meta.title }}</h2>
        <div class="flex items-center gap-2 sm:gap-3">
          <RouterLink
            v-if="stats"
            to="/dashboard"
            class="flex items-center gap-2 rounded-full border-2 border-default px-1.5 py-1 pr-3 lg:hidden"
            :aria-label="`Niveau ${stats.level.current.code}, ${Math.round(stats.level.progress * 100)} % vers le suivant`"
          >
            <LevelBadge :code="stats.level.current.code" size="sm" />
            <span class="h-2 w-12 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
              <span
                class="block h-full rounded-full bg-secondary"
                :style="{ width: `${Math.max(6, Math.round(stats.level.progress * 100))}%` }"
              />
            </span>
          </RouterLink>
          <UDropdownMenu :items="accountItems" :content="{ align: 'end' }">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full p-1 hover:bg-elevated"
              aria-label="Menu du compte"
            >
              <AvatarImage
                :avatar="session.user?.avatar ?? null"
                :name="session.user?.pseudo ?? ''"
                size="sm"
              />
              <span class="hidden text-sm font-extrabold sm:block">{{ session.user?.pseudo }}</span>
              <span
                class="i-lucide-chevron-down hidden size-4 text-muted sm:block"
                aria-hidden="true"
              />
            </button>
          </UDropdownMenu>
        </div>
      </header>

      <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
          <RouterView />
        </div>
      </main>
    </div>

    <MobileDrawer v-model:open="menuOpen" hide-from="lg" label="Menu du tableau de bord">
      <nav class="flex flex-col gap-1.5 px-3 py-2" aria-label="Navigation mobile">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 rounded-full px-4 py-3 text-base font-extrabold transition"
          :class="
            isActive(link)
              ? 'bg-primary text-white shadow-[0_3px_0_0_color-mix(in_oklab,var(--ui-primary)_65%,black)]'
              : 'text-muted hover:bg-elevated hover:text-default'
          "
          :aria-current="isActive(link) ? 'page' : undefined"
        >
          <span :class="link.icon" class="size-5" aria-hidden="true" />
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto space-y-3 p-3">
        <LevelCard v-if="stats" :stats="stats" />
        <div class="flex items-center gap-3 px-1">
          <AvatarImage
            :avatar="session.user?.avatar ?? null"
            :name="session.user?.pseudo ?? ''"
            size="sm"
          />
          <p class="min-w-0 flex-1 truncate text-sm font-extrabold">{{ session.user?.pseudo }}</p>
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-log-out"
            aria-label="Se déconnecter"
            @click="logout"
          />
        </div>
      </div>
    </MobileDrawer>
  </div>
</template>
