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

// Mock users for development when backend is not available
const MOCK_USERS: Record<string, { password: string; id: string; name: string; role: "Viewer" | "Editor" }> = {
  "viewer@nikahsalon.local": {
    password: "Viewer1!",
    id: "mock-viewer-1",
    name: "Viewer User",
    role: "Viewer",
  },
  "editor@nikahsalon.local": {
    password: "Editor1!",
    id: "mock-editor-1",
    name: "Editor User",
    role: "Editor",
  },
};

async function mockLogin(email: string, password: string): Promise<LoginResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = MOCK_USERS[email.toLowerCase()];
  if (!user || user.password !== password) {
    return {
      success: false,
      message: "Geçersiz e-posta veya şifre.",
    };
  }

  // Generate a mock JWT-like token
  const mockToken = `mock-token-${btoa(JSON.stringify({ userId: user.id, email, role: user.role }))}`;

  return {
    success: true,
    token: mockToken,
    userId: user.id,
    email: email.toLowerCase(),
    role: user.role,
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const result = await fetchApi<LoginResult>(`${AUTH}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    return result;
  } catch (error) {
    // Only use mock login for actual network errors, not API errors (400, 401, etc.)
    if (
      error instanceof Error &&
      error.name === "NetworkError"
    ) {
      console.warn("Backend API not available, using mock authentication");
      return mockLogin(email, password);
    }
    // Re-throw API errors (400, 401, 500, etc.) as-is
    throw error;
  }
}

async function mockGetCurrentUser(): Promise<User> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  if (!token || !token.startsWith("mock-token-")) {
    throw new Error("Unauthorized");
  }

  try {
    const payload = JSON.parse(atob(token.replace("mock-token-", "")));
    return {
      id: payload.userId,
      name: payload.role === "Viewer" ? "Viewer User" : "Editor User",
      email: payload.email,
      role: payload.role as User["role"],
    };
  } catch {
    throw new Error("Invalid token");
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const d = await fetchApi<UserInfoDto>(`${AUTH}/me`);
    return toUser(d);
  } catch (error) {
    // Only use mock user for actual network errors, not auth errors (401, etc.)
    if (
      error instanceof Error &&
      error.name === "NetworkError"
    ) {
      console.warn("Backend API not available, using mock user data");
      return mockGetCurrentUser();
    }
    // Re-throw auth errors (401, etc.) as-is
    throw error;
  }
}

/** @deprecated Use getCurrentUser. Kept for backward compatibility. */
export const getMe = getCurrentUser;
