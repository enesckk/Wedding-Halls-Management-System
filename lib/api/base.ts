const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
};

const TOKEN_KEY = "token";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

export type FetchOptions = RequestInit & { skipAuth?: boolean };

/**
 * Fetch wrapper: base URL from NEXT_PUBLIC_API_URL, JWT from sessionStorage,
 * non-2xx handling, parsed JSON response.
 */
export async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const { skipAuth, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (Array.isArray(body?.errors) && body.errors.length)
        message = body.errors.join(", ");
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return undefined as unknown as Promise<T>;
}

export { getBaseUrl, getToken, TOKEN_KEY };
