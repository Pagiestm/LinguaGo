import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { auth } from '@/shared/api/endpoints';
import { ApiError } from '@/shared/api/http';
import type { User } from '@/shared/api/types';
import { clearOfflineData } from '@/shared/offline/db';

const STORAGE_KEY = 'linguago.user';

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function cacheUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}

export const useSessionStore = defineStore('session', () => {
  const user = ref<User | null>(null);
  const ready = ref(false);
  const offlineSession = ref(false);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  function setUser(next: User | null) {
    user.value = next;
    cacheUser(next);
  }

  async function bootstrap() {
    const cached = readCachedUser();
    try {
      setUser(await auth.me());
      offlineSession.value = false;
    } catch (error) {
      if (error instanceof ApiError && error.isNetworkError && cached) {
        user.value = cached;
        offlineSession.value = true;
      } else {
        setUser(null);
      }
    } finally {
      ready.value = true;
    }
  }

  async function login(email: string, password: string) {
    setUser(await auth.login(email, password));
    offlineSession.value = false;
  }

  async function register(pseudo: string, email: string, password: string) {
    setUser(await auth.register(pseudo, email, password));
    offlineSession.value = false;
  }

  async function logout() {
    try {
      await auth.logout();
    } catch {
      return;
    } finally {
      setUser(null);
      await clearOfflineData();
    }
  }

  return {
    user,
    ready,
    offlineSession,
    isAuthenticated,
    isAdmin,
    setUser,
    bootstrap,
    login,
    register,
    logout,
  };
});
