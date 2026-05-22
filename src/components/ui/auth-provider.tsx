"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  profileImage: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (response.ok) {
        let data;
        try {
          data = await response.json();
          setUser(data.user);
        } catch (jsonError) {
          console.error("Failed to parse user session JSON response:", jsonError);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth context refresh error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Auth context logout error:", error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
