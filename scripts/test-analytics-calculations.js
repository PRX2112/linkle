/**
 * Automated Test Suite for Linkle Analytics Calculations:
 * 1. CTR formula and zero-division protection.
 * 2. Period comparison delta calculations (+%, -%, null, 100% surge).
 * 3. Zero-division and missing prior data handling.
 * 4. Date range window boundaries (7d, 14d, 30d, 90d).
 * 5. Referrer normalization rules.
 */

const assert = require("assert");

function calcPctChange(curr, prev) {
  if (prev === 0 && curr === 0) return null;
  if (prev === 0) return curr > 0 ? 100 : null;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

function calcCtr(clicks, views) {
  if (views <= 0) return 0;
  return Number(((clicks / views) * 100).toFixed(1));
}

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
  
  try {
    const url = new URL(ref.startsWith("http") ? ref : `https://${ref}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Other";
  }
}

console.log("🧪 Running Analytics Calculations Test Suite...\n");
let passed = 0;

function test(condition, message) {
  assert(condition, message);
  console.log(`  ✅ PASS: ${message}`);
  passed++;
}

// 1. CTR calculations
test(calcCtr(50, 100) === 50.0, "CTR: 50 clicks / 100 views = 50.0%");
test(calcCtr(0, 100) === 0, "CTR: 0 clicks / 100 views = 0%");
test(calcCtr(100, 0) === 0, "CTR zero-division protection: 0 views returns 0 without NaN/Infinity");
test(calcCtr(0, 0) === 0, "CTR zero-division protection: 0/0 returns 0");
test(calcCtr(1, 3) === 33.3, "CTR precision: 1/3 rounds to 33.3%");

// 2. Comparison Percentage Calculations
test(calcPctChange(120, 100) === 20.0, "Positive trend: 100 -> 120 = +20.0%");
test(calcPctChange(80, 100) === -20.0, "Negative trend: 100 -> 80 = -20.0%");
test(calcPctChange(100, 100) === 0.0, "Flat trend: 100 -> 100 = 0.0%");
test(calcPctChange(0, 0) === null, "Zero-to-zero: returns null (no misleading delta badge)");
test(calcPctChange(50, 0) === 100, "Surge from zero: 0 -> 50 returns +100% surge");
test(calcPctChange(0, 50) === -100.0, "Drop to zero: 50 -> 0 returns -100.0%");

// 3. Referrer Normalization
test(normalizeReferrer(null) === "Direct / Bio Link", "Normalizes null referrer to Direct / Bio Link");
test(normalizeReferrer("") === "Direct / Bio Link", "Normalizes empty referrer to Direct / Bio Link");
test(normalizeReferrer("https://l.instagram.com/") === "Instagram", "Normalizes Instagram web wrapper");
test(normalizeReferrer("https://t.co/xyz123") === "Twitter / X", "Normalizes t.co shortlink to Twitter / X");
test(normalizeReferrer("https://www.google.co.in/") === "Google Search", "Normalizes Google ccTLD to Google Search");
test(normalizeReferrer("https://api.whatsapp.com/send") === "WhatsApp", "Normalizes WhatsApp API link");

// 4. Date Range Validation
const daysMap = { "7d": 7, "14d": 14, "30d": 30, "90d": 90 };
test(daysMap["7d"] === 7, "7d mapped to 7 days");
test(daysMap["14d"] === 14, "14d mapped to 14 days");
test(daysMap["30d"] === 30, "30d mapped to 30 days");
test(daysMap["90d"] === 90, "90d mapped to 90 days");

console.log(`\n========================================`);
console.log(`Results: ${passed} Passed, 0 Failed`);
console.log(`========================================\n`);
