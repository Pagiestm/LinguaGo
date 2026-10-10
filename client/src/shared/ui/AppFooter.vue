<script setup lang="ts">
import AppLogo from './AppLogo.vue';
</script>

<template>
  <footer class="border-t-2 border-default">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <AppLogo />
        <p class="mt-2 max-w-xs text-sm text-muted">
          Apprendre l'anglais à son rythme, même sans connexion.
        </p>
      </div>
      <nav
        aria-label="Pied de page"
        class="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-muted"
      >
        <RouterLink to="/#niveaux" class="hover:text-primary">Niveaux</RouterLink>
        <RouterLink to="/#fonctionnement" class="hover:text-primary">Fonctionnement</RouterLink>
        <RouterLink to="/login" class="hover:text-primary">Connexion</RouterLink>
        <a
          href="https://github.com/Pagiestm/LinguaGo"
          target="_blank"
          rel="noopener"
          class="hover:text-primary"
          >Code source</a
        >
      </nav>
    </div>
    <p class="border-t-2 border-default px-4 py-4 text-center text-xs text-muted">
      © {{ new Date().getFullYear() }} LinguaGo
    </p>
  </footer>
</template>
