import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  
  // Clear authentication cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  
  return NextResponse.json({ message: "Cookies cleared" });
}