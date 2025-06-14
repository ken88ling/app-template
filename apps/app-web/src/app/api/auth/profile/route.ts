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

    if (!response.success || !response.data) {
      return NextResponse.json(
        { error: { message: "Failed to get profile" } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: response.data },
    });
  } catch (error: any) {
    // If token is invalid, clear cookies
    if (error.status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
    }

    return NextResponse.json(
      { 
        error: { 
          message: error.message || "Failed to get profile",
          code: error.code 
        } 
      },
      { status: error.status || 500 }
    );
  }
}