import { fetchApi } from "./base";

const REQUESTS = "/api/v1/requests";

export type MessageDto = {
  id: string;
  requestId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
};

export type CreateMessageData = {
  content: string;
};

export async function getMessagesByRequestId(requestId: string): Promise<MessageDto[]> {
  const list = await fetchApi<MessageDto[]>(`${REQUESTS}/${requestId}/messages`);
  return list ?? [];
}

export async function createMessage(requestId: string, data: CreateMessageData): Promise<MessageDto> {
  return fetchApi<MessageDto>(`${REQUESTS}/${requestId}/messages`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
