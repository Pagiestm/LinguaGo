import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useSessionStore } from '@/shared/stores/session';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/home/HomePage.vue'),
    meta: { title: 'LinguaGo' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/LoginPage.vue'),
    meta: { title: 'Connexion', guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/features/auth/RegisterPage.vue'),
    meta: { title: 'Inscription', guest: true },
  },
  {
    path: '/forgot',
    name: 'forgot',
    component: () => import('@/features/auth/ForgotPage.vue'),
    meta: { title: 'Mot de passe oublié', guest: true },
  },
  {
    path: '/reset',
    name: 'reset',
    component: () => import('@/features/auth/ResetPage.vue'),
    meta: { title: 'Nouveau mot de passe', guest: true },
  },
  {
    path: '/dashboard',
    component: () => import('@/app/layouts/DashboardLayout.vue'),
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/features/dashboard/DashboardPage.vue'),
        meta: { title: 'Tableau de bord' },
      },
      {
        path: 'learn',
        name: 'levels',
        component: () => import('@/features/learn/LevelsPage.vue'),
        meta: { title: 'Niveaux' },
      },
      {
        path: 'learn/:level(A1|A2|B1|B2|C1)',
        name: 'series',
        component: () => import('@/features/learn/SeriesPage.vue'),
        props: true,
        meta: { title: 'Séries' },
      },
      {
        path: 'series/:id(\\d+)',
        name: 'session',
        component: () => import('@/features/learn/SessionPage.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'Exercices' },
      },
      {
        path: 'review',
        name: 'review',
        component: () => import('@/features/learn/ReviewPage.vue'),
        props: { mode: 'review' },
        meta: { title: 'Révision' },
      },
      {
        path: 'daily',
        name: 'daily',
        component: () => import('@/features/learn/ReviewPage.vue'),
        props: { mode: 'daily' },
        meta: { title: 'Cinq minutes' },
      },
      {
        path: 'favorites',
        name: 'favorites',
        component: () => import('@/features/favorites/FavoritesPage.vue'),
        meta: { title: 'Favoris' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/features/account/SettingsPage.vue'),
        meta: { title: 'Mon compte' },
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/features/admin/AdminPage.vue'),
        meta: { title: 'Administration', admin: true },
      },
      {
        path: 'admin/series/new',
        name: 'admin-series-new',
        component: () => import('@/features/admin/AdminSeriesPage.vue'),
        props: { id: null },
        meta: { title: 'Nouvelle série', admin: true },
      },
      {
        path: 'admin/series/:id(\\d+)',
        name: 'admin-series',
        component: () => import('@/features/admin/AdminSeriesPage.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'Série', admin: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/app/NotFoundPage.vue'),
    meta: { title: 'Page introuvable' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, _from, savedPosition) => {
    if (savedPosition) return savedPosition;
    if (to.hash) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return { el: to.hash, top: 80, behavior: reduced ? 'auto' : 'smooth' };
    }
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const session = useSessionStore();
  const title = to.meta.title as string | undefined;
  document.title = title && title !== 'LinguaGo' ? `${title} · LinguaGo` : 'LinguaGo';

  if (to.matched.some((record) => record.meta.auth) && !session.isAuthenticated) {
    return { name: 'login', query: { next: to.fullPath } };
  }
  if (to.meta.guest && session.isAuthenticated) {
    return { name: 'dashboard' };
  }
  if (to.meta.admin && !session.isAdmin) {
    return { name: 'dashboard' };
  }
  return true;
});
