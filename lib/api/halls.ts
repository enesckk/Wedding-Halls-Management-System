import { fetchApi } from "./base";
import type { WeddingHall } from "@/lib/types";

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
  // Backend returns paginated result, but we want all halls
  const result = await fetchApi<{ items: WeddingHallDto[]; totalCount: number }>(`${HALLS}?page=1&pageSize=1000`);
  const items = result?.items ?? [];
  return items.map(toHall);
}

export async function getHallById(id: string): Promise<WeddingHall | null> {
  try {
    const d = await fetchApi<WeddingHallDto>(`${HALLS}/${id}`);
    return toHall(d);
  } catch {
    return null;
  }
}

export async function createHall(data: CreateHallData): Promise<WeddingHall> {
  const d = await fetchApi<WeddingHallDto>(HALLS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return toHall(d);
}

export async function updateHall(id: string, data: UpdateHallData): Promise<WeddingHall> {
  const d = await fetchApi<WeddingHallDto>(`${HALLS}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return toHall(d);
}

/** Re-export for backward compatibility. Prefer importing from schedules. */
export { getSchedulesByHall } from "./schedules";
