import { fetchApi } from "./base";
import type { Request } from "@/lib/types";

const REQUESTS = "/api/v1/requests";

type RequestDto = {
  id: string;
  weddingHallId: string;
  createdByUserId: string;
  message: string;
  status: number;
  createdAt: string;
  eventType: number;
  eventName: string;
  eventOwner: string;
  eventDate: string;
  eventTime: string;
};

function toRequest(d: RequestDto): Request {
  return {
    id: d.id,
    weddingHallId: d.weddingHallId,
    createdByUserId: d.createdByUserId,
    message: d.message,
    status: d.status === 1 ? "Answered" : "Pending",
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

export async function getRequests(): Promise<Request[]> {
  const list = await fetchApi<RequestDto[]>(REQUESTS);
  return (list ?? []).map(toRequest);
}

export async function answerRequest(id: string): Promise<Request> {
  const d = await fetchApi<RequestDto>(`${REQUESTS}/${id}/answer`, {
    method: "PUT",
  });
  return toRequest(d);
}
