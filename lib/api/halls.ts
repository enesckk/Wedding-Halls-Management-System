import { fetchApi } from "./base";
import type { WeddingHall } from "@/lib/types";
import { weddingHalls } from "@/lib/data";
import { createSchedule } from "./schedules";

const HALLS = "/api/v1/halls";

type WeddingHallDto = {
  id: string;
  centerId: string;
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  technicalDetails: string;
};

function toHall(d: WeddingHallDto): WeddingHall {
  return {
    id: d.id,
    centerId: d.centerId,
    name: d.name,
    address: d.address,
    capacity: d.capacity,
    description: d.description,
    imageUrl: d.imageUrl,
    technicalDetails: d.technicalDetails || "",
  };
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("Failed to fetch") ||
    error.message.includes("ERR_CONNECTION_REFUSED") ||
    error.message.includes("NetworkError") ||
    error.name === "NetworkError"
  );
}

export type CreateHallData = {
  centerId: string;
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  technicalDetails: string;
  allowedUserIds?: string[]; // Editor kullanıcı ID'leri
};

export type UpdateHallData = {
  centerId: string;
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  technicalDetails: string;
  allowedUserIds?: string[]; // Editor kullanıcı ID'leri
};

export async function getHalls(): Promise<WeddingHall[]> {
  try {
    // Backend returns paginated result, but we want all halls
    const result = await fetchApi<{ items: WeddingHallDto[]; totalCount: number }>(`${HALLS}?page=1&pageSize=1000`);
    const items = result?.items ?? [];
    return items.map(toHall);
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn("Backend API not available, using mock halls data");
      // Return mock data from lib/data.ts
      return weddingHalls.map((hall) => ({
        id: hall.id,
        centerId: hall.centerId,
        name: hall.name,
        address: hall.address,
        capacity: hall.capacity,
        description: hall.description,
        imageUrl: hall.imageUrl,
        technicalDetails: "",
      }));
    }
    throw error;
  }
}

export async function getHallById(id: string): Promise<WeddingHall | null> {
  try {
    const d = await fetchApi<WeddingHallDto>(`${HALLS}/${id}`);
    return toHall(d);
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn("Backend API not available, using mock hall data");
      // Return mock data from lib/data.ts
      const hall = weddingHalls.find((h) => h.id === id);
      if (!hall) return null;
      return {
        id: hall.id,
        centerId: hall.centerId,
        name: hall.name,
        address: hall.address,
        capacity: hall.capacity,
        description: hall.description,
        imageUrl: hall.imageUrl,
        technicalDetails: "",
      };
    }
    return null;
  }
}

export async function createHall(data: CreateHallData): Promise<WeddingHall> {
  try {
    // Backend'de tüm string alanları 1000 karakter limitine sahip olabilir
    // Backend ImageUrl alanını zorunlu istiyor, bu yüzden null yerine boş string gönderelim
    
    let imageUrl = data.imageUrl.trim() || "";
    
    // Base64 görseller çok uzun olabilir - eğer 1000 karakterden uzunsa gönderme
    if (imageUrl && imageUrl.length > 1000) {
      if (imageUrl.startsWith("data:image")) {
        throw new Error("Görsel çok büyük. Lütfen daha küçük bir görsel seçin veya görsel URL'i kullanın. (Maksimum 1000 karakter)");
      }
      // Normal URL ise kes
      imageUrl = imageUrl.substring(0, 1000);
    }
    
    // Technical details'i önce keselim (1000 karakter limiti)
    let technicalDetails = data.technicalDetails.trim() || "";
    if (technicalDetails.length > 1000) {
      technicalDetails = technicalDetails.substring(0, 1000);
    }
    
    const cleanedData: any = {
      centerId: data.centerId,
      name: (data.name.trim() || "").substring(0, 1000),
      address: (data.address.trim() || "").substring(0, 1000),
      capacity: data.capacity,
      description: (data.description.trim() || "").substring(0, 1000) || "",
      imageUrl: imageUrl, // Backend zorunlu istiyor, boş string gönderelim
      technicalDetails: technicalDetails || "",
      allowedUserIds: data.allowedUserIds || [],
    };
    
    // Boş string'leri kontrol et - backend bazı alanlar için boş string bekliyor olabilir
    // Ama description ve technicalDetails için null gönderebiliriz
    if (cleanedData.description === "") {
      cleanedData.description = null;
    }
    if (cleanedData.technicalDetails === "") {
      cleanedData.technicalDetails = null;
    }
    
    // Debug: Gönderilen veriyi ve uzunluklarını logla
    console.log("createHall - Data lengths:", {
      name: cleanedData.name?.length || 0,
      address: cleanedData.address?.length || 0,
      description: cleanedData.description?.length || 0,
      imageUrl: cleanedData.imageUrl?.length || 0,
      technicalDetails: cleanedData.technicalDetails?.length || 0,
    });
    
    const d = await fetchApi<WeddingHallDto>(HALLS, {
      method: "POST",
      body: JSON.stringify(cleanedData),
    });
    
    const createdHall = toHall(d);
    
    // Salon oluşturulduktan sonra varsayılan müsaitlik kayıtlarını oluştur
    // Bu işlemi arka planda yap, kullanıcıyı bekletme
    createDefaultSchedules(createdHall.id).catch((scheduleError) => {
      // Müsaitlik kayıtları oluşturulamazsa hata fırlatma, sadece logla
      console.error("Varsayılan müsaitlik kayıtları oluşturulamadı:", scheduleError);
    });
    
    return createdHall;
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn("Backend API not available, mock create not supported");
      throw new Error("Backend API not available. Cannot create hall in mock mode.");
    }
    throw error;
  }
}

/**
 * Yeni oluşturulan salon için varsayılan müsaitlik kayıtlarını oluşturur
 * Bugünden itibaren 7 gün için standart saat dilimlerinde müsaitlik kayıtları oluşturur
 */
async function createDefaultSchedules(hallId: string): Promise<void> {
  // Standart saat dilimleri (takvim sayfasıyla aynı)
  const TIME_SLOTS = [
    { start: "09:00", end: "10:30" },
    { start: "10:30", end: "12:00" },
    { start: "12:00", end: "14:00" },
    { start: "14:00", end: "15:30" },
    { start: "15:30", end: "17:00" },
    { start: "17:00", end: "19:00" }, // Son saat dilimi için varsayılan bitiş
  ];
  
  // Bugünden itibaren 7 gün için kayıt oluştur
  const today = new Date();
  let successCount = 0;
  let errorCount = 0;
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3; // 3 ardışık hata olursa durdur
  
  console.log(`[createDefaultSchedules] Başlangıç - Salon ID: ${hallId}`);
  
  // İstekleri sıralı olarak gönder
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    
    // Her saat dilimi için müsaitlik kaydı oluştur
    for (const slot of TIME_SLOTS) {
      try {
        const result = await createSchedule({
          weddingHallId: hallId,
          date: dateStr,
          startTime: slot.start,
          endTime: slot.end,
          status: "Available",
        });
        successCount++;
        consecutiveErrors = 0; // Başarılı oldu, hata sayacını sıfırla
        console.log(`[createDefaultSchedules] ✓ ${dateStr} ${slot.start}-${slot.end} oluşturuldu`);
      } catch (err: any) {
        errorCount++;
        consecutiveErrors++;
        console.error(`[createDefaultSchedules] ✗ ${dateStr} ${slot.start}-${slot.end} oluşturulamadı:`, err?.message || err);
        
        // Çok fazla ardışık hata varsa durdur
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.error(`[createDefaultSchedules] ${MAX_CONSECUTIVE_ERRORS} ardışık hata! İşlem durduruluyor.`);
          throw new Error(`Müsaitlik kayıtları oluşturulamıyor. İlk ${successCount} kayıt başarılı, sonrası başarısız.`);
        }
      }
      
      // Her kayıt arasında kısa bir bekleme (rate limiting için)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`[createDefaultSchedules] Tamamlandı: ${successCount} başarılı, ${errorCount} hata`);
  
  if (errorCount > 0 && successCount === 0) {
    throw new Error("Hiçbir müsaitlik kaydı oluşturulamadı. Lütfen manuel olarak kontrol edin.");
  }
}

export async function updateHall(id: string, data: UpdateHallData): Promise<WeddingHall> {
  try {
    // Backend'de tüm string alanları 1000 karakter limitine sahip olabilir
    // Backend ImageUrl alanını zorunlu istiyor, bu yüzden null yerine boş string gönderelim
    
    let imageUrl = data.imageUrl.trim() || "";
    
    // Base64 görseller çok uzun olabilir - eğer 1000 karakterden uzunsa gönderme
    if (imageUrl && imageUrl.length > 1000) {
      if (imageUrl.startsWith("data:image")) {
        throw new Error("Görsel çok büyük. Lütfen daha küçük bir görsel seçin veya görsel URL'i kullanın. (Maksimum 1000 karakter)");
      }
      // Normal URL ise kes
      imageUrl = imageUrl.substring(0, 1000);
    }
    
    // Technical details'i önce keselim (1000 karakter limiti)
    let technicalDetails = data.technicalDetails.trim() || "";
    if (technicalDetails.length > 1000) {
      technicalDetails = technicalDetails.substring(0, 1000);
    }
    
    const cleanedData: any = {
      centerId: data.centerId,
      name: (data.name.trim() || "").substring(0, 1000),
      address: (data.address.trim() || "").substring(0, 1000),
      capacity: data.capacity,
      description: (data.description.trim() || "").substring(0, 1000) || "",
      imageUrl: imageUrl, // Backend zorunlu istiyor, boş string gönderelim
      technicalDetails: technicalDetails || "",
      allowedUserIds: data.allowedUserIds || [],
    };
    
    // Boş string'leri kontrol et
    if (cleanedData.description === "") {
      cleanedData.description = null;
    }
    if (cleanedData.technicalDetails === "") {
      cleanedData.technicalDetails = null;
    }
    
    const d = await fetchApi<WeddingHallDto>(`${HALLS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(cleanedData),
    });
    return toHall(d);
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn("Backend API not available, mock update not supported");
      throw new Error("Backend API not available. Cannot update hall in mock mode.");
    }
    throw error;
  }
}

export async function deleteHall(id: string): Promise<void> {
  await fetchApi<void>(`${HALLS}/${id}`, { method: "DELETE" });
}

/** Re-export for backward compatibility. Prefer importing from schedules. */
export { getSchedulesByHall } from "./schedules";
