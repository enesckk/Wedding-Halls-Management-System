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
  };
}

export type CreateRequestData = {
  weddingHallId: string;
  message: string;
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
