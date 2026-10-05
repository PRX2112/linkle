/**
 * Linkle UI-10 Global Responsive & Mobile UX Verification Suite
 * Validates responsive design tokens, safe-area utilities, touch target envelopes,
 * modal viewport constraints, and responsive presentation across key components.
 */

const fs = require('fs');
const path = require('path');

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    return true;
  } catch (err) {
    console.error(`FAIL: ${name}`);
    console.error(`  -> ${err.message}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

let totalPassed = 0;
let totalTests = 0;

console.log('=== Linkle UI-10 Global Responsive & Mobile UX Tests ===\n');

// 1. Global CSS & Safe Area Utilities
totalTests++;
if (runTest('globals.css defines mobile safe-area insets and horizontal overflow constraints', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf-8');
  assert(content.includes('overflow-x: hidden'), 'globals.css must enforce overflow-x: hidden');
  assert(content.includes('.pb-safe'), 'globals.css must provide .pb-safe utility');
  assert(content.includes('.pt-safe'), 'globals.css must provide .pt-safe utility');
  assert(content.includes('.bottom-safe'), 'globals.css must provide .bottom-safe utility');
  assert(content.includes('.touch-target'), 'globals.css must provide .touch-target utility');
  assert(content.includes('prefers-reduced-motion'), 'globals.css must support reduced motion');
})) totalPassed++;

// 2. Modal Viewport Bounding & Scrolling
totalTests++;
if (runTest('Modal.tsx bounds surface to 100dvh and provides internal scrollable body', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/ui/Modal.tsx'), 'utf-8');
  assert(content.includes('max-h-[calc(100dvh-2rem)]'), 'Modal must constrain surface height on mobile');
  assert(content.includes('overflow-y-auto flex-1'), 'Modal body must scroll internally');
  assert(content.includes('min-w-[36px] min-h-[36px]'), 'Modal close button must have >=36px touch envelope');
  assert(content.includes('role="dialog"'), 'Modal must have accessible dialog semantics');
})) totalPassed++;

// 3. DashboardHeader Mobile Touch Targets & Canonical Domain
totalTests++;
if (runTest('DashboardHeader.tsx provides comfortable touch targets and linkle.app canonical URL', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/DashboardHeader.tsx'), 'utf-8');
  assert(content.includes('min-w-[38px] min-h-[38px]'), 'Mobile menu button must have >=38px touch envelope');
  assert(content.includes('min-h-[38px]'), 'Mobile preview toggle button must have >=38px touch envelope');
  assert(content.includes('linkle.app/p/'), 'DashboardHeader must display linkle.app canonical URL');
  assert(!content.includes('linkle.me/p/'), 'DashboardHeader must not display outdated linkle.me URL');
})) totalPassed++;

// 4. DashboardSidebar Mobile Navigation & Safe Areas
totalTests++;
if (runTest('DashboardSidebar.tsx enforces touch envelopes, pb-safe, and close button accessibility', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/DashboardSidebar.tsx'), 'utf-8');
  assert(content.includes('min-h-[40px]'), 'Mobile navigation items must have min-h-[40px]');
  assert(content.includes('min-w-[38px] min-h-[38px]'), 'Mobile close button must have >=38px touch envelope');
  assert(content.includes('pb-safe'), 'Mobile drawer panel must include pb-safe for iOS home bar');
})) totalPassed++;

// 5. DashboardShell Mobile Preview & Scroll Locking
totalTests++;
if (runTest('DashboardShell.tsx manages body scroll lock and safe areas for mobile preview', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/DashboardShell.tsx'), 'utf-8');
  assert(content.includes('document.body.style.overflow = "hidden"'), 'DashboardShell must lock body scroll when mobile overlays open');
  assert(content.includes('pt-safe'), 'Mobile preview top bar must account for device notch');
  assert(content.includes('pb-safe'), 'Mobile preview container must account for home bar');
  assert(content.includes('min-h-[38px]'), 'Close preview button must have comfortable touch target');
})) totalPassed++;

// 6. UserMenu Canonical Link
totalTests++;
if (runTest('UserMenu.tsx canonical link references linkle.app', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/UserMenu.tsx'), 'utf-8');
  assert(content.includes('linkle.app/p/'), 'UserMenu must display linkle.app canonical URL');
  assert(!content.includes('linkle.me/p/'), 'UserMenu must not display outdated linkle.me URL');
})) totalPassed++;

// 7. LinkItemRow Mobile Usability & Title Wrapping
totalTests++;
if (runTest('LinkItemRow.tsx provides >=36px drag handle and more-menu envelopes and prevents 360px overflow', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/LinkItemRow.tsx'), 'utf-8');
  assert(content.includes('min-w-[36px] min-h-[36px]'), 'Drag handle and actions must have >=36px touch targets');
  assert(content.includes('max-w-[130px]'), 'Title must clamp to max-w-[130px] on narrow screens to prevent horizontal overflow');
})) totalPassed++;

// 8. LinksManager Canonical Link and Responsive Layout
totalTests++;
if (runTest('LinksManager.tsx uses linkle.app canonical URL and responsive category tabs', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/LinksManager.tsx'), 'utf-8');
  assert(content.includes('linkle.app/p/'), 'LinksManager must display linkle.app URL');
  assert(!content.includes('linkle.me/p/'), 'LinksManager must not display outdated linkle.me URL');
  assert(content.includes('overflow-x-auto no-scrollbar'), 'Category tabs must scroll smoothly without visible scrollbar');
})) totalPassed++;

// 9. AppearanceForm Unsaved Bar Safe Area
totalTests++;
if (runTest('AppearanceForm.tsx includes safe-area bottom clearance for floating bar', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/AppearanceForm.tsx'), 'utf-8');
  assert(content.includes('pb-safe'), 'Floating unsaved changes bar must include pb-safe');
})) totalPassed++;

// 10. UpiPayModal Mobile Viewport Constraints
totalTests++;
if (runTest('UpiPayModal.tsx constrains height to 100dvh with internal scrolling and >=36px close button', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/profile/UpiPayModal.tsx'), 'utf-8');
  assert(content.includes('max-h-[calc(100dvh-2rem)]'), 'UPI payment modal must constrain height to viewport');
  assert(content.includes('overflow-y-auto'), 'UPI modal must scroll internally if needed');
  assert(content.includes('min-w-[36px] min-h-[36px]'), 'UPI close button must have >=36px touch target');
  assert(content.includes('Pay via UPI App'), 'UPI modal must prioritize native deep link CTA');
})) totalPassed++;

// 11. ProfileContainer Safe Area & Touch Targets
totalTests++;
if (runTest('ProfileContainer.tsx enforces pt-safe, pr-safe, and >=40px touch targets for profile actions', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/profile/ProfileContainer.tsx'), 'utf-8');
  assert(content.includes('pt-safe pr-safe'), 'Top utility controls must include safe-area insets');
  assert(content.includes('min-w-[40px] min-h-[40px]'), 'Share and QR trigger buttons must have >=40px touch envelope');
  assert(content.includes('max-h-[calc(100dvh-2rem)]'), 'Profile QR modal must be bounded to viewport');
})) totalPassed++;

// 12. BillingHistorySection Mobile Card Layout
totalTests++;
if (runTest('BillingHistorySection.tsx renders cards on mobile and table on desktop', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/billing/BillingHistorySection.tsx'), 'utf-8');
  assert(content.includes('sm:hidden space-y-3'), 'Billing history must have mobile card representation');
  assert(content.includes('hidden sm:block overflow-x-auto'), 'Desktop table must only appear on sm: viewports');
})) totalPassed++;

// 13. Settings Forms Responsive Action Sizing
totalTests++;
if (runTest('Settings sections provide full-width mobile action buttons and canonical domain', () => {
  const profileSection = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/settings/AccountProfileSection.tsx'), 'utf-8');
  assert(profileSection.includes('w-full sm:w-auto'), 'Save button must be full-width on mobile');
  assert(profileSection.includes('linkle.app/p/'), 'Username preview must show linkle.app');

  const securitySection = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/settings/AccountSecuritySection.tsx'), 'utf-8');
  assert(securitySection.includes('w-full sm:w-auto'), 'Reset link button must be full-width on mobile');

  const dangerSection = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/settings/DangerZoneSection.tsx'), 'utf-8');
  assert(dangerSection.includes('w-full sm:w-auto'), 'Delete account trigger button must be full-width on mobile');
  assert(dangerSection.includes('max-h-[calc(100dvh-2rem)]'), 'Delete confirmation modal must have bounded height');
})) totalPassed++;

// 14. MobilePreview Narrow Viewport Safety
totalTests++;
if (runTest('MobilePreview.tsx adapts device frame on narrow mobile viewports', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/dashboard/MobilePreview.tsx'), 'utf-8');
  assert(content.includes('max-w-[calc(100vw-2.5rem)]'), 'MobilePreview frame must not overflow viewport on 360px');
})) totalPassed++;

// 15. LandingNavbar Responsive Navigation & Drawer
totalTests++;
if (runTest('LandingNavbar.tsx uses Next.js Link, pb-safe, and >=40px mobile hamburger trigger', () => {
  const content = fs.readFileSync(path.join(__dirname, '../src/components/landing/LandingNavbar.tsx'), 'utf-8');
  assert(content.includes('min-w-[40px] min-h-[40px]'), 'Mobile menu toggle button must have >=40px touch envelope');
  assert(content.includes('pb-safe'), 'Mobile drawer must include pb-safe');
  assert(!content.includes('<a\n              key={item.href}'), 'LandingNavbar should not use raw a tags for nav items');
})) totalPassed++;

console.log(`\n========================================`);
console.log(`Summary: ${totalPassed} / ${totalTests} tests passed`);
console.log(`========================================\n`);

if (totalPassed !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
