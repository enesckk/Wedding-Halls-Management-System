"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "./types";
import { users } from "./data";

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = sessionStorage.getItem("demoUserId");
    if (id) {
      const u = users.find((x) => x.id === id);
      if (u) setCurrentUser(u);
    }
  }, []);

  const isAdmin = currentUser.role === "admin";

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAdmin }}>
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
