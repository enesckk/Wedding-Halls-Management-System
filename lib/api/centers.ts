import { fetchApi } from "./base";

const CENTERS = "/api/v1/centers";

export interface Center {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface CenterSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: number; // 0=Available, 1=Reserved
  eventType?: number;
  eventName?: string;
  eventOwner?: string;
}

export interface HallWithSchedules {
  id: string;
  name: string;
  address: string;
  capacity: number;
  description: string;
  imageUrl: string;
  technicalDetails: string;
  schedules: CenterSchedule[];
}

export interface CenterDetail {
  id: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  halls: HallWithSchedules[];
}

export async function getCenterById(id: string): Promise<Center | null> {
  try {
    const center = await fetchApi<Center>(`${CENTERS}/${id}`);
    return center;
  } catch (error) {
    console.error("Error fetching center:", error);
    return null;
  }
}

export async function getCenterDetail(id: string): Promise<CenterDetail | null> {
  try {
    const detail = await fetchApi<CenterDetail>(`${CENTERS}/${id}/detail`);
    return detail;
  } catch (error) {
    console.error("Error fetching center detail:", error);
    return null;
  }
}

export async function getCenters(): Promise<Center[]> {
  try {
    const centers = await fetchApi<Center[]>(CENTERS);
    return centers || [];
  } catch (error) {
    console.error("Error fetching centers:", error);
    return [];
  }
}

export type CreateCenterData = {
  name: string;
  address: string;
  description: string;
  imageUrl: string;
};

export type UpdateCenterData = CreateCenterData;

export async function createCenter(data: CreateCenterData): Promise<Center> {
  const requestBody = {
    name: data.name || "",
    address: data.address || "",
    description: data.description || "",
    imageUrl: data.imageUrl || "",
  };
  
  console.log("Creating center:", { url: CENTERS, method: "POST", body: requestBody });
  
  const center = await fetchApi<Center>(CENTERS, {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
  return center;
}

export async function updateCenter(id: string, data: UpdateCenterData): Promise<Center> {
  const center = await fetchApi<Center>(`${CENTERS}/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name || "",
      address: data.address || "",
      description: data.description || "",
      imageUrl: data.imageUrl || "",
    }),
  });
  return center;
}

export async function deleteCenter(id: string): Promise<void> {
  await fetchApi<void>(`${CENTERS}/${id}`, { method: "DELETE" });
}
