import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { after } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    // Detect & ignore Bots/Crawlers early to save resources
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /bot|crawl|spider|slurp|tracker|lighthouse|inspect/i.test(userAgent);
    if (isBot) {
      return NextResponse.json({ success: true, message: "Bot view filtered" });
    }

    const body = await request.json();
    const { username, referrer, visitorId } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Find user by username to get their ID synchronously (to validate profile exists)
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Exclude owner's self-views from analytics pollution
    const session = await auth();
    const isOwner = session?.user?.id === user.id;

    let device = "Desktop";
    if (/mobile/i.test(userAgent)) {
      device = "Mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = "Tablet";
    }

    // Detect Country from edge provider headers
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      "Unknown";

    // Defer the database insert to run asynchronously after response is sent
    after(async () => {
      if (isOwner) return;
      try {
        await prisma.profileView.create({
          data: {
            userId: user.id,
            visitorId: visitorId || null,
            referrer: referrer || "Direct",
            device,
            country,
          },
        });
      } catch (err) {
        console.error("Delayed analytics view tracking failed:", err);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics view tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

