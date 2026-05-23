export const dynamic = "force-static";
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({
      success: true,
      message: "Successfully logged out"
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Failed to logout safely" }, { status: 500 });
  }
}
