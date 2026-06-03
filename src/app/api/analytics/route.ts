import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Total profile views
    const totalViews = await prisma.profileView.count({
      where: { userId },
    });

    // 2. Total outbound clicks
    const totalClicks = await prisma.clickEvent.count({
      where: { userId },
    });

    // 3. Unique visitors
    const uniqueCountResult = await prisma.profileView.findMany({
      where: { userId },
      select: { visitorId: true },
      distinct: ['visitorId'],
    });
    const uniqueVisitors = uniqueCountResult.filter(v => v.visitorId).length;

    // 4. Top Countries
    const countriesGroup = await prisma.profileView.groupBy({
      by: ["country"],
      where: { userId },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
      take: 6,
    });

    const countries = countriesGroup.map((item) => ({
      name: item.country || "Unknown",
      count: item._count._all,
    }));

    // Calculate total count for percentages
    const totalCountryCount = countries.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const countriesWithPct = countries.map(c => ({
      name: c.name,
      pct: Math.round((c.count / totalCountryCount) * 100),
    }));

    // 5. Device breakdown
    const devicesGroup = await prisma.profileView.groupBy({
      by: ["device"],
      where: { userId },
      _count: {
        _all: true,
      },
    });

    const devicesRaw = devicesGroup.map((item) => ({
      label: item.device || "Desktop",
      count: item._count._all,
    }));

    const totalDeviceCount = devicesRaw.reduce((acc, curr) => acc + curr.count, 0) || 1;
    const devices = devicesRaw.map(d => ({
      label: d.label,
      value: Math.round((d.count / totalDeviceCount) * 100),
    }));

    // 6. Top Clicked Links
    const topLinksGroup = await prisma.clickEvent.groupBy({
      by: ["linkId", "linkTitle", "linkType"],
      where: { userId },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          linkId: "desc",
        },
      },
      take: 5,
    });

    const topLinksRaw = topLinksGroup.map((item) => ({
      name: item.linkTitle || item.linkType,
      clicks: item._count._all,
    }));

    const totalClicksOnTop = topLinksRaw.reduce((acc, curr) => acc + curr.clicks, 0) || 1;
    const topLinks = topLinksRaw.map(l => ({
      name: l.name,
      clicks: l.clicks,
      pct: Math.round((l.clicks / totalClicksOnTop) * 100),
    }));

    // 7. Last 14 days chart (Views & Clicks)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 13); // 14 days including today
    startDate.setHours(0, 0, 0, 0);

    const viewsList = await prisma.profileView.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    });

    const clicksList = await prisma.clickEvent.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    });

    // Build the dates index
    const dailyData: Record<string, { dateStr: string; clicks: number; views: number }> = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyData[dateKey] = { dateStr: label, clicks: 0, views: 0 };
    }

    // Populate daily counts
    viewsList.forEach((v) => {
      const dateKey = v.createdAt.toISOString().slice(0, 10);
      if (dailyData[dateKey]) {
        dailyData[dateKey].views++;
      }
    });

    clicksList.forEach((c) => {
      const dateKey = c.createdAt.toISOString().slice(0, 10);
      if (dailyData[dateKey]) {
        dailyData[dateKey].clicks++;
      }
    });

    // Chronological order sorting
    const sortedDaily = Object.keys(dailyData)
      .sort()
      .map((key) => dailyData[key]);

    return NextResponse.json({
      stats: [
        { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: "click" },
        { label: "Unique Visitors", value: uniqueVisitors.toLocaleString(), icon: "visitor" },
        { label: "Profile Views", value: totalViews.toLocaleString(), icon: "view" },
        { label: "Countries Connected", value: countries.length.toLocaleString(), icon: "globe" },
      ],
      countries: countriesWithPct,
      devices,
      topLinks,
      dailyChart: sortedDaily,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
