import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/hash";
import { signJWT, setAuthCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Protection (max 5 signups per hour per IP)
    const ip = (request as any).ip || request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limitResult = rateLimit(ip, { limit: 5, windowMs: 60 * 60 * 1000 }); // 1 Hour
    
    if (!limitResult.success) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${limitResult.reset} seconds.` },
        { status: 429 }
      );
    }

    // 2. Parse and Validate request body
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { fullName, username, email, password } = result.data;

    // 3. Prevent Duplicate Username or Email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    // 4. Hash Password with secure Argon2id
    const passwordHash = await hashPassword(password);

    // 5. Create User inside DB
    const user = await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        passwordHash,
        profileImage: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
        isVerified: false,
      }
    });

    // 6. Sign session token & Set Secure HTTP-only Cookie
    const sessionPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName
    };

    const token = await signJWT(sessionPayload, false);
    await setAuthCookie(token, false);

    // 7. Return success without exposing the password hash
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Provide more specific error messages for debugging
    let errorMessage = "An unexpected error occurred during registration";
    
    if (error instanceof Error) {
      // Check for common database errors
      if (error.message.includes("connect")) {
        errorMessage = "Database connection failed. Please check your DATABASE_URL configuration.";
      } else if (error.message.includes("PrismaClient")) {
        errorMessage = "Database error. Please ensure Prisma is properly configured and migrations are run.";
      } else if (error.message.includes("JWT_SECRET")) {
        errorMessage = "Authentication configuration error. Please check JWT_SECRET environment variable.";
      } else if (process.env.NODE_ENV === "development") {
        // In development, show the actual error for debugging
        errorMessage = `Registration failed: ${error.message}`;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
