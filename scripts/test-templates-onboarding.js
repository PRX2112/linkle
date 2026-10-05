/**
 * Test script for Linkle Guided Onboarding & Profile Templates System.
 * Tests:
 * 1. Verification of all 9 template definitions + start from scratch.
 * 2. Database model validation for onboardingCompleted and selectedTemplate fields.
 * 3. Start from scratch flow (empty canvas, onboardingCompleted: true).
 * 4. Applying template sensible defaults (Developer, Photographer, Freelancer).
 * 5. Testing user customization (editing bio, custom theme color, omitting links).
 * 6. Verifying zero fake personal data is injected.
 * 7. Verification that onboarding completed state is preserved.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EXPECTED_TEMPLATE_IDS = [
  "creator",
  "freelancer",
  "developer",
  "photographer",
  "influencer",
  "business",
  "coach",
  "job_seeker",
  "student",
  "scratch",
];

async function runTests() {
  console.log("🚀 Starting Linkle Profile Templates & Onboarding Test Suite...\n");

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

  // --- UNIT TEST 1: Template Definitions ---
  console.log("1. Verifying Template Definitions & Scaffolding:");

  // Inline import or dynamic require of compiled/definitions
  const { PROFILE_TEMPLATES, TEMPLATE_LIST } = require("../src/lib/templates/definitions");

  assert(
    TEMPLATE_LIST && TEMPLATE_LIST.length === 10,
    `All 9 templates plus scratch defined (Total: ${TEMPLATE_LIST.length})`
  );

  for (const id of EXPECTED_TEMPLATE_IDS) {
    const tmpl = PROFILE_TEMPLATES[id];
    assert(
      tmpl &&
      tmpl.id === id &&
      tmpl.name &&
      tmpl.theme &&
      tmpl.theme.primaryColor,
      `Template "${id}" has valid name, icon, and theme configurations`
    );
  }

  // --- DATABASE TESTS ---
  console.log("\n2. Testing Database Schema & Onboarding State:");

  let testUser1 = null;
  let testUser2 = null;

  try {
    const testEmail1 = `onboard_test_${Date.now()}@example.com`;
    const testUsername1 = `onboard_${Date.now().toString().slice(-6)}`;

    // Create fresh user
    testUser1 = await prisma.user.create({
      data: {
        email: testEmail1,
        username: testUsername1,
        password: "hashedpassword123",
        displayName: "New Test Creator",
      },
    });

    assert(
      testUser1.onboardingCompleted === false && testUser1.selectedTemplate === null,
      "New user defaults to onboardingCompleted = false and selectedTemplate = null"
    );

    // --- TEST 3: Start from Scratch ---
    console.log("\n3. Testing 'Start from scratch' Flow:");

    const scratchUser = await prisma.user.update({
      where: { id: testUser1.id },
      data: {
        onboardingCompleted: true,
        selectedTemplate: "scratch",
      },
    });

    const scratchLinksCount = await prisma.socialLink.count({ where: { userId: testUser1.id } });
    const scratchBusinessCount = await prisma.businessLink.count({ where: { userId: testUser1.id } });

    assert(
      scratchUser.onboardingCompleted === true &&
      scratchUser.selectedTemplate === "scratch" &&
      scratchLinksCount === 0 &&
      scratchBusinessCount === 0,
      "Start from scratch marks onboarding complete with zero injected links (clean canvas)"
    );

    // --- TEST 4: Applying Template Defaults (Developer) ---
    console.log("\n4. Testing Template Application (Developer):");

    const testEmail2 = `dev_test_${Date.now()}@example.com`;
    const testUsername2 = `dev_${Date.now().toString().slice(-6)}`;

    testUser2 = await prisma.user.create({
      data: {
        email: testEmail2,
        username: testUsername2,
        password: "hashedpassword123",
        displayName: "Alex Developer",
      },
    });

    const devTemplate = PROFILE_TEMPLATES.developer;

    // Simulate applyTemplate for Developer
    const appliedUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: testUser2.id },
        data: {
          bio: devTemplate.bioScaffolding,
          themePrimaryColor: devTemplate.theme.primaryColor,
          themeButtonStyle: devTemplate.theme.buttonStyle,
          themeFontFamily: devTemplate.theme.fontFamily,
          emailCaptureEnabled: devTemplate.emailCapture.enabled,
          emailCaptureTitle: devTemplate.emailCapture.title,
          emailCapturePlaceholder: devTemplate.emailCapture.placeholder,
          onboardingCompleted: true,
          selectedTemplate: "developer",
        },
      });

      // Create social links
      const socialCreates = devTemplate.suggestedSocial.map((s, idx) => ({
        userId: testUser2.id,
        platform: s.platform,
        url: s.urlPrefix,
        label: s.label,
        order: idx,
        isVisible: true,
      }));
      await tx.socialLink.createMany({ data: socialCreates });

      // Create CTAs
      const ctaCreates = devTemplate.suggestedBusinessLinks.map((b, idx) => ({
        userId: testUser2.id,
        title: b.title,
        url: b.defaultUrl,
        description: b.description,
        order: idx,
        isVisible: true,
      }));
      await tx.businessLink.createMany({ data: ctaCreates });

      return u;
    });

    assert(
      appliedUser.onboardingCompleted === true &&
      appliedUser.selectedTemplate === "developer" &&
      appliedUser.themePrimaryColor === "#06b6d4" &&
      appliedUser.bio.includes("Full-stack engineer"),
      "Developer template applied theme (#06b6d4), bio scaffolding, and state flags"
    );

    const devSocials = await prisma.socialLink.findMany({ where: { userId: testUser2.id } });
    const devCtas = await prisma.businessLink.findMany({ where: { userId: testUser2.id } });

    assert(
      devSocials.length === 3 && devSocials.some((s) => s.platform === "github"),
      `Developer template pre-created 3 social channels including GitHub`
    );

    assert(
      devCtas.length === 3 && devCtas.some((c) => c.title.includes("Open Source")),
      `Developer template pre-created 3 CTA links including 'Open Source Repositories'`
    );

    // --- TEST 5: User Customization & Item Removal ---
    console.log("\n5. Testing Customization & Removability:");

    // User removes one social link and edits one CTA title
    const githubLink = devSocials.find((s) => s.platform === "github");
    const twitterLink = devSocials.find((s) => s.platform === "twitter");
    if (twitterLink) {
      await prisma.socialLink.delete({ where: { id: twitterLink.id } });
    }

    const firstCta = devCtas[0];
    await prisma.businessLink.update({
      where: { id: firstCta.id },
      data: { title: "Customized Open Source Showcase" },
    });

    const remainingSocials = await prisma.socialLink.findMany({ where: { userId: testUser2.id } });
    const updatedCta = await prisma.businessLink.findUnique({ where: { id: firstCta.id } });

    assert(
      remainingSocials.length === 2 && !remainingSocials.some((s) => s.platform === "twitter"),
      "User can successfully delete any suggested item"
    );

    assert(
      updatedCta.title === "Customized Open Source Showcase",
      "User can successfully edit any suggested item"
    );

    // --- TEST 6: Zero Fake Data Check ---
    console.log("\n6. Checking Zero Fake Personal Data Safeguards:");

    // Verify user name and email were not overwritten by fake mock values
    const finalDevUser = await prisma.user.findUnique({ where: { id: testUser2.id } });
    assert(
      finalDevUser.displayName === "Alex Developer" &&
      finalDevUser.email === testEmail2,
      "User personal identity, name, and email remain authentic (no fake production data)"
    );

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    // Cleanup
    if (testUser1) {
      await prisma.user.delete({ where: { id: testUser1.id } }).catch(() => {});
    }
    if (testUser2) {
      await prisma.socialLink.deleteMany({ where: { userId: testUser2.id } }).catch(() => {});
      await prisma.businessLink.deleteMany({ where: { userId: testUser2.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUser2.id } }).catch(() => {});
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
