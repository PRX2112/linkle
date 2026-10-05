import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { after } from "next/server";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, linkId, linkType, linkTitle, url, referrer } = body;

    if (!userId || !linkId || !linkType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Exclude owner's clicks from analytics pollution
    const session = await auth();
    const isOwner = session?.user?.id === userId;

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

    const { extractUtmParams } = await import("@/lib/utm");
    const utm = extractUtmParams(url);

    // Defer the database insert to run asynchronously after response is sent
    after(async () => {
      if (isOwner) return;
      try {
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

        await prisma.analyticsEvent.create({
          data: {
            userId,
            eventType: linkType === "contact" ? "CONTACT_SAVE" : "LINK_CLICK",
            targetId: linkId,
            targetType: linkType,
            targetTitle: linkTitle || linkType,
            url: url || "",
            referrer: referrer || "Direct",
            device,
            country,
            utmSource: utm.utmSource || null,
            utmMedium: utm.utmMedium || null,
            utmCampaign: utm.utmCampaign || null,
            utmContent: utm.utmContent || null,
            utmTerm: utm.utmTerm || null,
            metadata: utm.utmEnabled ? {
              ...(utm.utmSource ? { utm_source: utm.utmSource } : {}),
              ...(utm.utmMedium ? { utm_medium: utm.utmMedium } : {}),
              ...(utm.utmCampaign ? { utm_campaign: utm.utmCampaign } : {}),
              ...(utm.utmContent ? { utm_content: utm.utmContent } : {}),
              ...(utm.utmTerm ? { utm_term: utm.utmTerm } : {}),
            } : undefined,
          },
        });
      } catch (err) {
        console.error("Delayed analytics click tracking failed:", err);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics click tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

