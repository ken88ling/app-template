import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/services/apiClient";
import { LoginRequest, AuthResponse, ApiResponse } from "@app/shared-types";

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

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();

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

    // Return user data without tokens
    return NextResponse.json({
      success: true,
      data: {
        user: response.data.user,
        company: response.data.company,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    
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