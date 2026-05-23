export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { clearResponseAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    // Build response first, then clear the auth cookie on the response object
    // (response.cookies works with force-static; next/headers cookies().delete() does not)
    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out"
    });
    clearResponseAuthCookie(response);
    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json({ error: "Failed to logout safely" }, { status: 500 });
  }
}
