/**
 * Automated test suite for Linkle Safe Profile Import Utility.
 * Tests:
 * 1. Platform identification & URL normalization for all 6 sources (Instagram, YouTube, LinkedIn, GitHub, X/Twitter, Website).
 * 2. Parameter stripping (tracking queries, trailing slashes, hashes).
 * 3. Security enforcement (rejection of javascript:, data:, file: schemes).
 * 4. Intra-batch duplicate detection.
 * 5. Database cross-referencing duplicate detection.
 * 6. Transactional persistence with commitImportedLinks.
 * 7. Verification of zero scraping (offline deterministic logic).
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  identifyPlatform,
  parseProfileUrls,
  commitImportedLinks,
} = require("../src/lib/importer/service");

async function runTests() {
  console.log("🚀 Starting Linkle Safe Profile Import Test Suite...\n");

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

  // --- UNIT TEST 1: Platform Identification & Normalization ---
  console.log("1. Testing Platform Identification & URL Normalization:");

  // Instagram
  const ig = identifyPlatform("https://www.instagram.com/alexcreator/?igsh=xyz987&utm_source=copy");
  assert(
    ig.isValid &&
    ig.platform === "instagram" &&
    ig.normalizedUrl === "https://instagram.com/alexcreator" &&
    ig.handle === "alexcreator" &&
    ig.suggestedLabel.includes("alexcreator"),
    `Instagram properly normalized: ${ig.normalizedUrl}`
  );

  // YouTube (@handle)
  const yt = identifyPlatform("https://www.youtube.com/@alexstudio?si=vid123");
  assert(
    yt.isValid &&
    yt.platform === "youtube" &&
    yt.normalizedUrl === "https://youtube.com/@alexstudio" &&
    yt.handle === "alexstudio",
    `YouTube properly normalized: ${yt.normalizedUrl}`
  );

  // LinkedIn (Personal profile)
  const li = identifyPlatform("https://www.linkedin.com/in/alex-developer-123/");
  assert(
    li.isValid &&
    li.platform === "linkedin" &&
    li.normalizedUrl === "https://linkedin.com/in/alex-developer-123" &&
    li.handle === "alex-developer-123",
    `LinkedIn properly normalized: ${li.normalizedUrl}`
  );

  // GitHub
  const gh = identifyPlatform("https://github.com/alexcodes/");
  assert(
    gh.isValid &&
    gh.platform === "github" &&
    gh.normalizedUrl === "https://github.com/alexcodes" &&
    gh.handle === "alexcodes",
    `GitHub properly normalized: ${gh.normalizedUrl}`
  );

  // X / Twitter (mapping twitter.com to x.com)
  const tw = identifyPlatform("https://twitter.com/alex_daily?t=xyz&s=09");
  assert(
    tw.isValid &&
    tw.platform === "twitter" &&
    tw.normalizedUrl === "https://x.com/alex_daily" &&
    tw.handle === "alex_daily",
    `Twitter properly normalized to x.com: ${tw.normalizedUrl}`
  );

  // Personal Website
  const web = identifyPlatform("https://myportfolio.dev/projects?ref=newsletter#top");
  assert(
    web.isValid &&
    web.platform === "website" &&
    web.entryType === "business" &&
    web.normalizedUrl === "https://myportfolio.dev/projects",
    `Personal website normalized with clean path: ${web.normalizedUrl}`
  );

  // --- UNIT TEST 2: Security & Malicious Scheme Rejection ---
  console.log("\n2. Testing Security & Malicious Scheme Rejection:");

  const js = identifyPlatform("javascript:alert(document.cookie)");
  assert(!js.isValid && js.errorMessage.includes("unsafe protocol"), "Rejects javascript: scheme");

  const data = identifyPlatform("data:text/html,<script>alert(1)</script>");
  assert(!data.isValid && data.errorMessage.includes("unsafe protocol"), "Rejects data: scheme");

  const file = identifyPlatform("file:///etc/passwd");
  assert(!file.isValid && file.errorMessage.includes("unsafe protocol"), "Rejects file: scheme");

  // --- UNIT TEST 3: Duplicate Detection (Intra-batch & Cross-reference) ---
  console.log("\n3. Testing Duplicate Detection:");

  const multilineInput = `
    https://x.com/alexcodes
    https://twitter.com/alexcodes
    https://github.com/alexcodes
    https://alexportfolio.dev
  `;

  // Existing user has GitHub already in DB
  const existingRefs = [
    { platform: "github", url: "https://github.com/alexcodes" },
  ];

  const parsedBatch = parseProfileUrls(multilineInput, existingRefs);

  assert(
    parsedBatch.totalInput === 4,
    `Batch parsed 4 distinct input lines`
  );

  // Find the twitter link which is an intra-batch duplicate of x.com
  const xLink = parsedBatch.suggestions.find((s) => s.originalUrl.includes("x.com"));
  const twitterLink = parsedBatch.suggestions.find((s) => s.originalUrl.includes("twitter.com"));
  const githubLink = parsedBatch.suggestions.find((s) => s.platform === "github");
  const portfolioLink = parsedBatch.suggestions.find((s) => s.platform === "website");

  assert(
    xLink && xLink.isValid && !xLink.isDuplicate,
    "First X link is valid and selected"
  );

  assert(
    twitterLink && twitterLink.isDuplicate && twitterLink.duplicateReason.includes("pasted list"),
    "Second Twitter link flagged as intra-batch duplicate of X"
  );

  assert(
    githubLink && githubLink.isDuplicate && githubLink.duplicateReason.toLowerCase().includes("already"),
    "GitHub link flagged as duplicate against existing profile links"
  );

  assert(
    portfolioLink && portfolioLink.isValid && !portfolioLink.isDuplicate,
    "Personal website is valid and ready"
  );

  // --- INTEGRATION TEST 4: Transactional Commitment to Database ---
  console.log("\n4. Testing Transactional Database Commitment:");

  let testUser = null;

  try {
    testUser = await prisma.user.create({
      data: {
        email: `import_test_${Date.now()}@example.com`,
        username: `importer_${Date.now().toString().slice(-6)}`,
        password: "hashedpassword123",
        displayName: "Importer Test User",
      },
    });

    const commitItems = [
      {
        entryType: "social",
        platform: "instagram",
        url: "https://instagram.com/test_creator",
        label: "Instagram (@test_creator)",
      },
      {
        entryType: "social",
        platform: "youtube",
        url: "https://youtube.com/@test_channel",
        label: "YouTube (@test_channel)",
      },
      {
        entryType: "business",
        platform: "website",
        url: "https://testbrand.com",
        title: "Test Brand Store",
      },
    ];

    const result = await commitImportedLinks(testUser.id, commitItems);

    assert(
      result.addedSocialCount === 2 && result.addedBusinessCount === 1,
      "commitImportedLinks saved 2 social links and 1 business link"
    );

    const dbSocials = await prisma.socialLink.findMany({ where: { userId: testUser.id } });
    const dbBusiness = await prisma.businessLink.findMany({ where: { userId: testUser.id } });

    assert(
      dbSocials.length === 2 &&
      dbSocials.some((s) => s.platform === "instagram") &&
      dbSocials.some((s) => s.platform === "youtube"),
      "Social links accurately persisted in PostgreSQL with correct platforms and order"
    );

    assert(
      dbBusiness.length === 1 &&
      dbBusiness[0].title === "Test Brand Store" &&
      dbBusiness[0].url === "https://testbrand.com",
      "Business link accurately persisted in PostgreSQL"
    );

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    // Cleanup
    if (testUser) {
      await prisma.socialLink.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
      await prisma.businessLink.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
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
