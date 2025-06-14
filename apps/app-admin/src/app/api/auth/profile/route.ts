import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { UserRole } from "@app/shared-types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

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

    // Forward request to backend with token
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, clear cookies
      if (response.status === 401) {
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        cookieStore.delete("adminRole");
      }

      return NextResponse.json(
        { error: data.error || { message: "Failed to get profile" } },
        { status: response.status }
      );
    }

    // Double-check admin role from backend response
    if (
      data.data.role !== UserRole.MANAGER &&
      data.data.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        { error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { user: data.data } 
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
