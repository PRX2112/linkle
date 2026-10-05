/**
 * Automated Test Suite for Linkle Marketing Homepage UI-08 Reform.
 * Validates:
 * 1. Absence of unverified vanity metrics (10K+ users, 50K+ scans, 99.9% uptime).
 * 2. Pricing preview synchronization with production PLANS configuration.
 * 3. Schema.org WebSite and SoftwareApplication JSON-LD structured data.
 * 4. Navigation anchors and authentic destination paths.
 * 5. Honest Linkle Pay UPI claims (peer-to-peer, 0% platform fee, no fake verification).
 * 6. Accessible FAQ accordion attributes and single H1 semantic hierarchy.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

async function runTests() {
  console.log("🚀 Starting Linkle Marketing Homepage UI-08 Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function test(description, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Read files
  const pagePath = path.join(__dirname, "../src/app/page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf-8");

  const contentPath = path.join(__dirname, "../src/lib/landing-content.ts");
  const contentFile = fs.readFileSync(contentPath, "utf-8");

  const heroPath = path.join(__dirname, "../src/components/landing/HeroSection.tsx");
  const heroContent = fs.readFileSync(heroPath, "utf-8");

  const pricingPath = path.join(__dirname, "../src/components/landing/PricingSection.tsx");
  const pricingContent = fs.readFileSync(pricingPath, "utf-8");

  const payPath = path.join(__dirname, "../src/components/landing/LinklePaySection.tsx");
  const payContent = fs.readFileSync(payPath, "utf-8");

  const faqPath = path.join(__dirname, "../src/components/landing/FaqSection.tsx");
  const faqContent = fs.readFileSync(faqPath, "utf-8");

  console.log("1. Testing Elimination of Unverified Vanity Metrics:");
  test("Does NOT contain unverified '10K+' or '10,000' user count claim", () => {
    assert(!pageContent.includes("10K+"), "Should not contain '10K+'");
    assert(!heroContent.includes("10K+"), "Should not contain '10K+' in hero");
    assert(!contentFile.includes("10,000 creators"), "Should not contain '10,000 creators'");
  });

  test("Does NOT contain unverified '50K+' QR scans claim", () => {
    assert(!pageContent.includes("50K+"), "Should not contain '50K+'");
    assert(!heroContent.includes("50K+"), "Should not contain '50K+' in hero");
  });

  test("Does NOT contain unverified '99.9%' uptime claim", () => {
    assert(!pageContent.includes("99.9%"), "Should not contain '99.9%'");
  });

  test("Does NOT contain generic AI-generated landing page cliches", () => {
    assert(!pageContent.includes("One Link. Endless Possibilities."), "Replaced generic slogan");
    assert(!pageContent.includes("animate-float"), "Removed floating purple blobs");
  });

  console.log("\n2. Testing Pricing Preview Synchronization:");
  test("PricingSection imports real PLANS config from @/lib/billing/plans", () => {
    assert(pricingContent.includes("from \"@/lib/billing/plans\""), "Should import from billing plans");
    assert(pricingContent.includes("PLANS.STARTER"), "Should reference PLANS.STARTER");
    assert(pricingContent.includes("PLANS.PRO"), "Should reference PLANS.PRO");
    assert(pricingContent.includes("PLANS.ENTERPRISE"), "Should reference PLANS.ENTERPRISE");
  });

  test("Supports monthly and yearly intervals with honest discount pill", () => {
    assert(pricingContent.includes("Save ~27%"), "Should display genuine ~27% yearly savings");
    assert(pricingContent.includes("PLANS.PRO.price.yearly"), "Should use yearly price model");
  });

  console.log("\n3. Testing Schema.org Structured Data & Semantic HTML:");
  test("Homepage includes Schema.org WebSite entity", () => {
    assert(pageContent.includes('"@type": "WebSite"'), "Should declare WebSite schema");
    assert(pageContent.includes('name: "Linkle"'), "Should declare Linkle name");
  });

  test("Homepage includes Schema.org SoftwareApplication entity", () => {
    assert(pageContent.includes('"@type": "SoftwareApplication"'), "Should declare SoftwareApplication schema");
    assert(pageContent.includes('applicationCategory: "BusinessApplication"'), "Should categorize properly");
  });

  test("Strictly one H1 heading on the homepage", () => {
    const h1Matches = pageContent.match(/<h1/g) || [];
    const heroH1Matches = heroContent.match(/<h1/g) || [];
    assert.strictEqual(h1Matches.length + heroH1Matches.length, 1, "Must have exactly one H1 tag");
  });

  console.log("\n4. Testing Linkle Pay & Honest Monetization Claims:");
  test("Accurately describes peer-to-peer UPI transfer with zero commission", () => {
    assert(payContent.includes("0% Commission") || payContent.includes("zero fees"), "States 0% fee honestly");
    assert(payContent.includes("Pay via UPI App"), "Has mobile deep link action");
    assert(payContent.includes("Scan with Google Pay, PhonePe, Paytm, or BHIM"), "Lists supported UPI apps");
  });

  test("Does NOT claim Linkle processes payments or acts as custodian", () => {
    assert(payContent.includes("Peer-to-peer") || payContent.includes("peer-to-peer"), "Clearly states peer-to-peer");
    assert(!payContent.includes("Linkle processes your payment"), "Does not claim custodian processing");
  });

  console.log("\n5. Testing FAQ Accessibility & Authentic Product Details:");
  test("FAQ buttons use aria-expanded and aria-controls", () => {
    assert(faqContent.includes("aria-expanded={isOpen}"), "Includes aria-expanded");
    assert(faqContent.includes("aria-controls={contentId}"), "Includes aria-controls");
    assert(faqContent.includes("role=\"region\""), "Includes region role for panel");
  });

  test("FAQ contains genuine product questions (UPI, vCard, Themes, Plans)", () => {
    assert(contentFile.includes("Linkle Pay (UPI) work"), "Addresses UPI fees and flow");
    assert(contentFile.includes("Save Contact"), "Explains RFC 2426 vCard feature");
    assert(contentFile.includes("Starter plan"), "Explains free plan limits");
  });

  console.log("\n========================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
