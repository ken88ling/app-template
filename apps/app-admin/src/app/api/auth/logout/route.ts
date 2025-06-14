import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { apiClient } from "@/services/apiClient";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");
    const refreshToken = cookieStore.get("refreshToken");

    // Call backend logout if tokens exist
    if (accessToken && refreshToken) {
      try {
        await apiClient.post("/auth/logout", 
          { refreshToken: refreshToken.value },
          {
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
          }
        );
      } catch {
        // Ignore backend logout errors
      }
    }

    // Clear cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("adminRole");

    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  } catch {
    return NextResponse.json(
      { error: { message: "Logout failed" } },
      { status: 500 }
    );
  }
}