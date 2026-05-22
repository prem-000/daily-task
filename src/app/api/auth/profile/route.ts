import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { UpdateProfileSchema } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthUser();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const result = UpdateProfileSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { fullName, username, profileImage } = result.data;

    // Check if username is already taken by another user
    if (username !== session.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username: username,
          NOT: {
            id: session.userId,
          },
        },
      });

      if (usernameExists) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        fullName,
        username,
        profileImage: profileImage || undefined,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        profileImage: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
