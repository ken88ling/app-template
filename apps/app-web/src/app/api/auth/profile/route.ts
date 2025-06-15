import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/services/apiClient";
import { IUserPublic, ApiResponse } from "@app/shared-types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken) {
      return NextResponse.json(
        { error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Use the same apiClient with auth header
    const response = await apiClient.get<ApiResponse<IUserPublic>>("/auth/profile", {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    // The interceptor returns response.data, so response is already ApiResponse<IUserPublic>
    const data = response as unknown as ApiResponse<IUserPublic>;

    if (!data.success || !data.data) {
      return NextResponse.json(
        { error: { message: "Failed to get profile" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: data.data },
    });
  } catch (error) {
    const err = error as { message?: string; status?: number; code?: string };
    
    // If token is invalid, clear cookies
    if (err.status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
    }

    return NextResponse.json(
      { 
        error: { 
          message: err.message || "Failed to get profile",
          code: err.code 
        } 
      },
      { status: err.status || 500 }
    );
  }
}