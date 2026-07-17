import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { UserSettingsSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = UserSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, displayName } = validation.data;
    const trimmedUsername = username.trim().toLowerCase();

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

    const oldUsername = session.user.username;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: trimmedUsername,
        displayName: displayName !== undefined ? displayName : undefined
      }
    });

    revalidateProfile(oldUsername);
    revalidateProfile(updatedUser.username);

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
    const oldUsername = session.user.username;

    // Delete the user record (Prisma onDelete Cascade handles cascade deletions of accounts, sessions, links, etc.)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    revalidateProfile(oldUsername);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

