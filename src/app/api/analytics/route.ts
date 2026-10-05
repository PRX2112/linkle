import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  AnalyticsDateRange,
  ConversionMetrics,
  FunnelStage,
  PeriodComparison,
  TrafficSourceItem,
  UtmAnalyticsReport,
  UtmCampaignReportItem,
  UtmDimensionReportItem,
} from "@/lib/analytics/events";
import { extractUtmParams } from "@/lib/utm";
import { getEffectiveUserPlan, hasEntitlement } from "@/lib/billing/entitlements";

// Referrer normalizer function to categorize traffic sources
function normalizeReferrer(ref?: string | null): string {
  if (!ref || ref === "Direct" || ref === "" || ref.includes("localhost") || ref.includes("127.0.0.1")) {
    return "Direct / Bio Link";
  }
  const lower = ref.toLowerCase();
  if (lower.includes("instagram.com")) return "Instagram";
  if (lower.includes("t.co") || lower.includes("twitter.com") || lower.includes("x.com")) return "Twitter / X";
  if (lower.includes("tiktok.com")) return "TikTok";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
  if (lower.includes("facebook.com") || lower.includes("fb.com")) return "Facebook";
  if (lower.includes("google.")) return "Google Search";
  if (lower.includes("whatsapp") || lower.includes("wa.me")) return "WhatsApp";
  if (lower.includes("reddit.com")) return "Reddit";
  if (lower.includes("pinterest.com")) return "Pinterest";
  
  try {
    const url = new URL(ref.startsWith("http") ? ref : `https://${ref}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Other";
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(request.url);
    const requestedRange = (url.searchParams.get("range") || "14d") as AnalyticsDateRange;

    // Server-side entitlement check: Starter users are restricted to 7-day analytics
    const effectivePlan = await getEffectiveUserPlan(userId);
    const hasAdvancedAnalytics = hasEntitlement(effectivePlan.plan, "advancedAnalytics");

    const rangeParam: AnalyticsDateRange =
      !hasAdvancedAnalytics && requestedRange !== "7d" ? "7d" : requestedRange;

    const daysMap: Record<AnalyticsDateRange, number> = {
      "7d": 7,
      "14d": 14,
      "30d": 30,
      "90d": 90,
    };
    const days = daysMap[rangeParam] || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Compute previous equivalent period window
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    // Fetch unified AnalyticsEvents and legacy records in parallel for current and previous periods
    const [
      events,
      legacyViews,
      legacyClicks,
      legacySubscribers,
      prevEvents,
      prevLegacyViews,
      prevLegacyClicks,
    ] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: {
          eventType: true,
          visitorId: true,
          targetId: true,
          targetType: true,
          targetTitle: true,
          url: true,
          referrer: true,
          device: true,
          country: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          utmTerm: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.profileView.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: {
          visitorId: true,
          referrer: true,
          device: true,
          country: true,
          createdAt: true,
        },
      }),
      prisma.clickEvent.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        select: {
          linkId: true,
          linkType: true,
          linkTitle: true,
          referrer: true,
          device: true,
          country: true,
          createdAt: true,
        },
      }),
      prisma.capturedEmail.count({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      // Previous period queries
      prisma.analyticsEvent.findMany({
        where: {
          userId,
          createdAt: { gte: prevStartDate, lt: startDate },
        },
        select: {
          eventType: true,
          visitorId: true,
        },
      }),
      prisma.profileView.findMany({
        where: {
          userId,
          createdAt: { gte: prevStartDate, lt: startDate },
        },
        select: {
          visitorId: true,
        },
      }),
      prisma.clickEvent.findMany({
        where: {
          userId,
          createdAt: { gte: prevStartDate, lt: startDate },
        },
        select: {
          linkId: true,
        },
      }),
    ]);

    // Compute Profile Views (take max between unified events and legacy views to avoid undercounting)
    const eventViews = events.filter((e) => e.eventType === "PROFILE_VIEW");
    const totalViews = Math.max(eventViews.length, legacyViews.length);

    // Compute Clicks
    const eventClicks = events.filter(
      (e) => e.eventType === "LINK_CLICK" || e.eventType === "CTA_CLICK" || e.eventType === "PAYMENT_CLICK"
    );
    const totalClicks = Math.max(eventClicks.length, legacyClicks.length);

    // Click Through Rate (CTR)
    const ctr = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(1)) : 0;

    // Email Conversions
    const emailEventsCount = events.filter((e) => e.eventType === "EMAIL_SUBSCRIBE").length;
    const totalEmailConversions = Math.max(emailEventsCount, legacySubscribers);
    const emailConversionRate = totalViews > 0 ? Number(((totalEmailConversions / totalViews) * 100).toFixed(1)) : 0;

    // UPI Interactions
    const upiOpenCount = events.filter((e) => e.eventType === "UPI_OPEN").length;
    const upiCopyCount = events.filter((e) => e.eventType === "UPI_COPY").length;
    const totalUpiInteractions = upiOpenCount + upiCopyCount;

    // Profile Shares
    const profileShares = events.filter((e) => e.eventType === "PROFILE_SHARE").length;

    // Contact Actions (vCard save + bookings)
    const contactSaveCount = events.filter((e) => e.eventType === "CONTACT_SAVE").length;
    const bookingClickCount = events.filter((e) => e.eventType === "BOOKING_CLICK").length;
    const totalContactActions = contactSaveCount + bookingClickCount;

    // QR Interactions
    const qrViewCount = events.filter((e) => e.eventType === "QR_VIEW").length;
    const qrDownloadCount = events.filter((e) => e.eventType === "QR_DOWNLOAD").length;

    // Unique Visitors
    const uniqueVisitorIds = new Set<string>();
    events.forEach((e) => {
      if (e.visitorId) uniqueVisitorIds.add(e.visitorId);
    });
    legacyViews.forEach((v) => {
      if (v.visitorId) uniqueVisitorIds.add(v.visitorId);
    });
    const uniqueVisitors = uniqueVisitorIds.size || (totalViews > 0 ? Math.ceil(totalViews * 0.7) : 0);

    // Compute Previous Period Comparison Metrics
    const prevEventViews = prevEvents.filter((e) => e.eventType === "PROFILE_VIEW");
    const prevTotalViews = Math.max(prevEventViews.length, prevLegacyViews.length);

    const prevEventClicks = prevEvents.filter(
      (e) => e.eventType === "LINK_CLICK" || e.eventType === "CTA_CLICK" || e.eventType === "PAYMENT_CLICK"
    );
    const prevTotalClicks = Math.max(prevEventClicks.length, prevLegacyClicks.length);
    const prevCtr = prevTotalViews > 0 ? Number(((prevTotalClicks / prevTotalViews) * 100).toFixed(1)) : 0;

    const prevVisitorIds = new Set<string>();
    prevEvents.forEach((e) => {
      if (e.visitorId) prevVisitorIds.add(e.visitorId);
    });
    prevLegacyViews.forEach((v) => {
      if (v.visitorId) prevVisitorIds.add(v.visitorId);
    });
    const prevUniqueVisitors = prevVisitorIds.size || (prevTotalViews > 0 ? Math.ceil(prevTotalViews * 0.7) : 0);

    const calcPctChange = (curr: number, prev: number): number | null => {
      if (prev === 0 && curr === 0) return null;
      if (prev === 0) return curr > 0 ? 100 : null;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const comparison: PeriodComparison = {
      viewsChangePct: calcPctChange(totalViews, prevTotalViews),
      clicksChangePct: calcPctChange(totalClicks, prevTotalClicks),
      ctrChangePct: (prevTotalViews > 0 && totalViews > 0) ? Number((ctr - prevCtr).toFixed(1)) : null,
      visitorsChangePct: calcPctChange(uniqueVisitors, prevUniqueVisitors),
      previousPeriod: {
        views: prevTotalViews,
        clicks: prevTotalClicks,
        ctr: prevCtr,
        visitors: prevUniqueVisitors,
      },
    };

    // Conversion Metrics Object
    const conversionMetrics: ConversionMetrics = {
      profileViews: totalViews,
      totalClicks,
      ctr,
      emailConversion: {
        count: totalEmailConversions,
        rate: emailConversionRate,
      },
      upiInteractions: {
        total: totalUpiInteractions,
        opened: upiOpenCount,
        copied: upiCopyCount,
      },
      profileShares,
      contactActions: {
        total: totalContactActions,
        saved: contactSaveCount,
        bookings: bookingClickCount,
      },
      qrInteractions: {
        viewed: qrViewCount,
        downloaded: qrDownloadCount,
      },
    };

    // 3-Stage Conversion Funnel:
    // Stage 1: Views (Top of Funnel - 100%)
    // Stage 2: Engaged Visitors (Any Click, QR view, or UPI open)
    // Stage 3: High-Intent Conversions (Subscribed, UPI copied, Contact saved, Booking, Shared)
    const engagedCount = Math.min(
      totalViews,
      totalClicks + upiOpenCount + qrViewCount
    );
    const convertedCount = Math.min(
      totalViews,
      totalEmailConversions + upiCopyCount + totalContactActions + profileShares + qrDownloadCount
    );

    const funnel: FunnelStage[] = [
      {
        name: "Profile Impressions",
        description: "Visitors who arrived on your Linkle profile",
        count: totalViews,
        percentage: 100,
        dropoffPercentage: 0,
      },
      {
        name: "Content Interactions",
        description: "Clicked link blocks, opened UPI, or viewed QR",
        count: engagedCount,
        percentage: totalViews > 0 ? Number(((engagedCount / totalViews) * 100).toFixed(1)) : 0,
        dropoffPercentage: totalViews > 0 ? Math.max(0, Number((100 - (engagedCount / totalViews) * 100).toFixed(1))) : 0,
      },
      {
        name: "High-Intent Conversions",
        description: "Subscribed to email, copied UPI, booked, or shared",
        count: convertedCount,
        percentage: totalViews > 0 ? Number(((convertedCount / totalViews) * 100).toFixed(1)) : 0,
        dropoffPercentage: engagedCount > 0 ? Math.max(0, Number((100 - (convertedCount / engagedCount) * 100).toFixed(1))) : 0,
      },
    ];

    // Traffic Sources Breakdown
    const referrersMap: Record<string, number> = {};
    const countReferrer = (ref?: string | null) => {
      const source = normalizeReferrer(ref);
      referrersMap[source] = (referrersMap[source] || 0) + 1;
    };

    if (events.length > 0) {
      events.forEach((e) => countReferrer(e.referrer));
    } else {
      legacyViews.forEach((v) => countReferrer(v.referrer));
    }

    const totalReferrerCount = Object.values(referrersMap).reduce((a, b) => a + b, 0) || 1;
    const trafficSources: TrafficSourceItem[] = Object.entries(referrersMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / totalReferrerCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Device breakdown
    const devicesMap: Record<string, number> = {};
    const countDevice = (device?: string | null) => {
      const label = device || "Desktop";
      devicesMap[label] = (devicesMap[label] || 0) + 1;
    };
    if (events.length > 0) {
      events.forEach((e) => countDevice(e.device));
    } else {
      legacyViews.forEach((v) => countDevice(v.device));
    }
    const totalDeviceCount = Object.values(devicesMap).reduce((a, b) => a + b, 0) || 1;
    const devices = Object.entries(devicesMap).map(([label, count]) => ({
      label,
      value: Math.round((count / totalDeviceCount) * 100),
    }));

    // Country breakdown
    const countriesMap: Record<string, number> = {};
    const countCountry = (country?: string | null) => {
      const name = country || "Unknown";
      countriesMap[name] = (countriesMap[name] || 0) + 1;
    };
    if (events.length > 0) {
      events.forEach((e) => countCountry(e.country));
    } else {
      legacyViews.forEach((v) => countCountry(v.country));
    }
    const totalCountryCount = Object.values(countriesMap).reduce((a, b) => a + b, 0) || 1;
    const countries = Object.entries(countriesMap)
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / totalCountryCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Top Clicked Links
    const linksMap: Record<string, { name: string; clicks: number }> = {};
    if (eventClicks.length > 0) {
      eventClicks.forEach((e) => {
        const key = e.targetId || e.targetTitle || "link";
        const title = e.targetTitle || "Link";
        if (!linksMap[key]) {
          linksMap[key] = { name: title, clicks: 0 };
        }
        linksMap[key].clicks++;
      });
    } else {
      legacyClicks.forEach((c) => {
        const key = c.linkId || c.linkTitle;
        const title = c.linkTitle || c.linkType;
        if (!linksMap[key]) {
          linksMap[key] = { name: title, clicks: 0 };
        }
        linksMap[key].clicks++;
      });
    }

    const topLinksRaw = Object.values(linksMap).sort((a, b) => b.clicks - a.clicks).slice(0, 5);
    const totalClicksOnTop = topLinksRaw.reduce((a, b) => a + b.clicks, 0) || 1;
    const topLinks = topLinksRaw.map((l) => ({
      name: l.name,
      clicks: l.clicks,
      pct: Math.round((l.clicks / totalClicksOnTop) * 100),
    }));

    // Daily Performance Chart (Filtered across selected days)
    const dailyData: Record<string, { dateStr: string; clicks: number; views: number; conversions: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyData[dateKey] = { dateStr: label, clicks: 0, views: 0, conversions: 0 };
    }

    // Populate daily counts from events
    if (events.length > 0) {
      events.forEach((e) => {
        const dateKey = e.createdAt.toISOString().slice(0, 10);
        if (dailyData[dateKey]) {
          if (e.eventType === "PROFILE_VIEW") {
            dailyData[dateKey].views++;
          } else if (e.eventType === "LINK_CLICK" || e.eventType === "CTA_CLICK" || e.eventType === "PAYMENT_CLICK") {
            dailyData[dateKey].clicks++;
          } else if (
            e.eventType === "EMAIL_SUBSCRIBE" ||
            e.eventType === "UPI_COPY" ||
            e.eventType === "CONTACT_SAVE" ||
            e.eventType === "BOOKING_CLICK" ||
            e.eventType === "PROFILE_SHARE"
          ) {
            dailyData[dateKey].conversions++;
          }
        }
      });
    } else {
      legacyViews.forEach((v) => {
        const dateKey = v.createdAt.toISOString().slice(0, 10);
        if (dailyData[dateKey]) dailyData[dateKey].views++;
      });
      legacyClicks.forEach((c) => {
        const dateKey = c.createdAt.toISOString().slice(0, 10);
        if (dailyData[dateKey]) dailyData[dateKey].clicks++;
      });
    }

    const sortedDaily = Object.keys(dailyData)
      .sort()
      .map((key) => dailyData[key]);

    // UTM Campaign Analytics Aggregation
    const campaignsMap: Record<string, { campaign: string; source?: string | null; medium?: string | null; clicks: number }> = {};
    const utmSourcesMap: Record<string, number> = {};
    const utmMediumsMap: Record<string, number> = {};

    let totalCampaignClicks = 0;

    events.forEach((e) => {
      // Direct UTM fields or fallback to URL query parameters
      const urlUtm = e.url ? extractUtmParams(e.url) : null;
      const cCampaign = e.utmCampaign || urlUtm?.utmCampaign;
      const cSource = e.utmSource || urlUtm?.utmSource;
      const cMedium = e.utmMedium || urlUtm?.utmMedium;

      if (cCampaign || cSource || cMedium) {
        totalCampaignClicks++;

        // Group by campaign
        const campKey = (cCampaign || "Unassigned").toLowerCase();
        if (!campaignsMap[campKey]) {
          campaignsMap[campKey] = {
            campaign: cCampaign || "Unassigned",
            source: cSource || null,
            medium: cMedium || null,
            clicks: 0,
          };
        }
        campaignsMap[campKey].clicks++;

        // Group by source
        if (cSource) {
          const srcKey = cSource.toLowerCase();
          utmSourcesMap[srcKey] = (utmSourcesMap[srcKey] || 0) + 1;
        }

        // Group by medium
        if (cMedium) {
          const medKey = cMedium.toLowerCase();
          utmMediumsMap[medKey] = (utmMediumsMap[medKey] || 0) + 1;
        }
      }
    });

    const campaigns: UtmCampaignReportItem[] = Object.values(campaignsMap)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((c) => ({
        campaign: c.campaign,
        source: c.source,
        medium: c.medium,
        clicks: c.clicks,
        pct: totalCampaignClicks > 0 ? Math.round((c.clicks / totalCampaignClicks) * 100) : 0,
      }));

    const utmSources: UtmDimensionReportItem[] = Object.entries(utmSourcesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, clicks]) => ({
        name,
        clicks,
        pct: totalCampaignClicks > 0 ? Math.round((clicks / totalCampaignClicks) * 100) : 0,
      }));

    const utmMediums: UtmDimensionReportItem[] = Object.entries(utmMediumsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, clicks]) => ({
        name,
        clicks,
        pct: totalCampaignClicks > 0 ? Math.round((clicks / totalCampaignClicks) * 100) : 0,
      }));

    const utmReport: UtmAnalyticsReport = {
      campaigns,
      sources: utmSources,
      mediums: utmMediums,
      totalCampaignClicks,
    };

    return NextResponse.json({
      range: rangeParam,
      stats: [
        { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: "click" },
        { label: "Unique Visitors", value: uniqueVisitors.toLocaleString(), icon: "visitor" },
        { label: "Profile Views", value: totalViews.toLocaleString(), icon: "view" },
        { label: "Countries Connected", value: countries.length.toLocaleString(), icon: "globe" },
      ],
      uniqueVisitors,
      conversionMetrics,
      funnel,
      trafficSources,
      utmReport,
      topLinks,
      devices,
      countries,
      dailyChart: sortedDaily,
      comparison,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
