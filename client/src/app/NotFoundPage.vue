<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import PublicLayout from '@/app/layouts/PublicLayout.vue';
import MascotSays from '@/shared/ui/MascotSays.vue';
</script>

<template>
  <PublicLayout>
    <section class="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <MascotSays expression="oops" size="lg">Oups… je ne trouve pas cette page.</MascotSays>
      <p
        class="mt-10 inline-flex rounded-full bg-secondary/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-200"
      >
        Erreur 404
      </p>
      <h1 class="mt-3 text-3xl tracking-tight">Cette page n'existe pas</h1>
      <p class="mt-3 text-muted">Le lien est peut-être incorrect, ou la page a été déplacée.</p>
      <UButton to="/" class="btn-pop mt-8 font-extrabold" size="lg" icon="i-lucide-house"
        >Retour à l'accueil</UButton
      >
    </section>
  </PublicLayout>
</template>
