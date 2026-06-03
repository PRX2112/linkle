import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, displayName } = await req.json();

    // 1. Username uniqueness validation
    if (username !== undefined) {
      const trimmedUsername = username.trim().toLowerCase();
      
      // Username validation regex: 3-20 chars, alphanumeric, _ or -
      const usernameRegex = /^[a-z0-9_-]{3,20}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        return NextResponse.json(
          { error: "Username must be 3-20 characters long and contain only lowercase letters, numbers, hyphens (-), or underscores (_)." },
          { status: 400 }
        );
      }

      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { id: session.user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "This username is already taken. Please choose another one." },
          { status: 400 }
        );
      }

      // Update username and display name
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          username: trimmedUsername,
          displayName: displayName !== undefined ? displayName : undefined
        }
      });

      return NextResponse.json(updatedUser);
    }

    // If only updating other details
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Failed to update user settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the user record (Prisma onDelete Cascade handles cascade deletions of accounts, sessions, links, etc.)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
