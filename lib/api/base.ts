import { ApiError } from "@/lib/utils/api-error";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
};

const TOKEN_KEY = "token";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

export type FetchOptions = RequestInit & { skipAuth?: boolean };

type ErrorBody = { message?: string; errors?: string[] };

/**
 * Fetch wrapper: base URL from NEXT_PUBLIC_API_URL, JWT from sessionStorage,
 * non-2xx → typed ApiError, parsed JSON response.
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

  try {
    const res = await fetch(url, { ...init, headers });

    if (!res.ok) {
      const text = await res.text();
      let message = `HTTP ${res.status}`;
      let errors: string[] | undefined;
      try {
        const body = (text ? JSON.parse(text) : {}) as ErrorBody;
        if (body?.message) message = body.message;
        if (Array.isArray(body?.errors) && body.errors.length) {
          errors = body.errors;
          if (!body?.message) message = body.errors.join(", ");
        } else if (text && !body?.message) message = text;
        // Debug: Backend'den dönen hatayı console'a yazdır
        console.error(`API Error [${res.status}]:`, { url, message, errors, body, text });
      } catch {
        if (text) message = text;
        console.error(`API Error [${res.status}]:`, { url, message, text });
      }
      throw new ApiError(message, errors, res.status);
    }

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return res.json() as Promise<T>;
    }
    return undefined as unknown as Promise<T>;
  } catch (error) {
    // Handle network/connection errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Check if it's a connection error - more comprehensive check
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    const errorString = String(error);
    
    // Check various network error patterns
    const isNetworkErr = 
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("ERR_CONNECTION_REFUSED") ||
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("Network request failed") ||
      errorMessage.includes("fetch failed") ||
      errorString.includes("ERR_CONNECTION_REFUSED") ||
      errorString.includes("Failed to fetch") ||
      errorName === "NetworkError" ||
      errorName === "TypeError"; // fetch() throws TypeError on network errors
    
    if (isNetworkErr) {
      const networkError = new Error("ERR_CONNECTION_REFUSED");
      networkError.name = "NetworkError";
      throw networkError;
    }
    throw error;
  }
}

export { getBaseUrl, getToken, TOKEN_KEY };
