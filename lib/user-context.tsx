"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "./types";
import { login as apiLogin, getCurrentUser } from "./api/auth";
import { getToken, TOKEN_KEY } from "./api/client";
import { toUserFriendlyMessage, ApiError } from "./utils/api-error";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isEditor: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      // 401 hatası normal - token geçersiz/yok, sessizce handle et
      const isUnauthorized = 
        error instanceof ApiError && error.status === 401;
      
      // Token'ı temizle (401 veya diğer hatalar için)
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(TOKEN_KEY);
      }
      setUser(null);
      
      // 401 dışındaki hataları logla
      if (!isUnauthorized) {
        console.error("Error loading user:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiLogin(email, password);
        if (!res.success || !res.token) {
          const msg = res.message ?? "Giriş başarısız.";
          toast.error(msg);
          throw new Error(msg);
        }
        if (typeof window !== "undefined") {
          sessionStorage.setItem(TOKEN_KEY, res.token);
        }
        await loadUser();
        router.push("/dashboard");
      } catch (err) {
        const msg = toUserFriendlyMessage(err);
        toast.error(msg);
        throw err;
      }
    },
    [loadUser, router]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    setUser(null);
    router.push("/");
  }, [router]);

  const role = user?.role ?? null;
  const isAuthenticated = user !== null;
  const isEditor = role === "Editor";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isEditor,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
