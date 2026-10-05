import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { UserSettingsSchema } from "@/lib/validation";
import { revalidateProfile } from "@/lib/cache";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const checkUsername = searchParams.get("checkUsername");

  if (!checkUsername) {
    return NextResponse.json({ error: "Missing checkUsername query parameter" }, { status: 400 });
  }

  const normalized = checkUsername.trim().toLowerCase();

  // Validate format
  if (!/^[a-z0-9_-]{3,20}$/.test(normalized)) {
    return NextResponse.json({
      available: false,
      reason: "Username must be 3-20 characters long using only lowercase letters, numbers, hyphens, and underscores.",
    });
  }

  // Check if it belongs to the current user
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  if (currentUser?.username?.toLowerCase() === normalized) {
    return NextResponse.json({
      available: true,
      isCurrent: true,
      message: "Current username",
    });
  }

  // Check active holder
  const activeHolder = await prisma.user.findFirst({
    where: {
      username: normalized,
      NOT: { id: session.user.id },
    },
    select: { id: true },
  });

  if (activeHolder) {
    return NextResponse.json({
      available: false,
      reason: "This username is already taken.",
    });
  }

  // Check alias holder
  const aliasHolder = await prisma.usernameHistory.findFirst({
    where: {
      username: normalized,
      NOT: { userId: session.user.id },
    },
    select: { id: true },
  });

  if (aliasHolder) {
    return NextResponse.json({
      available: false,
      reason: "This username was previously used by another account and is currently unavailable.",
    });
  }

  return NextResponse.json({
    available: true,
    isCurrent: false,
    message: "Username is available",
  });
}

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

    const currentDbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });

    const oldUsername = currentDbUser?.username?.trim().toLowerCase();

    // If username is changing, perform validation, anti-collision, anti-abuse, and history preservation
    if (trimmedUsername && trimmedUsername !== oldUsername) {
      // 1. Check if another user currently holds this username
      const activeHolder = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { id: session.user.id },
        },
      });

      if (activeHolder) {
        return NextResponse.json(
          { error: "This username is already taken. Please choose another one." },
          { status: 400 }
        );
      }

      // 2. Check if another user holds this username as a historical alias
      const aliasHolder = await prisma.usernameHistory.findFirst({
        where: {
          username: trimmedUsername,
          NOT: { userId: session.user.id },
        },
      });

      if (aliasHolder) {
        return NextResponse.json(
          { error: "This username was previously used by another account and is currently unavailable." },
          { status: 400 }
        );
      }

      // 3. Enforce anti-abuse cooldown (defaults to 24 hours)
      const cooldownHours = parseInt(process.env.USERNAME_CHANGE_COOLDOWN_HOURS || "24", 10);
      if (cooldownHours > 0) {
        const cooldownMs = cooldownHours * 60 * 60 * 1000;
        const lastChange = await prisma.usernameHistory.findFirst({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        });

        if (lastChange && Date.now() - lastChange.createdAt.getTime() < cooldownMs) {
          const remainingHours = Math.ceil((cooldownMs - (Date.now() - lastChange.createdAt.getTime())) / (60 * 60 * 1000));
          return NextResponse.json(
            { error: `Usernames can only be changed once every ${cooldownHours} hours to prevent abuse. Please try again in ${remainingHours} hour${remainingHours > 1 ? "s" : ""}.` },
            { status: 429 }
          );
        }
      }

      // 4. Atomic transaction to preserve old username in history and assign new canonical username
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Archive the old username in history so old URLs permanently redirect to the user
        if (oldUsername) {
          await tx.usernameHistory.upsert({
            where: { username: oldUsername },
            create: { userId: session.user.id, username: oldUsername },
            update: { userId: session.user.id, createdAt: new Date() },
          });
        }

        // If the user is reclaiming a previous alias they previously owned, remove it from aliases
        await tx.usernameHistory.deleteMany({
          where: { userId: session.user.id, username: trimmedUsername },
        });

        // Set the new canonical username
        return tx.user.update({
          where: { id: session.user.id },
          data: {
            username: trimmedUsername,
            displayName: displayName !== undefined ? displayName : undefined,
          },
        });
      });

      if (oldUsername) {
        revalidateProfile(oldUsername);
      }
      revalidateProfile(updatedUser.username);

      return NextResponse.json(updatedUser);
    }

    // If only displayName is being updated
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
      },
    });

    if (updatedUser.username) {
      revalidateProfile(updatedUser.username);
    }

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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldUsername = user.username;

    // If user has an active Stripe subscription, cancel it immediately in Stripe to prevent orphan billing
    const activeSubId = user.subscription?.stripeSubscriptionId || user.stripeSubscriptionId;
    if (activeSubId) {
      try {
        await stripe.subscriptions.cancel(activeSubId);
      } catch (stripeErr: any) {
        console.warn("[ACCOUNT_DELETE] Note: Stripe subscription cancel notice:", stripeErr?.message || stripeErr);
      }
    }

    // Delete the user record (Prisma onDelete Cascade handles cascade deletions of accounts, sessions, links, etc.)
    await prisma.user.delete({
      where: { id: session.user.id }
    });

    if (oldUsername) {
      revalidateProfile(oldUsername);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

