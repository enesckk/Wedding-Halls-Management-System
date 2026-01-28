import { ApiError } from "@/lib/utils/api-error";

const TOKEN_KEY = "token";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

export const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
};

export type FetchOptions = RequestInit & { skipAuth?: boolean };

type ErrorBody = { message?: string; errors?: string[] };

/**
 * Fetch wrapper: base URL from NEXT_PUBLIC_API_URL, JWT from sessionStorage,
 * non-2xx → typed ApiError, parsed JSON response.
 */
export async function fetchApi<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, "");
  
  // Check if API URL is configured
  if (!base) {
    const error = new Error("API URL yapılandırılmamış. NEXT_PUBLIC_API_URL ortam değişkenini kontrol edin.");
    error.name = "ConfigurationError";
    throw error;
  }
  
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
    // Request body'yi logla (debug için)
    let requestBody: unknown = null;
    if (init.body) {
      try {
        requestBody = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      } catch {
        requestBody = init.body;
      }
    }

    const res = await fetch(url, { ...init, headers });

    if (!res.ok) {
      // Response body'yi oku
      const contentType = res.headers.get("content-type") || "";
      let text = "";
      let body: ErrorBody | null = null;
      
      try {
        // Content-Type'a göre response'u oku
        if (contentType.includes("application/json")) {
          text = await res.text();
          if (text) {
            try {
              body = JSON.parse(text) as ErrorBody;
            } catch (parseErr) {
              // JSON parse başarısız, text'i direkt kullan
              text = text.trim();
            }
          }
        } else {
          // JSON değilse text olarak oku
          text = await res.text();
          text = text.trim();
        }
      } catch (readError) {
        // Response body okunamadı
        console.warn("Response body okunamadı:", readError);
      }
      
      let message = `HTTP ${res.status}`;
      let errors: string[] | undefined;
      
      // Status code'a göre varsayılan mesajlar
      const statusMessages: Record<number, string> = {
        400: "Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.",
        401: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.",
        403: "Bu işlem için yetkiniz bulunmamaktadır.",
        404: "İstenen kaynak bulunamadı.",
        500: "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
        502: "Backend servisine bağlanılamıyor.",
        503: "Servis şu anda kullanılamıyor.",
      };
      
      // Varsayılan mesajı status code'a göre ayarla
      if (statusMessages[res.status]) {
        message = statusMessages[res.status];
      }
      
      // Backend'den gelen mesajı parse et
      if (body) {
        if (body.message) {
          message = body.message;
        }
        if (Array.isArray(body.errors) && body.errors.length) {
          errors = body.errors;
          if (!body.message) {
            message = body.errors.join(", ");
          }
        }
      } else if (text) {
        // Body parse edilemedi ama text var
        message = text;
      }
      
      // 401 (Unauthorized) hatalarını sessizce handle et - token geçersiz/yok
      if (res.status === 401) {
        // Token'ı temizle
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(TOKEN_KEY);
        }
        // 401 hatalarını console'a yazdırma (normal durum - token yoksa)
      } else {
        // Diğer hataları console'a yazdır (daha detaylı)
        console.error(`API Error [${res.status}]:`, {
          url,
          method: init.method || "GET",
          status: res.status,
          statusText: res.statusText,
          message,
          errors,
          responseBody: body || text || "(empty)",
          responseText: text || "(empty)",
          responseTextLength: text?.length || 0,
          contentType,
          requestBody: requestBody ? JSON.stringify(requestBody, null, 2) : "(none)",
        });
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
    
    // Check if it's a connection error - more specific check
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Only treat as network error if it's specifically a fetch/network failure
    // Don't treat all TypeErrors as network errors - only those related to fetch
    const isNetworkErr = 
      errorName === "TypeError" && (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("ERR_CONNECTION_REFUSED") ||
        errorMessage.includes("ERR_NETWORK") ||
        errorMessage.includes("ERR_INTERNET_DISCONNECTED")
      ) ||
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("ERR_CONNECTION_REFUSED") ||
      errorMessage.includes("NetworkError") ||
      errorMessage.includes("Network request failed") ||
      errorMessage.includes("fetch failed") ||
      errorName === "NetworkError";
    
    if (isNetworkErr) {
      const networkError = new Error("Backend API'ye bağlanılamıyor. Lütfen backend'in çalıştığından emin olun.");
      networkError.name = "NetworkError";
      throw networkError;
    }
    throw error;
  }
}

export { getBaseUrl, getToken, TOKEN_KEY };
