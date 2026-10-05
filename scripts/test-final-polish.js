/**
 * LINKLE UI/UX REFORM — STEP UI-11 TEST SUITE
 * Final Product Polish, States, Accessibility & Micro-Interactions
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- LINKLE STEP UI-11 FINAL POLISH TEST SUITE ---\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// 1. Toast Provider & useToast Hook
runTest('Toast component exports ToastProvider and useToast hook', () => {
  const toastPath = path.join(__dirname, '../src/components/ui/Toast.tsx');
  assert.ok(fs.existsSync(toastPath), 'Toast.tsx must exist');
  const content = fs.readFileSync(toastPath, 'utf8');
  assert.ok(content.includes('export function ToastProvider'), 'Must export ToastProvider');
  assert.ok(content.includes('export function useToast'), 'Must export useToast');
  assert.ok(content.includes('role=') && content.includes('"status"'), 'Must have accessible status role');
  assert.ok(content.includes('aria-live="polite"'), 'Must have aria-live polite announcement');
});

// 2. Providers.tsx mounts ToastProvider
runTest('Providers.tsx mounts ToastProvider globally', () => {
  const providersPath = path.join(__dirname, '../src/components/Providers.tsx');
  const content = fs.readFileSync(providersPath, 'utf8');
  assert.ok(content.includes('ToastProvider'), 'Providers.tsx must wrap tree with ToastProvider');
});

// 3. Global 404 Page
runTest('Global 404 page exists and provides clear human recovery', () => {
  const notFoundPath = path.join(__dirname, '../src/app/not-found.tsx');
  assert.ok(fs.existsSync(notFoundPath), 'src/app/not-found.tsx must exist');
  const content = fs.readFileSync(notFoundPath, 'utf8');
  assert.ok(content.includes("Page not found"), 'Must have human readable page not found message');
  assert.ok(content.includes("Home") && content.includes("href=\"/\""), 'Must have return home CTA');
  assert.ok(content.includes("Dashboard"), 'Must provide dashboard recovery link');
});

// 4. Public Profile 404 Page
runTest('Public profile not-found page exists and provides profile-aware recovery', () => {
  const profileNotFoundPath = path.join(__dirname, '../src/app/p/[username]/not-found.tsx');
  assert.ok(fs.existsSync(profileNotFoundPath), 'src/app/p/[username]/not-found.tsx must exist');
  const content = fs.readFileSync(profileNotFoundPath, 'utf8');
  assert.ok(content.includes("This profile isn") && content.includes("available"), 'Must display dedicated profile unavailable message');
  assert.ok(content.includes("Claim your Linkle URL"), 'Must offer username claim CTA');
});

// 5. Client-Side URL Scheme Sanitization in Public Profile
runTest('URL scheme sanitization prevents javascript: and dangerous execution', () => {
  const businessPath = path.join(__dirname, '../src/components/profile/BusinessSection.tsx');
  const socialPath = path.join(__dirname, '../src/components/profile/SocialLinks.tsx');
  const businessContent = fs.readFileSync(businessPath, 'utf8');
  const socialContent = fs.readFileSync(socialPath, 'utf8');

  assert.ok(businessContent.includes('sanitizeUrl'), 'BusinessSection must sanitize URLs');
  assert.ok(businessContent.includes('javascript:') && businessContent.includes('vbscript:'), 'Must block javascript: and vbscript:');
  assert.ok(socialContent.includes('sanitizeUrl'), 'SocialLinks must sanitize URLs');
  assert.ok(socialContent.includes('javascript:') && socialContent.includes('vbscript:'), 'Must block javascript: and vbscript:');
});

// 6. LinkEditModal URL Validation
runTest('LinkEditModal validates URL schemes before saving', () => {
  const modalPath = path.join(__dirname, '../src/components/dashboard/LinkEditModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf8');
  assert.ok(content.includes('javascript:') && content.includes('vbscript:'), 'Must reject dangerous URI schemes');
  assert.ok(content.includes('Dangerous URL schemes are not permitted'), 'Must show friendly validation message');
});

// 7. LinksManager Zero-States for Tools & Subscribers
runTest('LinksManager has educational zero-states for tools & subscribers', () => {
  const lmPath = path.join(__dirname, '../src/components/dashboard/LinksManager.tsx');
  const content = fs.readFileSync(lmPath, 'utf8');
  assert.ok(content.includes('Email capture is currently disabled'), 'Must inform when email capture is turned off');
  assert.ok(content.includes('No subscribers collected yet'), 'Must show educational empty state for subscribers');
});

// 8. Billing History Zero-State
runTest('Billing history has clean zero-state for new subscribers', () => {
  const billingPath = path.join(__dirname, '../src/components/dashboard/billing/BillingHistorySection.tsx');
  const content = fs.readFileSync(billingPath, 'utf8');
  assert.ok(content.includes('No invoices yet'), 'Must provide clear empty state description');
});

// 9. LinksManager Toast Integration
runTest('LinksManager integrates useToast for notifications', () => {
  const lmPath = path.join(__dirname, '../src/components/dashboard/LinksManager.tsx');
  const content = fs.readFileSync(lmPath, 'utf8');
  assert.ok(content.includes('useToast'), 'LinksManager must import and use useToast');
  assert.ok(content.includes('toast.info("Profile link copied to clipboard")'), 'Must toast on profile URL copy');
});

// 10. AppearanceForm Toast Integration & Unsaved Safeguards
runTest('AppearanceForm integrates useToast and beforeunload safeguard', () => {
  const appPath = path.join(__dirname, '../src/components/dashboard/AppearanceForm.tsx');
  const content = fs.readFileSync(appPath, 'utf8');
  assert.ok(content.includes('useToast'), 'AppearanceForm must use useToast');
  assert.ok(content.includes('beforeunload'), 'AppearanceForm must have beforeunload handler');
  assert.ok(content.includes('savedSnapshot'), 'AppearanceForm must track saved state snapshot');
});

// 11. Modal Accessibility: QRCodeModal
runTest('QRCodeModal implements Escape key listener and dialog ARIA roles', () => {
  const qrPath = path.join(__dirname, '../src/components/dashboard/QRCodeModal.tsx');
  const content = fs.readFileSync(qrPath, 'utf8');
  assert.ok(content.includes('role="dialog"'), 'Must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Must have aria-modal="true"');
  assert.ok(content.includes('handleKeyDown') && content.includes('"Escape"'), 'Must close on Escape key');
});

// 12. Modal Accessibility: UpiPayModal
runTest('UpiPayModal implements Escape key listener and dialog ARIA roles', () => {
  const upiPath = path.join(__dirname, '../src/components/profile/UpiPayModal.tsx');
  const content = fs.readFileSync(upiPath, 'utf8');
  assert.ok(content.includes('role="dialog"'), 'Must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Must have aria-modal="true"');
  assert.ok(content.includes('handleKeyDown') && content.includes('"Escape"'), 'Must close on Escape key');
  assert.ok(content.includes('upi-modal-title'), 'Must link title with aria-labelledby');
});

// 13. Modal Accessibility: ProfileContainer QR Modal
runTest('ProfileContainer QR modal implements Escape key listener and dialog ARIA roles', () => {
  const pcPath = path.join(__dirname, '../src/components/profile/ProfileContainer.tsx');
  const content = fs.readFileSync(pcPath, 'utf8');
  assert.ok(content.includes('role="dialog"'), 'Must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Must have aria-modal="true"');
  assert.ok(content.includes('"Escape"'), 'Must close on Escape key');
});

// 14. DeleteConfirmModal Destructive Action Safety
runTest('DeleteConfirmModal provides clear warning and disables cancel during in-flight deletion', () => {
  const dcmPath = path.join(__dirname, '../src/components/dashboard/DeleteConfirmModal.tsx');
  const content = fs.readFileSync(dcmPath, 'utf8');
  assert.ok(content.includes('permanently remove'), 'Must inform user what will be lost');
  assert.ok(content.includes('disabled={isDeleting}'), 'Must disable cancel during deletion');
  assert.ok(content.includes('isLoading={isDeleting}'), 'Must display spinner on delete button');
});

// 15. Reduced Motion in globals.css
runTest('globals.css provides prefers-reduced-motion media query and safe areas', () => {
  const cssPath = path.join(__dirname, '../src/app/globals.css');
  const content = fs.readFileSync(cssPath, 'utf8');
  assert.ok(content.includes('@media (prefers-reduced-motion: reduce)'), 'Must respect reduced motion');
  assert.ok(content.includes('pb-safe') && content.includes('env(safe-area-inset-bottom'), 'Must support safe areas');
});

console.log(`\n========================================`);
console.log(`FINAL POLISH TEST SUMMARY: ${passedTests} / ${totalTests} passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
