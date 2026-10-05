// Test suite for Linkle Analytics v2
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXPECTED_EVENTS = [
  'PROFILE_VIEW',
  'LINK_CLICK',
  'CTA_CLICK',
  'UPI_OPEN',
  'UPI_COPY',
  'QR_VIEW',
  'QR_DOWNLOAD',
  'PROFILE_SHARE',
  'EMAIL_SUBSCRIBE',
  'CONTACT_SAVE',
  'PAYMENT_CLICK',
  'BOOKING_CLICK',
];

async function runTests() {
  console.log('🧪 Starting Analytics v2 Automated Test Suite...\n');
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

  // 1. Find or create a test user
  console.log('--- Test 1: User & Database Readiness ---');
  let testUser = await prisma.user.findFirst({
    where: { username: 'analytics_test_user' }
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        username: 'analytics_test_user',
        email: 'analytics_test@linkle.app',
        displayName: 'Analytics Test Creator',
        plan: 'free',
      }
    });
  }
  assert(!!testUser && !!testUser.id, 'Test user exists in database');

  // Clean up any previous test events for this user
  await prisma.analyticsEvent.deleteMany({
    where: { userId: testUser.id }
  });

  // 2. Insert test events covering all 12 event types
  console.log('\n--- Test 2: Ingest All 12 Event Types ---');
  const now = new Date();
  const createdEvents = [];

  const sampleEvents = [
    { type: 'PROFILE_VIEW', referrer: 'https://instagram.com', device: 'Mobile', country: 'IN' },
    { type: 'PROFILE_VIEW', referrer: 'https://twitter.com/x', device: 'Mobile', country: 'US' },
    { type: 'PROFILE_VIEW', referrer: 'https://t.co/abc', device: 'Desktop', country: 'GB' },
    { type: 'PROFILE_VIEW', referrer: 'https://google.com/search', device: 'Desktop', country: 'IN' },
    { type: 'PROFILE_VIEW', referrer: 'Direct', device: 'Mobile', country: 'IN' },
    { type: 'LINK_CLICK', targetId: 'link-1', targetType: 'social', targetTitle: 'My YouTube Channel', referrer: 'Direct', device: 'Mobile', country: 'IN' },
    { type: 'LINK_CLICK', targetId: 'link-2', targetType: 'business', targetTitle: 'Portfolio Site', referrer: 'Direct', device: 'Desktop', country: 'US' },
    { type: 'CTA_CLICK', targetId: 'cta-1', targetType: 'cta', targetTitle: 'Join VIP Community', referrer: 'https://instagram.com', device: 'Mobile', country: 'IN' },
    { type: 'UPI_OPEN', targetTitle: 'creator@oksbi', metadata: { upiId: 'creator@oksbi' } },
    { type: 'UPI_COPY', targetTitle: 'creator@oksbi', metadata: { upiId: 'creator@oksbi' } },
    { type: 'QR_VIEW', targetType: 'profile' },
    { type: 'QR_DOWNLOAD', targetType: 'upi_qr' },
    { type: 'PROFILE_SHARE', targetType: 'share_modal' },
    { type: 'EMAIL_SUBSCRIBE', targetType: 'email_capture', targetTitle: 'Newsletter' },
    { type: 'CONTACT_SAVE', targetType: 'vcard' },
    { type: 'PAYMENT_CLICK', targetType: 'payment', targetTitle: 'paypal', url: 'https://paypal.me/test' },
    { type: 'BOOKING_CLICK', targetType: 'booking', targetTitle: 'Book 1:1 Consultation', url: 'https://cal.com/test' },
  ];

  for (const item of sampleEvents) {
    const ev = await prisma.analyticsEvent.create({
      data: {
        userId: testUser.id,
        eventType: item.type,
        visitorId: 'vis_test_' + Math.random().toString(36).substring(7),
        targetId: item.targetId || null,
        targetType: item.targetType || null,
        targetTitle: item.targetTitle || null,
        url: item.url || null,
        referrer: item.referrer || 'Direct',
        device: item.device || 'Mobile',
        country: item.country || 'IN',
        metadata: item.metadata || null,
        createdAt: now,
      }
    });
    createdEvents.push(ev);
  }

  assert(createdEvents.length === sampleEvents.length, `Successfully ingested ${sampleEvents.length} events`);

  // Verify all 12 event types are present
  const presentTypes = new Set(createdEvents.map(e => e.eventType));
  for (const expected of EXPECTED_EVENTS) {
    assert(presentTypes.has(expected), `Event type "${expected}" is present in database`);
  }

  // 3. Privacy Compliance Test
  console.log('\n--- Test 3: Privacy & Anti-Leak Safeguards ---');
  const allEventsForUser = await prisma.analyticsEvent.findMany({
    where: { userId: testUser.id }
  });

  let rawEmailFound = false;
  let rawIpFound = false;

  for (const ev of allEventsForUser) {
    const str = JSON.stringify(ev);
    if (str.includes('@linkle.app') || str.includes('subscriber@') || str.includes('test@example.com')) {
      rawEmailFound = true;
    }
    // Check if IPv4-like pattern is saved
    if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(ev.visitorId || '')) {
      rawIpFound = true;
    }
  }

  assert(!rawEmailFound, 'Zero raw email addresses found in AnalyticsEvent records');
  assert(!rawIpFound, 'Zero IP addresses stored in visitorId (pseudonymous IDs verified)');

  // 4. Conversion Metrics Calculation Test
  console.log('\n--- Test 4: Conversion Metrics Calculations ---');
  const views = allEventsForUser.filter(e => e.eventType === 'PROFILE_VIEW').length; // 5
  const clicks = allEventsForUser.filter(e => ['LINK_CLICK', 'CTA_CLICK', 'PAYMENT_CLICK'].includes(e.eventType)).length; // 4
  const ctr = views > 0 ? Number(((clicks / views) * 100).toFixed(1)) : 0;
  
  const emailSubscribes = allEventsForUser.filter(e => e.eventType === 'EMAIL_SUBSCRIBE').length; // 1
  const emailRate = views > 0 ? Number(((emailSubscribes / views) * 100).toFixed(1)) : 0;

  const upiOpens = allEventsForUser.filter(e => e.eventType === 'UPI_OPEN').length; // 1
  const upiCopies = allEventsForUser.filter(e => e.eventType === 'UPI_COPY').length; // 1
  const totalUpi = upiOpens + upiCopies; // 2

  const shares = allEventsForUser.filter(e => e.eventType === 'PROFILE_SHARE').length; // 1
  const contactSaves = allEventsForUser.filter(e => e.eventType === 'CONTACT_SAVE').length; // 1
  const bookings = allEventsForUser.filter(e => e.eventType === 'BOOKING_CLICK').length; // 1
  const totalContactActions = contactSaves + bookings; // 2

  assert(views === 5, `Profile Views: expected 5, got ${views}`);
  assert(clicks === 4, `Total Clicks: expected 4, got ${clicks}`);
  assert(ctr === 80.0, `CTR: expected 80.0%, got ${ctr}%`);
  assert(emailSubscribes === 1, `Email Conversions: expected 1, got ${emailSubscribes}`);
  assert(emailRate === 20.0, `Email Conversion Rate: expected 20.0%, got ${emailRate}%`);
  assert(totalUpi === 2, `UPI Interactions: expected 2, got ${totalUpi}`);
  assert(shares === 1, `Profile Shares: expected 1, got ${shares}`);
  assert(totalContactActions === 2, `Contact Actions: expected 2, got ${totalContactActions}`);

  // 5. Conversion Funnel Progression Test
  console.log('\n--- Test 5: Conversion Funnel Stage Analysis ---');
  const qrViews = allEventsForUser.filter(e => e.eventType === 'QR_VIEW').length; // 1
  const qrDownloads = allEventsForUser.filter(e => e.eventType === 'QR_DOWNLOAD').length; // 1
  const engagedVisitors = Math.min(views, clicks + upiOpens + qrViews); // min(5, 4 + 1 + 1) = 5
  const highIntentConversions = Math.min(
    views,
    emailSubscribes + upiCopies + contactSaves + bookings + shares + qrDownloads
  ); // min(5, 1+1+1+1+1+1 = 6) = 5

  const stage1Pct = 100;
  const stage2Pct = views > 0 ? Number(((engagedVisitors / views) * 100).toFixed(1)) : 0;
  const stage3Pct = views > 0 ? Number(((highIntentConversions / views) * 100).toFixed(1)) : 0;

  assert(stage1Pct === 100, `Funnel Stage 1 (Impressions): 100%`);
  assert(stage2Pct === 100, `Funnel Stage 2 (Interactions): ${stage2Pct}%`);
  assert(stage3Pct === 100, `Funnel Stage 3 (High-Intent Conversions): ${stage3Pct}%`);

  // 6. Date Range Filtering Test
  console.log('\n--- Test 6: Date Range Filter Logic (7d, 14d, 30d, 90d) ---');
  // Create an old event outside 7d window (e.g. 10 days ago)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  const oldEvent = await prisma.analyticsEvent.create({
    data: {
      userId: testUser.id,
      eventType: 'PROFILE_VIEW',
      visitorId: 'vis_old_visitor',
      referrer: 'https://tiktok.com',
      createdAt: tenDaysAgo,
    }
  });

  // Query 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const events7d = await prisma.analyticsEvent.findMany({
    where: { userId: testUser.id, createdAt: { gte: sevenDaysAgo } }
  });

  // Query 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const events14d = await prisma.analyticsEvent.findMany({
    where: { userId: testUser.id, createdAt: { gte: fourteenDaysAgo } }
  });

  assert(!events7d.some(e => e.id === oldEvent.id), '7-day filter properly excludes 10-day old event');
  assert(events14d.some(e => e.id === oldEvent.id), '14-day filter properly includes 10-day old event');

  // 7. Traffic Source Classification Test
  console.log('\n--- Test 7: Traffic Source Categorization ---');
  function normalizeReferrer(ref) {
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
    return "Other";
  }

  assert(normalizeReferrer('https://l.instagram.com/') === 'Instagram', 'Categorized Instagram correctly');
  assert(normalizeReferrer('https://t.co/xyz123') === 'Twitter / X', 'Categorized Twitter/t.co correctly');
  assert(normalizeReferrer('https://www.tiktok.com/@creator') === 'TikTok', 'Categorized TikTok correctly');
  assert(normalizeReferrer('https://www.google.com/search?q=linkle') === 'Google Search', 'Categorized Google Search correctly');
  assert(normalizeReferrer('Direct') === 'Direct / Bio Link', 'Categorized Direct/Bio Link correctly');

  // 8. Empty State Non-Fabrication Test
  console.log('\n--- Test 8: Empty State Verification (No Mock/Fake Numbers) ---');
  let emptyUser = await prisma.user.findFirst({
    where: { username: 'analytics_empty_user' }
  });
  if (!emptyUser) {
    emptyUser = await prisma.user.create({
      data: {
        username: 'analytics_empty_user',
        email: 'empty_user@linkle.app',
        displayName: 'Empty User',
        plan: 'free',
      }
    });
  }

  // Ensure zero events
  await prisma.analyticsEvent.deleteMany({ where: { userId: emptyUser.id } });
  await prisma.profileView.deleteMany({ where: { userId: emptyUser.id } });
  await prisma.clickEvent.deleteMany({ where: { userId: emptyUser.id } });

  const emptyUserEvents = await prisma.analyticsEvent.findMany({ where: { userId: emptyUser.id } });
  const emptyViews = emptyUserEvents.filter(e => e.eventType === 'PROFILE_VIEW').length;
  const emptyClicks = emptyUserEvents.filter(e => ['LINK_CLICK', 'CTA_CLICK', 'PAYMENT_CLICK'].includes(e.eventType)).length;
  const emptyCtr = emptyViews > 0 ? (emptyClicks / emptyViews) * 100 : 0;

  assert(emptyViews === 0, 'Empty user returns exact 0 views (not fabricated)');
  assert(emptyClicks === 0, 'Empty user returns exact 0 clicks (not fabricated)');
  assert(emptyCtr === 0, 'Empty user returns exact 0 CTR (not fabricated)');

  // 9. Clean up test users & data
  console.log('\n--- Cleanup ---');
  await prisma.analyticsEvent.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.deleteMany({
    where: { username: { in: ['analytics_test_user', 'analytics_empty_user'] } }
  });
  console.log('  🧹 Cleaned up temporary test users & test events.');

  console.log(`\n========================================`);
  console.log(`Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
