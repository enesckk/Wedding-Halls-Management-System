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
  // Debug: Status değerini kontrol et
  console.log("toRequest - raw status:", d.status, typeof d.status);
  
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
  const result = await fetchApi<PagedResult<RequestDto>>(REQUESTS);
  const items = result?.items ?? result?.Items ?? [];
  return Array.isArray(items) ? items.map(toRequest) : [];
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

export async function rejectRequest(id: string): Promise<Request> {
  const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}/reject`, {
    method: "PUT",
  });
  return toRequest(d);
}
