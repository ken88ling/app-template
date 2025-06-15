import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/services/apiClient";
import { RegisterRequest, AuthResponse, ApiResponse } from "@app/shared-types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    // Use the same apiClient - it knows we're on server and will call backend directly
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", body);

    // The interceptor returns response.data, so response is already ApiResponse<AuthResponse>
    const data = response as unknown as ApiResponse<AuthResponse>;

    if (!data.success || !data.data) {
      return NextResponse.json(
        { error: { message: "Registration failed" } },
        { status: 400 }
      );
    }

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();

    // Access token
    cookieStore.set("accessToken", data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Refresh token
    cookieStore.set("refreshToken", data.data.refreshToken, {
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
        user: data.data.user,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    const err = error as { message?: string; status?: number; code?: string };
    
    return NextResponse.json(
      { 
        error: { 
          message: err.message || "Registration failed",
          code: err.code 
        } 
      },
      { status: err.status || 500 }
    );
  }
}