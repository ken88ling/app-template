"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import authService, { User } from "@/services/authService";
import { UserRole } from "@app/shared-types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth();
    }
  }, [hasCheckedAuth]);

  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");
      const user = await authService.getProfile();
      console.log("Auth check successful, user:", user);

      // Verify admin role
      if (
        user.role !== UserRole.MANAGER &&
        user.role !== UserRole.SUPER_ADMIN
      ) {
        console.log("User role check failed:", user.role);
        throw new Error("Admin access required");
      }

      setUser(user);
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log("Attempting login for:", credentials.email);
      const authData = await authService.login(credentials);
      console.log("Login successful, user data:", authData.user);

      // Verify admin role
      if (
        authData.user.role !== UserRole.MANAGER &&
        authData.user.role !== UserRole.SUPER_ADMIN
      ) {
        console.log("Admin role check failed:", authData.user.role);
        throw new Error("Admin access required");
      }

      // Set user state and mark as checked
      setUser(authData.user);
      setHasCheckedAuth(true);
      console.log("User state set, login successful");
    } catch (error) {
      console.error("Login error:", error);
      const err = error as { message?: string };
      throw new Error(err.message || "Invalid credentials");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      setHasCheckedAuth(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
