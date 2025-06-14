"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/authService";
import { IUserPublic, RegisterRequest } from "@app/shared-types";

// Create context without explicit type definition to avoid unused warnings
const AuthContext = createContext<ReturnType<typeof useAuthProvider> | undefined>(undefined);

// Custom hook that provides auth functionality
const useAuthProvider = () => {
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Try to get user profile - cookies will be sent automatically
      const userProfile = await authService.getProfile();

      if (userProfile && userProfile.id) {
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch {
      // User is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure cookies are available after hydration
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const authData = await authService.login({ email, password });
      setUser(authData.user);
      router.push("/");
    } catch (error) {
      const err = error as { message?: string };
      throw new Error(err.message || "Invalid email or password");
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      const authData = await authService.register(data);
      setUser(authData.user);
      router.push("/");
    } catch (error: any) {
      // Pass through the full error structure including details
      throw error;
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  return useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      refreshAuth
    }),
    [user, isLoading, login, logout, register, refreshAuth]
  );
};

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
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
