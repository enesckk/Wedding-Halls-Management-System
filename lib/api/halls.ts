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
};

function toHall(d: WeddingHallDto): WeddingHall {
  return {
    id: d.id,
    name: d.name,
    address: d.address,
    capacity: d.capacity,
    description: d.description,
    imageUrl: d.imageUrl,
  };
}

export type CreateHallData = {
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
};

export type UpdateHallData = CreateHallData;

export async function getHalls(): Promise<WeddingHall[]> {
  const list = await fetchApi<WeddingHallDto[]>(HALLS);
  return (list ?? []).map(toHall);
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
