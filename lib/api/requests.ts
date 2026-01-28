import { fetchApi } from "./base";
import type { Request } from "@/lib/types";

const REQUESTS = "/api/v1/requests";

type RequestDto = {
  id: string;
  weddingHallId: string;
  createdByUserId: string;
  message: string;
  status: number | string; // Backend enum olarak string veya number olabilir
  createdAt: string;
  eventType: number;
  eventName: string;
  eventOwner: string;
  eventDate: string;
  eventTime: string;
};

function toRequest(d: RequestDto): Request {
  // Status hem number hem de string olabilir (backend enum serialization'a bağlı)
  let statusNum: number;
  if (typeof d.status === "string") {
    // String olarak geliyorsa number'a çevir
    statusNum = d.status === "Answered" || d.status === "1" ? 1 : 
                 d.status === "Rejected" || d.status === "2" ? 2 : 0;
  } else {
    statusNum = d.status;
  }
  
  const status: Request["status"] =
    statusNum === 1 ? "Answered" : statusNum === 2 ? "Rejected" : "Pending";
  
  return {
    id: d.id,
    weddingHallId: d.weddingHallId,
    createdByUserId: d.createdByUserId,
    message: d.message,
    status,
    createdAt: d.createdAt,
    hallName: "",
    eventType: d.eventType,
    eventName: d.eventName,
    eventOwner: d.eventOwner,
    eventDate: d.eventDate,
    eventTime: d.eventTime,
  };
}

export type CreateRequestData = {
  weddingHallId: string;
  message: string;
  eventType: number;
  eventName: string;
  eventOwner: string;
  eventDate: string;
  eventTime: string;
};

export async function createRequest(data: CreateRequestData): Promise<Request> {
  const d = await fetchApi<RequestDto>(REQUESTS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return toRequest(d);
}

type PagedResult<T> = {
  items?: T[];
  Items?: T[]; // Backend PascalCase kullanıyor olabilir
  page?: number;
  Page?: number;
  pageSize?: number;
  PageSize?: number;
  totalCount?: number;
  TotalCount?: number;
  totalPages?: number;
  TotalPages?: number;
};

export async function getRequests(): Promise<Request[]> {
  try {
    // İlk sayfayı al ve response formatını kontrol et
    const firstPageResult = await fetchApi<PagedResult<RequestDto>>(
      `${REQUESTS}?page=1&pageSize=100`
    );
    
    // Debug: Response'u kontrol et
    console.log("getRequests - First page response:", {
      result: firstPageResult,
      hasItems: !!firstPageResult?.items,
      hasItemsPascal: !!firstPageResult?.Items,
      itemsLength: firstPageResult?.items?.length,
      ItemsLength: firstPageResult?.Items?.length,
      totalCount: firstPageResult?.TotalCount ?? firstPageResult?.totalCount,
    });
    
    // Backend response formatını kontrol et - backend PascalCase kullanıyor
    const items = firstPageResult?.Items ?? firstPageResult?.items ?? [];
    
    if (!Array.isArray(items)) {
      console.error("getRequests - Items is not an array:", items);
      return [];
    }
    
    // Eğer tek sayfada tüm veriler varsa direkt döndür
    const totalCount = firstPageResult?.TotalCount ?? firstPageResult?.totalCount ?? items.length;
    const totalPages = firstPageResult?.TotalPages ?? firstPageResult?.totalPages ?? 1;
    
    console.log(`getRequests - Page info:`, {
      itemsCount: items.length,
      totalCount,
      totalPages,
    });
    
    // Eğer tek sayfada tüm veriler varsa direkt döndür
    if (totalPages <= 1 || items.length >= totalCount) {
      console.log(`getRequests - All items in first page, returning ${items.length} items`);
      return items.map(toRequest);
    }
    
    // Birden fazla sayfa varsa tüm sayfaları al
    const allItems: RequestDto[] = [...items];
    let page = 2;
    const maxPages = Math.min(totalPages, 100); // Güvenlik için maksimum sayfa limiti
    
    while (page <= maxPages) {
      try {
        const result = await fetchApi<PagedResult<RequestDto>>(
          `${REQUESTS}?page=${page}&pageSize=100`
        );
        
        const pageItems = result?.Items ?? result?.items ?? [];
        
        if (Array.isArray(pageItems) && pageItems.length > 0) {
          allItems.push(...pageItems);
          page++;
        } else {
          // Boş sayfa - döngüyü durdur
          break;
        }
      } catch (error) {
        // Sonraki sayfalarda hata varsa, mevcut verileri döndür
        console.warn(`Error loading page ${page} of requests, returning partial results:`, error);
        break;
      }
    }

    console.log(`getRequests - Total items loaded: ${allItems.length}`);
    return allItems.map(toRequest);
  } catch (error) {
    console.error("Error in getRequests:", error);
    // Hata detaylarını göster
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    // Hata durumunda boş array döndür, sayfa çökmesin
    return [];
  }
}

export async function answerRequest(id: string): Promise<Request> {
  const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}/answer`, {
    method: "PUT",
  });
  return toRequest(d);
}

export async function approveRequest(id: string): Promise<Request> {
  const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}/approve`, {
    method: "PUT",
  });
  return toRequest(d);
}

export async function rejectRequest(id: string, reason?: string): Promise<Request> {
  const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}/reject`, {
    method: "PUT",
    body: JSON.stringify({ reason: reason || "" }),
  });
  return toRequest(d);
}

export type UpdateRequestData = {
  weddingHallId?: string;
  message?: string;
  eventType?: number;
  eventName?: string;
  eventOwner?: string;
  eventDate?: string;
  eventTime?: string;
};

export async function updateRequest(id: string, data: UpdateRequestData): Promise<Request> {
  // Backend pattern'ine uygun olarak /update endpoint'ini deneyelim
  // Backend'de approve, reject gibi işlemler için /{id}/approve, /{id}/reject pattern'i kullanılıyor
  // Bu yüzden /{id}/update endpoint'ini deniyoruz
  try {
    const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}/update`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return toRequest(d);
  } catch (error: any) {
    // 405 Method Not Allowed veya 404 Not Found hatası alırsak, direkt /{id} endpoint'ini PATCH ile deneyelim
    if (error?.status === 405 || error?.status === 404) {
      try {
        const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
        return toRequest(d);
      } catch (patchError: any) {
        // Her iki yöntem de çalışmazsa, geçici çözüm: mevcut talebi silip yeni talep oluştur
        // NOT: Bu sadece Pending durumundaki talepler için mantıklı
        // Backend'de update endpoint'i implement edildiğinde bu geçici çözüm kaldırılmalı
        if (patchError?.status === 405 || patchError?.status === 404) {
          // Önce mevcut talebi alalım (durum kontrolü için)
          const currentRequest = await getRequests().then(requests => 
            requests.find(r => r.id === id)
          );
          
          if (!currentRequest) {
            throw new Error("Güncellenecek talep bulunamadı.");
          }
          
          // Sadece Pending durumundaki talepler için sil-yeniden-oluştur yaklaşımını kullan
          if (currentRequest.status !== "Pending") {
            throw new Error("Sadece bekleyen talepler düzenlenebilir.");
          }
          
          // Mevcut talebi sil
          await deleteRequest(id);
          
          // Yeni talep oluştur (güncellenmiş verilerle)
          const newRequestData: CreateRequestData = {
            weddingHallId: data.weddingHallId || currentRequest.weddingHallId,
            eventName: data.eventName || currentRequest.eventName,
            eventOwner: data.eventOwner || currentRequest.eventOwner,
            eventType: data.eventType ?? currentRequest.eventType,
            eventDate: data.eventDate || currentRequest.eventDate.split('T')[0],
            eventTime: data.eventTime || currentRequest.eventTime,
            message: data.message || currentRequest.message,
          };
          
          return await createRequest(newRequestData);
        }
        throw patchError;
      }
    }
    throw error;
  }
}

export async function deleteRequest(id: string): Promise<void> {
  await fetchApi<void>(`${REQUESTS}/${id}`, {
    method: "DELETE",
  });
}
