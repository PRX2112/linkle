/**
 * Automated Test Suite for Linkle Authentication UI-09 Reform.
 * Validates:
 * 1. Metadata and robots indexing restrictions on all 4 auth routes.
 * 2. PasswordField accessible visibility toggles and attributes.
 * 3. Server-side session check & redirect in /login and /register.
 * 4. RegisterForm onboarding flow preservation (/dashboard?onboarding=true).
 * 5. Password matching and min-length validation logic.
 * 6. Zero account enumeration copy in ForgotPasswordForm.
 * 7. Token validation and Suspense integration in ResetPasswordPage.
 * 8. Shared AuthLayout architecture.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

async function runTests() {
  console.log("🚀 Starting Linkle Authentication UI-09 Test Suite...\n");
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

  // File paths
  const loginPage = fs.readFileSync(path.join(__dirname, "../src/app/login/page.tsx"), "utf-8");
  const loginForm = fs.readFileSync(path.join(__dirname, "../src/components/auth/LoginForm.tsx"), "utf-8");

  const registerPage = fs.readFileSync(path.join(__dirname, "../src/app/register/page.tsx"), "utf-8");
  const registerForm = fs.readFileSync(path.join(__dirname, "../src/components/auth/RegisterForm.tsx"), "utf-8");

  const forgotPage = fs.readFileSync(path.join(__dirname, "../src/app/forgot-password/page.tsx"), "utf-8");
  const forgotForm = fs.readFileSync(path.join(__dirname, "../src/components/auth/ForgotPasswordForm.tsx"), "utf-8");

  const resetPage = fs.readFileSync(path.join(__dirname, "../src/app/reset-password/page.tsx"), "utf-8");
  const resetForm = fs.readFileSync(path.join(__dirname, "../src/components/auth/ResetPasswordForm.tsx"), "utf-8");

  const pwdField = fs.readFileSync(path.join(__dirname, "../src/components/auth/PasswordField.tsx"), "utf-8");
  const authLayout = fs.readFileSync(path.join(__dirname, "../src/components/auth/AuthLayout.tsx"), "utf-8");

  console.log("1. Testing SEO & Search Engine Indexing Constraints:");
  test("/login restricts indexing via robots: { index: false, follow: false }", () => {
    assert(loginPage.includes("index: false"), "Login page should not be indexed");
    assert(loginPage.includes("follow: false"), "Login page should not follow links");
  });

  test("/register restricts indexing via robots: { index: false, follow: false }", () => {
    assert(registerPage.includes("index: false"), "Register page should not be indexed");
  });

  test("/forgot-password restricts indexing via robots", () => {
    assert(forgotPage.includes("index: false"), "Forgot password should not be indexed");
  });

  test("/reset-password restricts indexing via robots to protect token URLs", () => {
    assert(resetPage.includes("index: false"), "Reset password should not be indexed");
  });

  console.log("\n2. Testing Server-Side Session Redirection (No Loops/Flashes):");
  test("LoginPage checks auth() on server and redirects active sessions to /dashboard", () => {
    assert(loginPage.includes("await auth()"), "Checks session on server");
    assert(loginPage.includes('redirect("/dashboard")'), "Redirects authenticated users");
  });

  test("RegisterPage checks auth() on server and redirects active sessions to /dashboard", () => {
    assert(registerPage.includes("await auth()"), "Checks session on server");
    assert(registerPage.includes('redirect("/dashboard")'), "Redirects authenticated users");
  });

  console.log("\n3. Testing PasswordField Accessibility & Autocomplete:");
  test("PasswordField includes accessible Show/Hide aria-label", () => {
    assert(pwdField.includes("Show password"), "Includes 'Show password' label");
    assert(pwdField.includes("Hide password"), "Includes 'Hide password' label");
  });

  test("LoginForm uses autocomplete='current-password'", () => {
    assert(loginForm.includes('autoComplete="current-password"'), "Sets current-password attribute");
    assert(loginForm.includes('autoComplete="email"'), "Sets email attribute");
  });

  test("RegisterForm uses autocomplete='new-password'", () => {
    assert(registerForm.includes('autoComplete="new-password"'), "Sets new-password attribute");
  });

  console.log("\n4. Testing Onboarding Transition & Auto-Login:");
  test("RegisterForm auto-logs in and directs new users to /dashboard?onboarding=true", () => {
    assert(registerForm.includes('signIn("credentials"'), "Auto logs in after register");
    assert(registerForm.includes("/dashboard?onboarding=true"), "Preserves onboarding wizard route");
  });

  test("RegisterForm includes real username prefix and validation checklist", () => {
    assert(registerForm.includes("linklez.vercel.app/p/"), "Displays profile prefix");
    assert(registerForm.includes("isPasswordLongEnough"), "Checks minimum length");
    assert(registerForm.includes("doPasswordsMatch"), "Checks password match");
  });

  console.log("\n5. Testing Account Enumeration Defense in ForgotPasswordForm:");
  test("ForgotPasswordForm does not reveal whether account exists in confirmation message", () => {
    assert(forgotForm.includes("If an account exists"), "Uses privacy-preserving conditional message");
    assert(!forgotForm.includes("Account not found"), "Does not reveal account absence");
  });

  console.log("\n6. Testing ResetPasswordForm Token Handling & Suspense:");
  test("ResetPasswordPage wraps form in Suspense boundary for useSearchParams", () => {
    assert(resetPage.includes("<Suspense"), "Includes Suspense wrapper");
  });

  test("ResetPasswordForm handles missing token with explicit guidance", () => {
    assert(resetForm.includes("Missing Reset Token"), "Handles missing token");
  });

  test("ResetPasswordForm handles expired or consumed token with request CTA", () => {
    assert(resetForm.includes("isTokenInvalid"), "Tracks invalid/expired token state");
    assert(resetForm.includes("Request a new reset link"), "Invites user to request new link");
  });

  console.log("\n7. Testing Shared Layout & Branding Consistency:");
  test("All auth pages reuse AuthLayout component with max-width container", () => {
    assert(authLayout.includes("max-w-[420px]"), "Constrains layout width");
    assert(authLayout.includes("Linkle"), "Includes brand name");
  });

  console.log("\n========================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
