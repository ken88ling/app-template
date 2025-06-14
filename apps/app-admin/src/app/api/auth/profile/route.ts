import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { apiClient } from "@/services/apiClient";
import { IUserAdmin, ApiResponse, UserRole } from "@app/shared-types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");
    const adminRole = cookieStore.get("adminRole");

    console.log("Profile API - Cookies check:", {
      hasAccessToken: !!accessToken,
      hasAdminRole: !!adminRole,
      adminRoleValue: adminRole?.value,
    });

    if (!accessToken) {
      console.log("Profile API - No access token found");
      return NextResponse.json(
        { error: { message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Quick check for admin role
    if (
      !adminRole ||
      (adminRole.value !== UserRole.MANAGER &&
        adminRole.value !== UserRole.SUPER_ADMIN)
    ) {
      return NextResponse.json(
        { error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    // Use the same apiClient with auth header
    const response = await apiClient.get<ApiResponse<IUserAdmin>>("/auth/profile", {
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

    // Double-check admin role from backend response
    if (
      response.data.role !== UserRole.MANAGER &&
      response.data.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        { error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { user: response.data } 
    });
  } catch (error: any) {
    // If token is invalid, clear cookies
    if (error.status === 401) {
      const cookieStore = await cookies();
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      cookieStore.delete("adminRole");
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