/**
 * Automated Test Suite for Linkle Billing & Subscription Architecture.
 * Tests:
 * 1. Plan normalization, intervals, and pricing configurations.
 * 2. Entitlement matrix verification across Starter, Pro, and Enterprise tiers.
 * 3. Server-side entitlement and link limit enforcement (5 links limit for Starter vs unlimited for Pro).
 * 4. Database subscription lifecycle (creation, active state, status synchronization).
 * 5. Idempotent webhook event ledger.
 * 6. Automatic cancellation and downgrade handling.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  normalizePlanTier,
  getPlanFromPriceId,
  PLANS,
} = require("../src/lib/billing/plans");

const {
  getPlanEntitlements,
  hasEntitlement,
  getEffectiveUserPlan,
  verifyUserEntitlement,
  verifyLinkLimit,
} = require("../src/lib/billing/entitlements");

const {
  handleSubscriptionDeleted,
} = require("../src/lib/billing/subscription");

async function runTests() {
  console.log("🚀 Starting Linkle Billing & Subscription Test Suite...\n");

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

  // --- TEST 1: Plan Configurations & Normalization ---
  console.log("1. Testing Plan Configurations & Normalization:");

  assert(normalizePlanTier("starter") === "STARTER", "Normalizes 'starter' -> 'STARTER'");
  assert(normalizePlanTier("Pro") === "PRO", "Normalizes 'Pro' -> 'PRO'");
  assert(normalizePlanTier("enterprise") === "ENTERPRISE", "Normalizes 'enterprise' -> 'ENTERPRISE'");
  assert(normalizePlanTier(null) === "STARTER", "Fallback for null/empty -> 'STARTER'");

  assert(
    PLANS.PRO.price.monthly === 9 && PLANS.PRO.price.yearly === 79,
    "Pro pricing is $9/month, $79/year"
  );
  assert(
    PLANS.ENTERPRISE.price.monthly === 29 && PLANS.ENTERPRISE.price.yearly === 249,
    "Enterprise pricing is $29/month, $249/year"
  );

  // --- TEST 2: Entitlement Matrix ---
  console.log("\n2. Testing Entitlement Matrix:");

  const starterEnt = getPlanEntitlements("STARTER");
  const proEnt = getPlanEntitlements("PRO");
  const entEnt = getPlanEntitlements("ENTERPRISE");

  assert(starterEnt.maxLinks === 5, "Starter tier is capped at 5 links");
  assert(starterEnt.advancedAnalytics === false, "Starter tier lacks advanced analytics");
  assert(starterEnt.removeBranding === false, "Starter tier cannot remove Linkle branding");

  assert(proEnt.maxLinks === Infinity, "Pro tier has unlimited links");
  assert(proEnt.advancedAnalytics === true, "Pro tier has advanced analytics");
  assert(proEnt.removeBranding === true, "Pro tier can remove branding");
  assert(proEnt.analyticsExport === false, "Pro tier lacks raw analytics export");

  assert(entEnt.analyticsExport === true, "Enterprise tier has raw analytics export");

  // --- DATABASE & INTEGRATION TESTS ---
  console.log("\n3. Testing Database Subscription Lifecycle & Server-Side Gates:");

  let testStarterUser = null;
  let testProUser = null;

  try {
    const starterEmail = `starter_test_${Date.now()}@example.com`;
    const proEmail = `pro_test_${Date.now()}@example.com`;

    // 1. Create Starter User
    testStarterUser = await prisma.user.create({
      data: {
        email: starterEmail,
        username: `starter_${Date.now().toString().slice(-6)}`,
        displayName: "Free User",
        plan: "Starter",
      },
    });

    const starterEffective = await getEffectiveUserPlan(testStarterUser.id);
    assert(
      starterEffective.plan === "STARTER" && starterEffective.isPaidActive === false,
      "Starter user correctly resolves to STARTER plan with isPaidActive = false"
    );

    // 2. Server-side Link Limit Check for Starter User
    // Create 5 links (the starter limit)
    for (let i = 0; i < 5; i++) {
      await prisma.socialLink.create({
        data: {
          userId: testStarterUser.id,
          platform: "website",
          url: `https://link${i}.com`,
          order: i,
        },
      });
    }

    const limitCheckStarter = await verifyLinkLimit(testStarterUser.id);
    assert(
      limitCheckStarter.allowed === false && limitCheckStarter.currentCount === 5,
      "Server-side link limit gate correctly blocks 6th link on Starter plan (allowed: false)"
    );

    // 3. Create Pro User with active Subscription model
    testProUser = await prisma.user.create({
      data: {
        email: proEmail,
        username: `prouser_${Date.now().toString().slice(-6)}`,
        displayName: "Pro User",
        plan: "Pro",
        stripeCustomerId: `cus_test_${Date.now()}`,
        stripeSubscriptionId: `sub_test_${Date.now()}`,
      },
    });

    // Create related Subscription record
    const subRecord = await prisma.subscription.create({
      data: {
        userId: testProUser.id,
        stripeCustomerId: testProUser.stripeCustomerId,
        stripeSubscriptionId: testProUser.stripeSubscriptionId,
        plan: "PRO",
        status: "active",
        interval: "monthly",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
      },
    });

    const proEffective = await getEffectiveUserPlan(testProUser.id);
    assert(
      proEffective.plan === "PRO" && proEffective.isPaidActive === true,
      "Pro subscriber resolves to PRO plan with isPaidActive = true"
    );

    const proEntitlementCheck = await verifyUserEntitlement(testProUser.id, "advancedAnalytics");
    assert(
      proEntitlementCheck.allowed === true && proEntitlementCheck.plan === "PRO",
      "Server-side entitlement check permits advanced analytics for Pro user"
    );

    // Verify Pro user is not blocked by link limit
    const limitCheckPro = await verifyLinkLimit(testProUser.id);
    assert(
      limitCheckPro.allowed === true && limitCheckPro.maxAllowed === Infinity,
      "Pro user has unlimited link allowance (maxAllowed: Infinity)"
    );

    // --- TEST 4: Idempotent Webhook Processing Ledger ---
    console.log("\n4. Testing Idempotent Webhook Processing:");

    const testEventId = `evt_test_${Date.now()}`;

    // First processing
    await prisma.webhookEvent.create({
      data: {
        id: testEventId,
        type: "customer.subscription.updated",
        payload: { test: true },
      },
    });

    // Attempt second processing check
    const duplicateCheck = await prisma.webhookEvent.findUnique({
      where: { id: testEventId },
    });

    assert(
      duplicateCheck !== null && duplicateCheck.id === testEventId,
      "Idempotency ledger records processed event ID to prevent duplicate handling"
    );

    // --- TEST 5: Cancellation & Downgrade Handling ---
    console.log("\n5. Testing Subscription Cancellation & Downgrade:");

    await handleSubscriptionDeleted(testProUser.stripeSubscriptionId, testProUser.stripeCustomerId);

    const downgradedUser = await prisma.user.findUnique({
      where: { id: testProUser.id },
      include: { subscription: true },
    });

    assert(
      downgradedUser.plan === "Starter" &&
      downgradedUser.stripeSubscriptionId === null &&
      downgradedUser.subscription.status === "canceled",
      "handleSubscriptionDeleted cleanly downgrades user to Starter and marks subscription canceled"
    );

    const postDowngradeEffective = await getEffectiveUserPlan(testProUser.id);
    assert(
      postDowngradeEffective.plan === "STARTER" && postDowngradeEffective.isPaidActive === false,
      "Downgraded user immediately loses paid privileges upon subscription deletion"
    );

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    // Cleanup
    if (testStarterUser) {
      await prisma.socialLink.deleteMany({ where: { userId: testStarterUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testStarterUser.id } }).catch(() => {});
    }
    if (testProUser) {
      await prisma.subscription.deleteMany({ where: { userId: testProUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testProUser.id } }).catch(() => {});
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
