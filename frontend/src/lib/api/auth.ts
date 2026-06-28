/**
 * Zuno Auto-Authentication
 * ─────────────────────────────────────────────────────
 * Provides seamless, silent authentication for the frontend.
 * On first load the app logs in as "default@zuno.com".
 * If that account doesn't exist, it registers it, creates a
 * default profile, and initialises the current month's funds.
 */

import { apiFetch, getStoredToken, setStoredToken, getStoredUserId } from './client';

// ─── Constants ─────────────────────────────────────────────────────────────

const DEFAULT_EMAIL = 'default@zuno.com';
const DEFAULT_PASSWORD = 'Zuno@2026!';
const DEFAULT_FULLNAME = 'Zuno User';
const BOOTSTRAP_DONE_KEY = 'zuno:bootstrap-done';

// ─── Auth API types ─────────────────────────────────────────────────────────

type AuthResult = {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
};

type FundResult = {
  id: string;
  fundType: string;
  allocatedAmount: string;
  name?: string;
}[];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCurrentMonthFirstDay(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  return weekStart.toISOString().slice(0, 10);
}

function getWeekEnd(): string {
  const start = new Date(getWeekStart());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end.toISOString().slice(0, 10);
}

// ─── Login ──────────────────────────────────────────────────────────────────

async function loginDefault(): Promise<string | null> {
  const result = await apiFetch<AuthResult>('/api/auth/login', {
    method: 'POST',
    skipAuth: true,
    body: { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD },
  });

  if (!result.ok) return null;
  setStoredToken(result.data.token, result.data.user.id);
  return result.data.token;
}

// ─── Register ───────────────────────────────────────────────────────────────

async function registerDefault(): Promise<string | null> {
  const result = await apiFetch<AuthResult>('/api/auth/register', {
    method: 'POST',
    skipAuth: true,
    body: {
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      fullName: DEFAULT_FULLNAME,
    },
  });

  if (!result.ok) return null;
  setStoredToken(result.data.token, result.data.user.id);
  return result.data.token;
}

// ─── Init profile ────────────────────────────────────────────────────────────

async function initProfile() {
  const profileResult = await apiFetch('/api/profile');
  if (!profileResult.ok) {
    // Profile doesn't exist — create it
    await apiFetch('/api/profile', {
      method: 'POST',
      body: {
        fullName: DEFAULT_FULLNAME,
        bankBalance: 0,
        residenceType: 'dorm',
      },
    });
  }
}

// ─── Init funds ──────────────────────────────────────────────────────────────

async function initFundsForCurrentMonth() {
  // Ensure a weekly reward record exists for this week
  await apiFetch('/api/rewards/weekly', {
    method: 'POST',
    body: {
      weekStart: getWeekStart(),
      weekEnd: getWeekEnd(),
    },
  });
}

// ─── Public bootstrap entrypoint ─────────────────────────────────────────────

let bootstrapPromise: Promise<boolean> | null = null;

/**
 * Call this once on app mount (e.g. in layout.tsx or page.tsx).
 * Idempotent — repeated calls reuse the same in-flight promise.
 * Returns true if bootstrap was successful.
 */
export async function bootstrapAuth(): Promise<boolean> {
  if (bootstrapPromise) return bootstrapPromise;

  if (typeof window !== 'undefined') {
    (window as any)._isBootstrapping = true;
  }

  bootstrapPromise = (async () => {
    const isMockMode = process.env.NEXT_PUBLIC_API_MODE === 'memory-mock';
    const isDev = process.env.NODE_ENV === 'development';

    let token = getStoredToken();
    let userId = getStoredUserId();

    if (!isMockMode && token === 'mock-token') {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('zuno:auth-token');
        window.sessionStorage.removeItem('zuno:user-id');
        window.sessionStorage.removeItem(`${BOOTSTRAP_DONE_KEY}:user_demo`);
        window.sessionStorage.removeItem(BOOTSTRAP_DONE_KEY);
      }
      token = null;
      userId = null;
    }

    const userBootstrapKey = userId ? `${BOOTSTRAP_DONE_KEY}:${userId}` : BOOTSTRAP_DONE_KEY;
    if (token && typeof window !== 'undefined' && window.sessionStorage.getItem(userBootstrapKey)) {
      if (typeof window !== 'undefined') {
        (window as any)._isBootstrapping = false;
      }
      return true;
    }

    if (!token && typeof window !== 'undefined' && window.sessionStorage.getItem(userBootstrapKey)) {
      if (typeof window !== 'undefined') {
        (window as any)._isBootstrapping = false;
      }
      return false;
    }

    if (!token) {
      if (isMockMode) {
        // In mock mode, we use a fake token and userId
        token = 'mock-token';
        setStoredToken(token, 'user_demo');
      } else {
        // In development/production: try to silently login or register the default user
        console.log('[Zuno] No token found, attempting silent bootstrap login...');
        
        let attempts = 0;
        const maxAttempts = 10; // 10 attempts * 3s = 30s to wait for Render cold-start
        
        while (!token && attempts < maxAttempts) {
          attempts++;
          token = await loginDefault();
          if (!token) {
            console.log(`[Zuno] Default user login failed (attempt ${attempts}/${maxAttempts}), trying registration...`);
            token = await registerDefault();
          }
          
          if (!token && attempts < maxAttempts) {
            console.log(`[Zuno] Registration failed. Backend might be starting up. Retrying in 3 seconds...`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }

        if (!token) {
          console.warn('[Zuno] Silent login failed. Backend is offline.');
          if (typeof window !== 'undefined') {
            (window as any)._isBootstrapping = false;
          }
          return false;
        }
        console.log('[Zuno] Silent bootstrap login successful!');
      }
    }

    if (!token) {
      console.error('[Zuno] Bootstrap failed: could not authenticate default user');
      if (typeof window !== 'undefined') {
        (window as any)._isBootstrapping = false;
      }
      return false;
    }

    // Initialise resources for this user
    try {
      if (!isMockMode) {
        await initProfile();
        await initFundsForCurrentMonth();
      }
    } catch (err) {
      console.warn('[Zuno] Bootstrap init warning:', err);
    }

    if (typeof window !== 'undefined') {
      const activeUserId = getStoredUserId() || 'default';
      window.sessionStorage.setItem(`${BOOTSTRAP_DONE_KEY}:${activeUserId}`, '1');
    }

    if (typeof window !== 'undefined') {
      (window as any)._isBootstrapping = false;
    }
    return true;
  })();

  return bootstrapPromise;
}
