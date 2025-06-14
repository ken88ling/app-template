import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear authentication cookies
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    
    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    return NextResponse.json(
      { error: { message: "Logout failed" } },
      { status: 500 }
    );
  }
}