<script setup lang="ts">
import { RouterLink } from 'vue-router';
import AppLogo from '@/shared/ui/AppLogo.vue';
import type { MascotExpression } from '@/shared/ui/AppMascot.vue';
import MascotSays from '@/shared/ui/MascotSays.vue';

withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    tip: string;
    expression?: MascotExpression;
  }>(),
  { expression: 'wave' },
);

const perks = [
  { icon: 'i-lucide-library', text: '418 exercices, A1 à C1' },
  { icon: 'i-lucide-wifi-off', text: 'Fonctionne hors ligne' },
  { icon: 'i-lucide-mic', text: 'Prononciation au micro' },
  { icon: 'i-lucide-trophy', text: 'Ligues chaque semaine' },
];
</script>

<template>
  <div class="relative flex min-h-dvh flex-col overflow-hidden bg-slate-950">
    <div
      class="pointer-events-none absolute -left-24 top-32 size-72 rounded-full blur-3xl bg-yellow-400/10"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-24 bottom-16 size-80 rounded-full blur-3xl bg-blue-500/15"
      aria-hidden="true"
    />
    <header class="relative flex items-center px-4 py-4 sm:px-8">
      <RouterLink to="/" aria-label="Accueil LinguaGo"><AppLogo /></RouterLink>
    </header>
    <main
      class="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-0"
    >
      <MascotSays :expression="expression" size="md" animated class="mb-5">{{ tip }}</MascotSays>
      <section
        class="rounded-3xl border-2 border-default bg-default p-6 shadow-[0_6px_0_0_var(--ui-border)] sm:p-8"
      >
        <h1 class="text-2xl tracking-tight sm:text-3xl">{{ title }}</h1>
        <p class="mt-1 text-sm font-semibold text-muted">{{ subtitle }}</p>
        <div class="mt-6">
          <slot />
        </div>
      </section>
      <p class="mt-6 text-center text-sm font-bold text-muted">
        <slot name="footer" />
      </p>
      <ul class="mt-8 flex flex-wrap justify-center gap-2" role="list">
        <li
          v-for="perk in perks"
          :key="perk.text"
          class="flex items-center gap-1.5 rounded-full border-2 border-default bg-default px-3 py-1.5 text-xs font-bold"
        >
          <span :class="perk.icon" class="size-4 text-primary" aria-hidden="true" />{{ perk.text }}
        </li>
      </ul>
    </main>
  </div>
</template>
