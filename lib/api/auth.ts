import { fetchApi } from "./base";
import type { User } from "@/lib/types";

const AUTH = "/api/v1/auth";

export type LoginResult = {
  success: boolean;
  token?: string;
  userId?: string;
  email?: string;
  role?: string;
  message?: string;
};

type UserInfoDto = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

function toUser(d: UserInfoDto): User {
  return {
    id: d.id,
    name: d.fullName,
    email: d.email,
    role: d.role as User["role"],
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  return fetchApi<LoginResult>(`${AUTH}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function getCurrentUser(): Promise<User> {
  const d = await fetchApi<UserInfoDto>(`${AUTH}/me`);
  return toUser(d);
}

/** @deprecated Use getCurrentUser. Kept for backward compatibility. */
export const getMe = getCurrentUser;
