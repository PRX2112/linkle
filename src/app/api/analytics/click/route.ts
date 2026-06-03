import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, linkId, linkType, linkTitle, url, referrer } = body;

    if (!userId || !linkId || !linkType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Detect Device from User-Agent
    const userAgent = request.headers.get("user-agent") || "";
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

    // Record click event
    await prisma.clickEvent.create({
      data: {
        userId,
        linkId,
        linkType,
        linkTitle: linkTitle || linkType,
        url: url || "",
        referrer: referrer || "Direct",
        device,
        country,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics click tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
