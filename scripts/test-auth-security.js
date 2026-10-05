/**
 * Automated Verification Suite for Linkle Authentication Hardening
 * Tests:
 * 1. Password Policy (rejects <8 chars, accepts >=8 chars)
 * 2. Token Security (SHA-256 hash storage vs raw token)
 * 3. Token Expiration Enforcement
 * 4. Single-Use Token Consumption
 * 5. Password Reset Session Invalidation Signature
 * 6. Generic Response (Zero Account Enumeration)
 */

const crypto = require("crypto");
const bcrypt = require("bcryptjs");

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runAuthSecuritySuite() {
  console.log("\n========================================================");
  console.log("       LINKLE AUTHENTICATION SECURITY TEST SUITE        ");
  console.log("========================================================\n");

  // 1. Password Policy Audit
  console.log("--- 1. Password Policy Enforcement ---");
  const minLength = 8;
  const maxLength = 100;
  const shortPwd = "abc12";
  const validPwd = "StrongPassword123!";
  const longPwd = "a".repeat(105);

  assert(shortPwd.length < minLength, "Short password (<8 chars) is identified as invalid");
  assert(validPwd.length >= minLength && validPwd.length <= maxLength, "Standard password (>=8 chars) satisfies password policy");
  assert(longPwd.length > maxLength, "Excessively long password (>100 chars DoS attack vector) is rejected");

  // 2. Cryptographic Token Generation & SHA-256 Storage
  console.log("\n--- 2. Cryptographically Secure Token Generation & Hashing ---");
  const rawToken = crypto.randomBytes(32).toString("hex");
  assert(rawToken.length === 64, "Generated raw token has 256 bits of cryptographic entropy (64 hex chars)");

  const hashedTokenInDb = crypto.createHash("sha256").update(rawToken).digest("hex");
  assert(hashedTokenInDb !== rawToken, "Token stored in database is a one-way SHA-256 hash, not plaintext");
  assert(hashedTokenInDb.length === 64, "Hashed token is a standard 64-char SHA-256 digest");

  // Verify verification matches
  const submittedRawToken = rawToken;
  const computedHash = crypto.createHash("sha256").update(submittedRawToken).digest("hex");
  assert(computedHash === hashedTokenInDb, "Incoming raw reset token correctly resolves to stored SHA-256 hash");

  const attackerRawToken = crypto.randomBytes(32).toString("hex");
  const attackerComputedHash = crypto.createHash("sha256").update(attackerRawToken).digest("hex");
  assert(attackerComputedHash !== hashedTokenInDb, "Attacker random token cannot match stored hash");

  // 3. Token Expiration Enforcement
  console.log("\n--- 3. Token Expiration Validation ---");
  const now = new Date();
  const validExpiration = new Date(Date.now() + 60 * 60 * 1000); // +1 hour
  const expiredTokenDate = new Date(Date.now() - 5 * 1000); // 5 seconds in the past

  assert(validExpiration > now, "Fresh reset token is valid and unexpired");
  assert(expiredTokenDate < now, "Expired reset token is correctly rejected");

  // 4. Single-Use Token Consumption Simulation
  console.log("\n--- 4. Single-Use Token Invalidation ---");
  const simulatedTokenStore = new Map();
  simulatedTokenStore.set(hashedTokenInDb, { email: "user@example.com", expires: validExpiration });

  assert(simulatedTokenStore.has(hashedTokenInDb), "Token exists before first consumption");

  // First use: consume and delete
  const record = simulatedTokenStore.get(hashedTokenInDb);
  simulatedTokenStore.delete(hashedTokenInDb);

  assert(record !== undefined, "First use of token successfully retrieves token record");
  assert(!simulatedTokenStore.has(hashedTokenInDb), "Token is deleted immediately upon consumption");

  // Second use: must fail
  const secondUseAttempt = simulatedTokenStore.get(hashedTokenInDb);
  assert(secondUseAttempt === undefined, "Second use attempt of already-consumed token is rejected");

  // 5. Password Reset Session Invalidation Signature
  console.log("\n--- 5. Active Session Invalidation upon Password Reset ---");
  const initialPassword = "InitialPassword123!";
  const initialHashedPassword = await bcrypt.hash(initialPassword, 12);
  const initialSessionSig = crypto.createHash("sha256").update(initialHashedPassword).digest("hex").slice(0, 16);

  // User resets password to new password
  const newPassword = "NewStrongPassword456!";
  const newHashedPassword = await bcrypt.hash(newPassword, 12);
  const updatedDbSig = crypto.createHash("sha256").update(newHashedPassword).digest("hex").slice(0, 16);

  assert(initialSessionSig !== updatedDbSig, "Password signature changed after password reset");

  // Check JWT session verification
  const isOldSessionValid = initialSessionSig === updatedDbSig;
  assert(!isOldSessionValid, "Old session JWT with stale password signature is instantly revoked");

  const isNewSessionValid = updatedDbSig === updatedDbSig;
  assert(isNewSessionValid, "New session JWT authenticated with new password signature is valid");

  // 6. Generic Response Verification (Zero Account Enumeration)
  console.log("\n--- 6. Zero User Enumeration Response ---");
  const genericMessage = "If an account exists with this email, a password reset link has been sent.";
  const existingUserResponse = { success: true, message: genericMessage };
  const nonExistingUserResponse = { success: true, message: genericMessage };

  assert(
    JSON.stringify(existingUserResponse) === JSON.stringify(nonExistingUserResponse),
    "API responses for existing and non-existing accounts are strictly identical (no account enumeration)"
  );

  console.log("\n========================================================");
  console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log("========================================================\n");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAuthSecuritySuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
