export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

export const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  retryOnUnauthorized?: boolean;
  signal?: AbortSignal;
}

let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

const NO_RETRY = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function messageOf(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    if (Array.isArray(message)) return message.map(String).join(' · ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, retryOnUnauthorized = true, signal } = options;
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, 'Connexion impossible', error);
  }

  if (response.status === 401 && retryOnUnauthorized && !NO_RETRY.includes(path)) {
    if (await refreshSession()) return api<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload: unknown = text ? safeJson(text) : null;
  if (!response.ok) {
    throw new ApiError(response.status, messageOf(payload, `Erreur ${response.status}`), payload);
  }
  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const isNetworkError = (error: unknown): boolean =>
  error instanceof ApiError && error.isNetworkError;
