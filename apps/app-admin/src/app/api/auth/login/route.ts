import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/services/apiClient";
import { LoginRequest, AuthResponse, AdminAuthResponse, IUserAdmin, ApiResponse, UserRole } from "@app/shared-types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Use the same apiClient - it knows we're on server and will call backend directly
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", body);

    // The interceptor returns response.data, so response is already ApiResponse<AuthResponse>
    const data = response as unknown as ApiResponse<AuthResponse>;

    if (!data.success || !data.data) {
      return NextResponse.json(
        { error: { message: "Login failed" } },
        { status: 400 }
      );
    }

    // Verify user is an admin or manager
    if (
      data.data.user.role !== UserRole.MANAGER &&
      data.data.user.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        { error: { message: "Access denied. Admin privileges required." } },
        { status: 403 }
      );
    }

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();

    console.log("Login API - Setting cookies for user:", data.data.user.email);

    // Access token - shorter expiry
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Refresh token - longer expiry
    cookieStore.set("refreshToken", data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Admin role cookie for quick checks
    cookieStore.set("adminRole", data.data.user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    console.log("Login API - Cookies set successfully");

    // Return user data without tokens, using AdminAuthResponse format
    const adminResponse: AdminAuthResponse = {
      user: data.data.user as IUserAdmin,
      company: undefined // Add company data if available from backend
    };
    
    return NextResponse.json({
      success: true,
      data: adminResponse,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    
    const err = error as { message?: string; status?: number; code?: string };
    
    return NextResponse.json(
      { 
        error: { 
          message: err.message || "Login failed",
          code: err.code 
        } 
      },
      { status: err.status || 500 }
    );
  }
}