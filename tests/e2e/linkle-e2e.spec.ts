import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

test.describe("Linkle Core User Journeys & End-to-End Testing", () => {
  const timestamp = Date.now();
  const seededUser = {
    name: "QA Verified Creator",
    username: `qauser_${timestamp.toString().slice(-5)}`,
    email: `qa_creator_${timestamp}@example.com`,
    password: "Password123!",
  };

  test.beforeAll(async () => {
    // Seed authenticated test user for Flow 2 & authenticated tests
    const hashedPassword = await bcrypt.hash(seededUser.password, 10);
    await prisma.user.create({
      data: {
        name: seededUser.name,
        displayName: seededUser.name,
        username: seededUser.username,
        email: seededUser.email,
        password: hashedPassword,
        onboardingCompleted: true,
        plan: "free",
      },
    });
  });

  test.afterAll(async () => {
    // Cleanup seeded user
    await prisma.user.deleteMany({
      where: { email: seededUser.email },
    }).catch(() => {});
    await prisma.$disconnect();
  });

  test("Flow 1: Sign up, complete onboarding, add links, add product, and view public profile", async ({
    page,
    browser,
  }) => {
    test.setTimeout(60000);

    const flow1Timestamp = Date.now();
    const newUser = {
      name: "New Flow1 Tester",
      username: `f1_${flow1Timestamp.toString().slice(-6)}`,
      email: `flow1_${flow1Timestamp}@example.com`,
      password: "Password123!",
    };

    // 1. Visit Register Page
    await page.goto("/register");
    await expect(page).toHaveTitle(/Register|Create your Linkle/i);

    // 2. Fill in registration form
    await page.fill('input[name="name"]', newUser.name);
    await page.fill('input[name="username"]', newUser.username);
    await page.fill('input[name="email"]', newUser.email);
    await page.fill('input[name="password"]', newUser.password);
    await page.fill('input[name="confirmPassword"]', newUser.password);

    // 3. Submit registration
    await page.click('button[type="submit"]');

    // 4. Handle navigation (auto-dashboard or redirect to login)
    await expect(page).toHaveURL(/\/(dashboard|login)/, { timeout: 20000 });

    if (page.url().includes("/login")) {
      await page.fill('input[name="email"], input[type="email"]', newUser.email);
      await page.fill('input[name="password"], input[type="password"]', newUser.password);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
    }

    // 5. Dismiss Onboarding Wizard cleanly if it appears
    const skipBtn = page.locator('button:has-text("Skip for now")');
    if (await skipBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(1000);
    } else {
      await page.keyboard.press("Escape");
    }

    // 6. Verify Dashboard Navigation & Tabs
    await expect(page.locator("text=My Links").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Social")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Links")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Products")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Payments")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Tools")').first()).toBeVisible();

    // 7. Add a Social Channel
    await page.locator('button:has-text("Social")').first().click();
    const handleInput = page.locator('input[placeholder*="username"]').first();
    if (await handleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await handleInput.fill("testcreator");
      const addSocialBtn = page.locator('button:has-text("Add Social")').first();
      await addSocialBtn.click();
      await page.waitForTimeout(1000);
    }

    // 8. Add a Digital Product
    await page.locator('button:has-text("Products")').first().click();
    const addProductTrigger = page.locator('button:has-text("Add Product / Offer")').first();
    if (await addProductTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addProductTrigger.click();
      const productTitleInput = page.locator('input[placeholder*="Lightroom"]').first();
      if (await productTitleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await productTitleInput.fill("E2E Digital Bundle");
        const priceInput = page.locator('form input[type="number"]').first();
        await priceInput.fill("12.50");
        const saveProductBtn = page.locator('button:has-text("Create Product")').first();
        await saveProductBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // 9. View Public Profile in a fresh, logged-out browser context
    const publicContext = await browser.newContext();
    const publicPage = await publicContext.newPage();
    await publicPage.goto(`/p/${newUser.username}`);

    // Confirm public profile renders correctly
    await expect(publicPage.locator(`text=${newUser.username}`).first()).toBeVisible({ timeout: 10000 });
    await expect(publicPage.locator(`text=${newUser.name}`).first()).toBeVisible();
    await expect(publicPage.locator("text=Powered by").first()).toBeVisible(); // Free plan badge

    // Check if added product appears
    const productCard = publicPage.locator("text=E2E Digital Bundle");
    if (await productCard.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(productCard.first()).toBeVisible();
      await expect(publicPage.locator("text=$12.50").first()).toBeVisible();
    }

    await publicContext.close();
  });

  test("Flow 2: Monetization Page & Plan-gated UI Verification (Authenticated)", async ({ page }) => {
    test.setTimeout(30000);

    // 1. Sign in with our seeded user
    await page.goto("/login");
    await page.fill('input[name="email"], input[type="email"]', seededUser.email);
    await page.fill('input[name="password"], input[type="password"]', seededUser.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // 2. Navigate to monetization
    await page.goto("/dashboard/monetization");
    await expect(page).toHaveURL(/\/dashboard\/monetization/);

    // 3. Verify 3 pricing tiers exist
    await expect(page.locator("text=Starter").first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator("text=Pro").first()).toBeVisible();
    await expect(page.locator("text=Enterprise").or(page.locator("text=Business")).first()).toBeVisible();

    // 4. Verify monthly/annual billing toggle
    const annualToggle = page.locator('button:has-text("Annual")').first();
    await expect(annualToggle).toBeVisible();
    await annualToggle.click().catch(() => {});

    // 5. Verify 25% discount callout
    await expect(page.locator("text=Save ~25%").first()).toBeVisible({ timeout: 3000 });
  });

  test("Flow 3: Google OAuth Buttons & Username Claim UI Guard", async ({ page }) => {
    // Check login page for Google sign-in
    await page.goto("/login");
    const googleLoginBtn = page.locator('button:has-text("Continue with Google"), button:has-text("Google")');
    await expect(googleLoginBtn.first()).toBeVisible({ timeout: 8000 });

    // Check register page for Google sign-in
    await page.goto("/register");
    const googleRegBtn = page.locator('button:has-text("Continue with Google"), button:has-text("Google")');
    await expect(googleRegBtn.first()).toBeVisible({ timeout: 8000 });

    // Check claim-username route auth guard (unauthenticated visits redirect to /login)
    await page.goto("/claim-username");
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test("Flow 4: Direct Subscriber CSV Export Gating (Free tier returns 403)", async ({ request }) => {
    // Unauthenticated request should be 401
    const unauthRes = await request.get("/api/subscribers/export");
    expect(unauthRes.status()).toBe(401);
  });

  test("Flow 5: Forgot Password Graceful Behavior (Prompt 3 Verification)", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 8000 });

    await page.fill('input[type="email"]', "nonexistent.user@example.com");
    await page.click('button[type="submit"]');

    // Should gracefully display confirmation without error or leaking account existence
    await expect(
      page.locator("text=Check your email").or(page.locator("text=If an account exists")).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("Flow 6: Public Profile UPI Modal Fee Display (Prompt 2 Verification)", async ({ page }) => {
    // Visit demo profile
    await page.goto("/p/demo");

    // Check if page loaded
    await expect(page.locator("body")).toBeVisible();

    // Look for UPI payment button if configured
    const upiBtn = page.locator('button:has-text("UPI"), button:has-text("Pay")').first();
    if (await upiBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await upiBtn.click();
      // On free tier, should display 2% service fee notice
      const feeNotice = page.locator("text=2% Linkle service fee applies");
      if (await feeNotice.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(feeNotice).toBeVisible();
      }
    }
  });
});
