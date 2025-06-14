import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/services/apiClient";
import { LoginRequest, AuthResponse, ApiResponse, UserRole } from "@app/shared-types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Use the same apiClient - it knows we're on server and will call backend directly
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", body);

    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: { message: "Login failed" } },
        { status: 400 }
      );
    }

    // Verify user is an admin or manager
    if (
      response.data.user.role !== UserRole.MANAGER &&
      response.data.user.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        { error: { message: "Access denied. Admin privileges required." } },
        { status: 403 }
      );
    }

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();

    console.log("Login API - Setting cookies for user:", response.data.user.email);

    // Access token - shorter expiry
    cookieStore.set("accessToken", response.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Refresh token - longer expiry
    cookieStore.set("refreshToken", response.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // Admin role cookie for quick checks
    cookieStore.set("adminRole", response.data.user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    console.log("Login API - Cookies set successfully");

    // Return user data without tokens
    return NextResponse.json({
      success: true,
      data: {
        user: response.data.user,
        company: response.data.company,
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    
    return NextResponse.json(
      { 
        error: { 
          message: error.message || "Login failed",
          code: error.code 
        } 
      },
      { status: error.status || 500 }
    );
  }
}