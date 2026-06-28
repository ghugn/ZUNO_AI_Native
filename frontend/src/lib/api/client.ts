/**
 * Zuno API Client
 * ─────────────────────────────────────────────────────
 * Centralised HTTP fetch wrapper with:
 *  - Base URL from NEXT_PUBLIC_API_URL
 *  - Auto JWT token injection from sessionStorage
 *  - Token refresh / auto-login if 401 received
 */

function getApiBase(): string {
  let apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    if (apiBase.includes('localhost')) {
      apiBase = apiBase.replace('localhost', hostname);
    } else if (!process.env.NEXT_PUBLIC_API_URL) {
      apiBase = `${protocol}//${hostname}:5000`;
    }
  }
  return apiBase;
}

const TOKEN_KEY = 'zuno:auth-token';
const USER_ID_KEY = 'zuno:user-id';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string, userId: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(TOKEN_KEY, token);
  window.sessionStorage.setItem(USER_ID_KEY, userId);
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_ID_KEY);
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(USER_ID_KEY);
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T;
  ok: true;
} | {
  error: string;
  ok: false;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  /** Set to true to skip adding auth header (used for login/register) */
  skipAuth?: boolean;
};

function buildUrl(path: string, query?: Record<string, string | number | undefined | null>): string {
  const url = new URL(path, getApiBase());
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, query, skipAuth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError: unknown) {
    return {
      ok: false,
      error: networkError instanceof Error
        ? networkError.message
        : 'Network error — is the backend running?',
    };
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      // If we are currently bootstrapping auth, DO NOT redirect to login page.
      if ((window as any)._isBootstrapping) {
        return { ok: false, error: 'Unauthorized (bootstrapping)' };
      }
      window.sessionStorage.removeItem("zuno:auth-token");
      window.sessionStorage.removeItem("zuno:user-id");
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith("zuno:")) {
          window.sessionStorage.removeItem(key);
          i--;
        }
      }
      if (window.location.pathname !== '/login') {
        console.warn("Unauthorized API request received. Skipping /login redirect to keep app accessible.");
      }
    }
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === 'string') {
        errorMessage = errorBody.error;
      }
    } catch {
      // Ignore parse errors
    }
    return { ok: false, error: errorMessage };
  }

  // 204 No Content
  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const data = await response.json() as T;
  return { ok: true, data };
}
