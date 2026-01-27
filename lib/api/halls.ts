import { fetchApi } from "./base";
import type { WeddingHall } from "@/lib/types";
import { weddingHalls } from "@/lib/data";

const HALLS = "/api/v1/halls";

type WeddingHallDto = {
  id: string;
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
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  technicalDetails: string;
};

export type UpdateHallData = CreateHallData;

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
    const d = await fetchApi<WeddingHallDto>(HALLS, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return toHall(d);
  } catch (error) {
    if (isNetworkError(error)) {
      console.warn("Backend API not available, mock create not supported");
      throw new Error("Backend API not available. Cannot create hall in mock mode.");
    }
    throw error;
  }
}

export async function updateHall(id: string, data: UpdateHallData): Promise<WeddingHall> {
  try {
    const d = await fetchApi<WeddingHallDto>(`${HALLS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
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

/** Re-export for backward compatibility. Prefer importing from schedules. */
export { getSchedulesByHall } from "./schedules";
