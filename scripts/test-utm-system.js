/**
 * Test script for Linkle UTM Campaign Tracking System.
 * Tests:
 * 1. Safe UTM URL generation, parameter preservation, escaping, unsafe scheme rejection.
 * 2. Database model validation for UTM fields on SocialLink, BusinessLink, AnalyticsEvent.
 * 3. Safe extraction of UTM params from clicked URLs in analytics events.
 * 4. Aggregation of campaign, source, and medium reports.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Inline replication of pure JS logic from src/lib/utm.ts to test independently in node
const FORBIDDEN_SCHEMES = [
  "javascript:",
  "data:",
  "vbscript:",
  "file:",
  "blob:",
  "about:",
];

function isSafeUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim().toLowerCase();
  for (const scheme of FORBIDDEN_SCHEMES) {
    if (trimmed.startsWith(scheme)) return false;
  }
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function buildUtmUrl(baseUrl, config) {
  if (!baseUrl || typeof baseUrl !== "string") return "";
  const trimmedBase = baseUrl.trim();
  if (!isSafeUrl(trimmedBase)) return trimmedBase;
  if (!config || !config.utmEnabled) return trimmedBase;

  try {
    const urlObj = new URL(trimmedBase);
    const setOrDelete = (paramName, val) => {
      if (val && typeof val === "string" && val.trim().length > 0) {
        urlObj.searchParams.set(paramName, val.trim());
      }
    };

    setOrDelete("utm_source", config.utmSource);
    setOrDelete("utm_medium", config.utmMedium);
    setOrDelete("utm_campaign", config.utmCampaign);
    setOrDelete("utm_term", config.utmTerm);
    setOrDelete("utm_content", config.utmContent);

    return urlObj.toString();
  } catch {
    return trimmedBase;
  }
}

function extractUtmParams(urlStr) {
  const result = {
    utmSource: undefined,
    utmMedium: undefined,
    utmCampaign: undefined,
    utmTerm: undefined,
    utmContent: undefined,
  };

  if (!urlStr || typeof urlStr !== "string" || !isSafeUrl(urlStr)) {
    return result;
  }

  try {
    const parsed = new URL(urlStr);
    const getVal = (param) => {
      const v = parsed.searchParams.get(param);
      return v && v.trim().length > 0 ? v.trim() : undefined;
    };

    result.utmSource = getVal("utm_source");
    result.utmMedium = getVal("utm_medium");
    result.utmCampaign = getVal("utm_campaign");
    result.utmTerm = getVal("utm_term");
    result.utmContent = getVal("utm_content");
  } catch {
    // Return empty result
  }

  return result;
}

async function runTests() {
  console.log("🚀 Starting Linkle UTM Tracking System Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- UNIT TESTS: Safe URL Generation ---
  console.log("1. Testing buildUtmUrl & Security Controls:");

  // Test 1: Untouched when utmEnabled is false
  const plainUrl = "https://example.com/blog";
  assert(
    buildUtmUrl(plainUrl, { utmEnabled: false, utmSource: "instagram" }) === plainUrl,
    "Leaves URL untouched if utmEnabled is false"
  );

  // Test 2: Injects standard UTM params correctly
  const utmUrl1 = buildUtmUrl("https://example.com", {
    utmEnabled: true,
    utmSource: "instagram",
    utmMedium: "bio",
    utmCampaign: "summer_launch",
  });
  assert(
    utmUrl1 === "https://example.com/?utm_source=instagram&utm_medium=bio&utm_campaign=summer_launch",
    `Correctly generates destination URL: ${utmUrl1}`
  );

  // Test 3: Preserves existing query params and anchors
  const complexUrl = "https://example.com/shop?product=shoes&coupon=SAVE20#reviews";
  const utmUrl2 = buildUtmUrl(complexUrl, {
    utmEnabled: true,
    utmSource: "newsletter",
    utmMedium: "email",
    utmCampaign: "blackfriday",
    utmContent: "header_banner",
    utmTerm: "running+sneakers",
  });
  const parsed2 = new URL(utmUrl2);
  assert(
    parsed2.searchParams.get("product") === "shoes" &&
    parsed2.searchParams.get("coupon") === "SAVE20" &&
    parsed2.searchParams.get("utm_source") === "newsletter" &&
    parsed2.searchParams.get("utm_campaign") === "blackfriday" &&
    parsed2.hash === "#reviews",
    "Preserves existing query parameters and hash fragments while appending UTMs"
  );

  // Test 4: Parameter encoding (spaces, symbols)
  const encodedUrl = buildUtmUrl("https://example.com", {
    utmEnabled: true,
    utmCampaign: "spring sale 2026 & discounts",
  });
  assert(
    encodedUrl.includes("spring+sale+2026+%26+discounts") || encodedUrl.includes("spring%20sale%202026%20%26%20discounts"),
    `Properly encodes special characters in UTM values: ${encodedUrl}`
  );

  // Test 5: Reject unsafe javascript: and data: schemes
  const jsUrl = "javascript:alert('xss')";
  assert(
    buildUtmUrl(jsUrl, { utmEnabled: true, utmSource: "bad" }) === jsUrl,
    "Rejects javascript: scheme without appending params or executing"
  );

  const dataUrl = "data:text/html,<script>alert(1)</script>";
  assert(
    buildUtmUrl(dataUrl, { utmEnabled: true, utmSource: "bad" }) === dataUrl,
    "Rejects data: scheme without modification"
  );

  // Test 6: Extraction of UTM params from destination URL
  const extracted = extractUtmParams(utmUrl2);
  assert(
    extracted.utmSource === "newsletter" &&
    extracted.utmMedium === "email" &&
    extracted.utmCampaign === "blackfriday" &&
    extracted.utmContent === "header_banner",
    "extractUtmParams accurately retrieves all UTM parameters"
  );

  // --- DATABASE & INTEGRATION TESTS ---
  console.log("\n2. Testing Database Schema & Integration:");

  let testUser = null;
  let testBusinessLink = null;
  let testSocialLink = null;

  try {
    // Find or create test user
    testUser = await prisma.user.findFirst({
      where: { email: { contains: "test" } },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: `utm_test_${Date.now()}@example.com`,
          username: `utmuser_${Date.now().toString().slice(-6)}`,
          password: "dummyhash",
        },
      });
    }

    // Create BusinessLink with UTM settings
    testBusinessLink = await prisma.businessLink.create({
      data: {
        userId: testUser.id,
        title: "Test Store",
        url: "https://mystore.com/products",
        utmEnabled: true,
        utmSource: "linkle_bio",
        utmMedium: "profile_link",
        utmCampaign: "spring_collection",
        utmContent: "top_card",
        utmTerm: "hoodies",
      },
    });

    assert(
      testBusinessLink.utmEnabled === true &&
      testBusinessLink.utmSource === "linkle_bio" &&
      testBusinessLink.utmCampaign === "spring_collection",
      "BusinessLink stores UTM parameters in PostgreSQL database"
    );

    // Create SocialLink with UTM settings
    testSocialLink = await prisma.socialLink.create({
      data: {
        userId: testUser.id,
        platform: "youtube",
        url: "https://youtube.com/@channel",
        utmEnabled: true,
        utmSource: "linkle_profile",
        utmMedium: "social_icon",
        utmCampaign: "channel_growth",
      },
    });

    assert(
      testSocialLink.utmEnabled === true &&
      testSocialLink.utmCampaign === "channel_growth",
      "SocialLink stores UTM parameters in PostgreSQL database"
    );

    // --- ANALYTICS EVENT INGESTION WITH UTMs ---
    console.log("\n3. Testing Analytics Event Tracking with UTMs:");

    const eventWithUtm = await prisma.analyticsEvent.create({
      data: {
        userId: testUser.id,
        eventType: "LINK_CLICK",
        targetId: testBusinessLink.id,
        targetType: "BUSINESS_LINK",
        utmSource: "instagram",
        utmMedium: "bio",
        utmCampaign: "launch_2026",
        utmContent: "hero_button",
        utmTerm: "linkinbio",
      },
    });

    assert(
      eventWithUtm.utmSource === "instagram" &&
      eventWithUtm.utmCampaign === "launch_2026",
      "AnalyticsEvent captures and indexes UTM fields accurately"
    );

    // Create a few more test events for aggregation
    await prisma.analyticsEvent.createMany({
      data: [
        {
          userId: testUser.id,
          eventType: "LINK_CLICK",
          targetId: testBusinessLink.id,
          utmSource: "instagram",
          utmMedium: "bio",
          utmCampaign: "launch_2026",
        },
        {
          userId: testUser.id,
          eventType: "LINK_CLICK",
          targetId: testBusinessLink.id,
          utmSource: "twitter",
          utmMedium: "tweet",
          utmCampaign: "launch_2026",
        },
        {
          userId: testUser.id,
          eventType: "LINK_CLICK",
          targetId: testBusinessLink.id,
          utmSource: "twitter",
          utmMedium: "tweet",
          utmCampaign: "promo_tweet",
        },
      ],
    });

    // Test UTM Report Aggregation Query
    const utmEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId: testUser.id,
        eventType: "LINK_CLICK",
        OR: [
          { utmSource: { not: null } },
          { utmCampaign: { not: null } },
          { utmMedium: { not: null } },
        ],
      },
      select: {
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
      },
    });

    // Aggregate campaigns
    const campaignMap = {};
    for (const ev of utmEvents) {
      if (ev.utmCampaign) {
        campaignMap[ev.utmCampaign] = (campaignMap[ev.utmCampaign] || 0) + 1;
      }
    }

    assert(
      campaignMap["launch_2026"] >= 3,
      `Campaign aggregation correctly aggregates counts (launch_2026 count = ${campaignMap["launch_2026"]})`
    );
    assert(
      campaignMap["promo_tweet"] >= 1,
      `Campaign aggregation captures secondary campaign (promo_tweet count = ${campaignMap["promo_tweet"]})`
    );

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    // Cleanup created test records
    if (testBusinessLink) {
      await prisma.businessLink.delete({ where: { id: testBusinessLink.id } }).catch(() => {});
    }
    if (testSocialLink) {
      await prisma.socialLink.delete({ where: { id: testSocialLink.id } }).catch(() => {});
    }
    if (testUser && testUser.email.startsWith("utm_test_")) {
      await prisma.analyticsEvent.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
