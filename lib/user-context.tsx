"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "./types";
import { getCurrentUser } from "./api/auth";
import { getToken, TOKEN_KEY } from "./api/client";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isEditor: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(TOKEN_KEY);
      }
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const isEditor = currentUser?.role === "Editor";

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isEditor,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
