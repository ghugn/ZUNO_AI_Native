type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
  token?: string | null;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export type ApiJsonOptions = ApiRequestOptions & {
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const localApiBaseUrl = typeof globalThis.location === "undefined" ? "http://localhost:5000" : `${globalThis.location.protocol}//${globalThis.location.hostname}:5000`;
  const apiBaseUrl = CONFIGURED_API_BASE_URL || localApiBaseUrl;
  const url = new URL(`${apiBaseUrl}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  return fallback;
}

async function request<T>(method: string, path: string, options: ApiJsonOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 5000;
  let timeoutId: ReturnType<typeof setTimeout>;
  headers.set("Accept", "application/json");

  const init: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  options.signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let token = options.token;
  if (!token && typeof window !== "undefined") {
    token = window.sessionStorage.getItem("zuno:auth-token");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(options.body);
  }

  try {
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`API request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const response = await Promise.race([fetch(buildUrl(path, options.query), init), timeout]);
    const payload = await readResponsePayload(response);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        // If we are currently bootstrapping auth, DO NOT redirect to login page.
        if ((window as any)._isBootstrapping) {
          throw new ApiError("Unauthorized (bootstrapping)", 401);
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
          console.warn("Unauthorized API request received in apiClient. Skipping /login redirect.");
        }
      }
      throw new ApiError(getErrorMessage(payload, response.statusText), response.status, payload);
    }

    return payload as T;
  } finally {
    clearTimeout(timeoutId!);
  }
}

export const apiClient = {
  get<T>(path: string, options?: ApiRequestOptions) {
    return request<T>("GET", path, options);
  },
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>("POST", path, { ...options, body });
  },
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return request<T>("PUT", path, { ...options, body });
  },
};
