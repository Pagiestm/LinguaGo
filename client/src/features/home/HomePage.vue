<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue';
import { useQuery } from '@pinia/colada';
import PublicLayout from '@/app/layouts/PublicLayout.vue';
import { catalog } from '@/shared/api/endpoints';
import { formatNumber } from '@/shared/lib/format';
import AppMascot from '@/shared/ui/AppMascot.vue';
import LevelBadge from '@/shared/ui/LevelBadge.vue';
import MascotSays from '@/shared/ui/MascotSays.vue';
import { useSessionStore } from '@/shared/stores/session';

const session = useSessionStore();
const { data: levels } = useQuery({
  key: ['public', 'levels'],
  query: catalog.publicLevels,
  staleTime: 300_000,
});

const steps = [
  {
    title: 'Choisissez un niveau',
    text: 'De A1 à C1, chaque niveau regroupe des séries courtes autour d’un thème du quotidien.',
  },
  {
    title: 'Répondez, parlez, traduisez',
    text: 'QCM, vrai ou faux, traduction, texte à trous, remise dans l’ordre, dictée et prononciation au micro.',
  },
  {
    title: 'Tenez votre série de jours',
    text: 'Un objectif quotidien à votre mesure, les exercices ratés qui reviennent au bon moment, et une ligue chaque semaine.',
  },
];

const features = [
  {
    icon: 'i-lucide-wifi-off',
    color: 'bg-blue-950 text-blue-300',
    title: 'Hors connexion',
    text: 'Téléchargez un niveau entier ou vos favoris : tout reste jouable sans réseau, les réponses se synchronisent au retour.',
  },
  {
    icon: 'i-lucide-rotate-ccw',
    color: 'bg-purple-950 text-purple-300',
    title: 'Révision espacée',
    text: 'Un exercice raté revient après 1, 3, 7, 14, 30 puis 60 jours, jusqu’à être vraiment acquis.',
  },
  {
    icon: 'i-lucide-timer',
    color: 'bg-yellow-950 text-yellow-300',
    title: 'Cinq minutes par jour',
    text: 'La session du jour mêle vos révisions dues et de nouveaux exercices de votre niveau.',
  },
  {
    icon: 'i-lucide-flame',
    color: 'bg-orange-950 text-orange-300',
    title: 'Objectif et série de jours',
    text: 'Choisissez de 5 à 40 points par jour. Chaque jour tenu allonge votre série, et un rappel vous aide à ne pas la casser.',
  },
  {
    icon: 'i-lucide-trophy',
    color: 'bg-sky-950 text-sky-300',
    title: 'Ligues hebdomadaires',
    text: 'Bronze, Argent, Or, Diamant : les meilleurs de la semaine montent le lundi, les derniers descendent.',
  },
  {
    icon: 'i-lucide-award',
    color: 'bg-green-950 text-green-300',
    title: 'Succès à débloquer',
    text: 'Onze succès, du premier exercice réussi à la série de trente jours.',
  },
  {
    icon: 'i-lucide-mic',
    color: 'bg-pink-950 text-pink-300',
    title: 'Prononciation',
    text: 'Dites la phrase à voix haute : la reconnaissance vocale vérifie chaque mot attendu, nombres compris.',
  },
  {
    icon: 'i-lucide-languages',
    color: 'bg-blue-950 text-blue-300',
    title: 'Traductions souples',
    text: 'Plusieurs formulations sont acceptées, contractions comprises, et chaque erreur est montrée mot à mot.',
  },
  {
    icon: 'i-lucide-bell-ring',
    color: 'bg-yellow-950 text-yellow-300',
    title: 'Rappels',
    text: 'Une notification à l’heure que vous choisissez, tous les jours ou toutes les semaines.',
  },
  {
    icon: 'i-lucide-chart-column',
    color: 'bg-green-950 text-green-300',
    title: 'Progression visible',
    text: 'Exercices réussis par jour, séries terminées par niveau, temps passé et classement de la semaine.',
  },
  {
    icon: 'i-lucide-smartphone',
    color: 'bg-orange-950 text-orange-300',
    title: 'Installable',
    text: 'Ajoutez LinguaGo à l’écran d’accueil : l’application se lance comme une app native, avec ses raccourcis.',
  },
  {
    icon: 'i-lucide-shield-check',
    color: 'bg-purple-950 text-purple-300',
    title: 'Vos données',
    text: 'Connexion par email ou avec Google, export complet en JSON, suppression du compte en un clic.',
  },
];
</script>

<template>
  <PublicLayout>
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute -left-32 -top-32 -z-10 size-96 rounded-full blur-3xl bg-blue-900/30"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-24 top-40 -z-10 size-80 rounded-full blur-3xl bg-yellow-900/20"
        aria-hidden="true"
      />
      <div
        class="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div class="text-center lg:text-left">
          <span
            class="inline-flex items-center gap-2 rounded-full border-2 border-default bg-default px-3 py-1 text-xs font-extrabold text-muted"
          >
            <span class="i-lucide-sparkles size-3.5 text-secondary" aria-hidden="true" />
            Gratuit · fonctionne hors connexion
          </span>
          <h1 class="mt-6 text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Apprenez l'anglais
            <span class="relative inline-block text-primary">
              quelques minutes
              <svg
                class="absolute -bottom-2 left-0 w-full text-secondary"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9c40-6 80-6 120-4s50 2 76-3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            par jour
          </h1>
          <p class="mx-auto mt-6 max-w-xl text-lg text-muted lg:mx-0">
            Des séries d'exercices courtes, du niveau débutant au niveau autonome. Répondez,
            prononcez, traduisez : ce que vous ratez revient au bon moment, et votre série de jours
            s'allonge.
          </p>
          <div class="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <UButton
              v-if="session.isAuthenticated"
              to="/dashboard"
              size="xl"
              icon="i-lucide-arrow-right"
              class="btn-pop font-extrabold"
              trailing
              >Reprendre mon apprentissage</UButton
            >
            <template v-else>
              <UButton
                to="/register"
                size="xl"
                icon="i-lucide-rocket"
                class="btn-pop font-extrabold"
                >Créer un compte</UButton
              >
              <UButton
                to="/login"
                size="xl"
                variant="outline"
                color="neutral"
                class="btn-pop btn-pop-neutral font-extrabold"
                >J'ai déjà un compte</UButton
              >
            </template>
          </div>
        </div>
        <div class="flex justify-center">
          <MascotSays expression="wave" size="lg" side="right" animated
            >Hello ! Dix minutes d'anglais, ça te dit ?</MascotSays
          >
        </div>
      </div>

      <div class="mx-auto max-w-4xl px-4 pb-20">
        <div
          class="rounded-3xl border-2 border-default bg-default p-6 shadow-[0_8px_0_0_var(--ui-border)] sm:p-8"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p
                class="inline-flex rounded-full bg-secondary/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-200"
              >
                Niveau A2 · Les voyages
              </p>
              <h2 class="mt-2 text-xl">Exercice 3 sur 6</h2>
            </div>
            <span class="rounded-full bg-elevated px-3 py-1 font-mono text-sm font-bold text-muted"
              >01:24</span
            >
          </div>
          <p class="mt-6 text-lg font-bold">How do you say « Un aller simple » in English?</p>
          <ul class="mt-4 grid gap-3 sm:grid-cols-2" role="list">
            <li
              class="rounded-2xl border-2 border-default px-4 py-3 text-sm font-bold shadow-[0_4px_0_0_var(--ui-border)]"
            >
              A round trip
            </li>
            <li
              class="rounded-2xl border-2 border-primary px-4 py-3 text-sm font-extrabold text-primary shadow-[0_4px_0_0_var(--ui-primary)] bg-blue-950/40"
            >
              A one-way ticket
            </li>
            <li
              class="rounded-2xl border-2 border-default px-4 py-3 text-sm font-bold shadow-[0_4px_0_0_var(--ui-border)]"
            >
              A return ticket
            </li>
            <li
              class="rounded-2xl border-2 border-default px-4 py-3 text-sm font-bold shadow-[0_4px_0_0_var(--ui-border)]"
            >
              A single room
            </li>
          </ul>
          <div class="mt-6 flex items-center justify-between gap-4">
            <span class="inline-flex items-center gap-2 text-sm font-extrabold text-success"
              ><AppMascot expression="cheer" class="size-9" />Bonne réponse, +2 points</span
            >
            <span
              class="rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_color-mix(in_oklab,var(--ui-primary)_65%,black)]"
              >Suivant</span
            >
          </div>
        </div>
      </div>
    </section>

    <section id="niveaux" class="bg-blue-950/20">
      <div class="mx-auto max-w-6xl px-4 py-20">
        <div class="max-w-2xl">
          <p
            class="inline-flex rounded-full bg-secondary/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-200"
          >
            Cinq niveaux
          </p>
          <h2 class="mt-3 text-3xl tracking-tight sm:text-4xl">
            Du premier mot aux conversations nuancées
          </h2>
          <p class="mt-3 text-muted">
            Les niveaux suivent le cadre européen. Chaque exercice réussi rapporte des points, et
            les points font passer au niveau suivant.
          </p>
        </div>
        <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role="list">
          <li
            v-for="level in levels ?? []"
            :key="level.code"
            class="card-pop rounded-2xl border-2 border-default bg-default p-5"
            :class="`level-${level.code.toLowerCase()}`"
          >
            <LevelBadge :code="level.code" size="lg" />
            <p class="mt-4 text-lg font-extrabold">{{ level.title }}</p>
            <p class="mt-1 text-sm text-muted">
              {{ formatNumber(level.exerciseCount) }} exercices ·
              {{ formatNumber(level.winnablePoints) }} points
            </p>
            <div class="mt-4 h-2.5 rounded-full bg-elevated">
              <div class="h-full w-2/3 rounded-full" :style="{ backgroundColor: 'var(--level)' }" />
            </div>
          </li>
          <template v-if="!levels">
            <li v-for="n in 5" :key="n" class="h-40 animate-pulse rounded-2xl bg-elevated" />
          </template>
        </ul>
      </div>
    </section>

    <section id="fonctionnement" class="mx-auto max-w-6xl px-4 py-20">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p
            class="inline-flex rounded-full bg-secondary/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-200"
          >
            Comment ça marche
          </p>
          <h2 class="mt-3 text-3xl tracking-tight sm:text-4xl">
            Trois étapes, pas de méthode à lire
          </h2>
          <ol class="mt-8 space-y-6">
            <li v-for="(step, index) in steps" :key="step.title" class="flex gap-4">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-lg font-extrabold text-slate-900 shadow-[0_3px_0_0_rgba(0,0,0,0.2)]"
                >{{ index + 1 }}</span
              >
              <div>
                <p class="text-lg font-extrabold">{{ step.title }}</p>
                <p class="mt-1 text-sm text-muted">{{ step.text }}</p>
              </div>
            </li>
          </ol>
        </div>
        <div
          class="rounded-3xl border-2 border-default bg-default p-6 shadow-[0_8px_0_0_var(--ui-border)]"
        >
          <p class="text-sm font-extrabold text-muted">Exercice de prononciation</p>
          <p class="mt-4 text-2xl font-extrabold">“It is seven o'clock.”</p>
          <div class="mt-6 flex items-center gap-4">
            <span
              class="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_4px_0_0_color-mix(in_oklab,var(--ui-primary)_65%,black)]"
              ><span class="i-lucide-mic size-7" aria-hidden="true"
            /></span>
            <div>
              <p class="text-sm text-muted">Vous avez dit</p>
              <p class="font-bold">it is 7:00</p>
            </div>
          </div>
          <div class="mt-6">
            <MascotSays expression="cheer" size="sm"
              >Les nombres sont compris, même dictés en chiffres.</MascotSays
            >
          </div>
        </div>
      </div>
    </section>

    <section id="hors-ligne" class="bg-blue-950/20">
      <div class="mx-auto max-w-6xl px-4 py-20">
        <p
          class="inline-flex rounded-full bg-secondary/25 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-yellow-200"
        >
          Au quotidien
        </p>
        <h2 class="mt-3 text-3xl tracking-tight sm:text-4xl">
          Tout ce qu'il faut pour tenir dans la durée
        </h2>
        <p class="mt-3 max-w-2xl text-muted">
          Apprendre une langue se joue sur la régularité. LinguaGo s'occupe du rythme : vous n'avez
          qu'à répondre.
        </p>
        <ul class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
          <li
            v-for="feature in features"
            :key="feature.title"
            class="card-pop rounded-2xl border-2 border-default bg-default p-6"
          >
            <span
              class="flex size-12 items-center justify-center rounded-2xl"
              :class="feature.color"
              ><span :class="feature.icon" class="size-6" aria-hidden="true"
            /></span>
            <p class="mt-4 text-lg font-extrabold">{{ feature.title }}</p>
            <p class="mt-1 text-sm text-muted">{{ feature.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-20">
      <div
        class="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-white sm:px-12"
      >
        <div
          class="pointer-events-none absolute -left-10 -top-10 size-48 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-16 -right-8 size-64 rounded-full bg-yellow-300/40"
          aria-hidden="true"
        />
        <AppMascot expression="cheer" animated class="relative mx-auto size-28" />
        <h2 class="relative mt-4 text-3xl tracking-tight sm:text-4xl">
          Prêt pour votre première série ?
        </h2>
        <p class="relative mx-auto mt-3 max-w-xl text-white/85">
          Un compte, un pseudo, et vous commencez au niveau A1. Gratuit, sans publicité.
        </p>
        <UButton
          v-if="!session.isAuthenticated"
          to="/register"
          size="xl"
          color="secondary"
          class="btn-pop btn-pop-secondary relative mt-8 font-extrabold text-slate-900"
          >Créer mon compte</UButton
        >
        <UButton
          v-else
          to="/dashboard/learn"
          size="xl"
          color="secondary"
          class="btn-pop btn-pop-secondary relative mt-8 font-extrabold text-slate-900"
          >Choisir un niveau</UButton
        >
      </div>
    </section>
  </PublicLayout>
</template>
