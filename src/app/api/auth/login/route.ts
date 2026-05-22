import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LoginSchema } from "@/lib/validation";
import { comparePassword } from "@/lib/hash";
import { signJWT, setAuthCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Protection (max 5 login attempts per minute per IP)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitResult = rateLimit(ip, { limit: 5, windowMs: 60 * 1000 }); // 1 Minute
    
    if (!limitResult.success) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${limitResult.reset} seconds.` },
        { status: 429 }
      );
    }

    // 2. Parse and Validate Request body
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid credentials data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { identifier, password, rememberMe } = result.data;

    // 3. Find User by Email or Username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      // generic secure error message to prevent account enumeration attacks
      return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    }

    // 4. Verify password with secure Argon2id
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email/username or password" }, { status: 401 });
    }

    // 5. Sign session token & Set secure HTTP-only Cookie
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName
    };

    const token = await signJWT(sessionPayload, rememberMe);
    await setAuthCookie(token, rememberMe);

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }
    });

  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during login" }, { status: 500 });
  }
}
