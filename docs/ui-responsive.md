# Linkle UI-10: Global Responsive & Mobile Experience Specification

This document details the global responsive design system, mobile interaction patterns, viewport breakpoints, modal viewport constraints, touch-target envelopes, and accessibility standards across the Linkle application.

---

## 1. Breakpoint Strategy

Linkle employs a focused, predictable breakpoint hierarchy built directly on top of Tailwind CSS primitives. Breakpoints scale contextually rather than merely shrinking desktop elements.

| Breakpoint | Viewport Width | Target Devices & Scenarios |
|------------|----------------|----------------------------|
| **Base (Mobile)** | `< 640px` | Smart phones (iPhone SE, 13/14/15/16 Pro, Galaxy S21-S24, Pixel 7/8). Narrowest supported: `360px`. |
| **sm** | `640px` | Large phones in landscape, phablets, compact foldables. |
| **md** | `768px` | Small tablets (iPad Mini), portrait tablets, landscape phones. |
| **lg** | `1024px` | Tablets in landscape (iPad Pro 11"), compact laptops, Chromebooks. |
| **xl** | `1280px` | Standard laptops, MacBook Air/Pro 13"/14", desktop monitors. |
| **2xl** | `1536px+` | High-resolution external displays, iMacs, 4K monitors (bounded to `max-w-7xl` or `max-w-5xl` for content readability). |

### Viewport Principles
- **Content First on Mobile**: Page content receives 100% available width; sidebars and live preview collapse into dedicated drawers and sheets.
- **No Unintended Horizontal Scroll**: `html` and `body` enforce `max-width: 100%` and `overflow-x: hidden`. Container elements use flexible widths (`w-full`, `min-w-0`, and `truncate` on text rows).
- **No Shrunk Desktop Layouts**: Desktop side-by-side grids collapse into logical vertical reading sequences on mobile viewports.

---

## 2. Mobile Navigation Architecture

### Authenticated Dashboard Navigation
- **Screen `< lg` (`< 1024px`)**: The persistent desktop sidebar is unmounted from the layout flow and replaced with an accessible mobile drawer overlay (`DashboardSidebar`).
- **Trigger**: An accessible `Menu` button in `DashboardHeader` with a `min-w-[38px] min-h-[38px]` touch envelope.
- **Drawer Behavior**:
  - Slides in smoothly from the left with `backdrop-blur-sm` backdrop.
  - Automatically locks background `body` scrolling while open to eliminate nested scroll conflicts.
  - Automatically dismisses upon route changes (`pathname` listener), clicking the backdrop, or pressing `Escape`.
  - Close button has an explicit touch target (`min-w-[38px] min-h-[38px]`) with `aria-label="Close navigation"`.
  - Navigation links have comfortable touch targets of `min-h-[40px]`.
  - Bottom area incorporates `pb-safe` to avoid overlap with native mobile home indicators.

### Public Landing Navigation
- **Screen `< md` (`< 768px`)**: Top nav items collapse into a dedicated full-screen drawer triggered by an accessible hamburger button (`min-w-[40px] min-h-[40px]`).
- **Body Scroll Lock**: Automatically locks body scroll when open and releases upon close or link click.
- **Next.js Link Optimization**: Uses Next.js client-side navigation (`Link`) for anchor sections (`#features`, `#pricing`, etc.) preventing unnecessary full page refreshes.

---

## 3. Mobile Live Preview Behavior

On desktop (`xl:` screens), Linkle displays a sticky real-time phone preview panel alongside the workspace.

On mobile and tablet viewports (`< xl`), permanent preview is replaced with an on-demand modal preview:
- **Header Trigger**: `DashboardHeader` features a dedicated `Preview` button (`min-h-[38px]`) with icon and badge.
- **Preview Modal (`DashboardShell`)**:
  - Opens a dedicated full-screen preview experience displaying the live `MobilePreview` canvas.
  - Top bar features a prominent close button (`min-h-[38px]`) and live status pulse.
  - Locks background document scrolling to prevent jitter.
  - Viewport container uses `overflow-y-auto` and `pb-safe`.
  - Device frame in `MobilePreview` automatically constrains its max-width to `max-w-[calc(100vw-2.5rem)]` on narrow viewports (`360px`), preventing any horizontal page blowout.

---

## 4. Modal Viewport & Scrolling Strategy

Every dialog across Linkle (Link Edit, Add Link, Delete Confirm, QR Modal, UPI Modal, Onboarding Wizard) conforms to a strict mobile viewport bounding strategy:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
  <div className="relative w-full max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] flex flex-col bg-white dark:bg-zinc-900 rounded-xl ...">
    <div className="shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b ...">
      {/* Header and accessible >=36px close button */}
    </div>
    <div className="p-4 sm:p-6 overflow-y-auto flex-1">
      {/* Body content scrolls cleanly internally */}
    </div>
  </div>
</div>
```

### Benefits
1. **No Viewport Clipping**: On mobile keyboards or short landscape screens, modals never clip their headers or footers.
2. **Internal Smooth Scrolling**: Content scrolls cleanly inside the modal surface rather than causing window-level jumpiness.
3. **Sticky Action Bars**: Action buttons (Save, Cancel, Delete) remain reachable.

---

## 5. Mobile Touch Target Rules

All interactive elements across mobile and tablet viewports must meet or exceed WCAG 2.5.5 / 2.5.8 touch target guidelines:

- **Standard Buttons**: Minimum height `44px` on mobile (`py-2.5 px-4`).
- **Icon-Only Buttons**: Minimum touch envelope of `36px` to `44px` with centered icons (`min-w-[36px] min-h-[36px] flex items-center justify-center`).
- **Drag Handles**: `min-w-[36px] min-h-[36px]` with `p-2` padding and `touch-none` attribute for drag-and-drop operations.
- **Dropdown & More Menus**: `min-w-[36px] min-h-[36px]` tap target.
- **Category Tabs & Chips**: Minimum height `36px` with horizontal scroll (`no-scrollbar`).
- **Form Inputs**: Height `44px` (`h-11`) for finger-friendly selection and typing without accidental zooms.

---

## 6. Responsive Typography & Text Clamping

Linkle uses proportional typographic scaling:

| Element | Mobile (`< 640px`) | Desktop (`>= 640px`) | Behavior |
|---------|---------------------|----------------------|----------|
| **Page H1** | `text-xl` or `text-2xl` | `text-3xl` or `text-4xl` | Clamped tracking, leading-tight, no orphan wraps. |
| **Section H2** | `text-base` or `text-lg` | `text-xl` or `text-2xl` | Balanced headlines with contextual subtitles. |
| **Card H3/H4** | `text-sm` | `text-base` | Single-line truncation (`truncate`) with max-width bounding. |
| **Body Text** | `text-xs` to `text-sm` | `text-sm` to `text-base` | Relaxed line-height (`leading-relaxed`) for mobile readability. |
| **Code / Handles** | `text-xs` font-mono | `text-xs` font-mono | Select-all enabled, handles long strings via `break-all` or `truncate`. |

### Long Text Protection
- Link item rows constrain titles to `max-w-[130px]` at 360px viewport to guarantee that drag handles, thumbnails, visibility toggles, and more buttons remain visible without wrapping into multiple rows.
- Bios on public profiles use `break-words whitespace-pre-line` to respect author formatting while preventing viewport blowout.

---

## 7. Responsive Charts & Analytics

`AnalyticsDashboard` stacks naturally on mobile viewports:
1. **Insights Card**: Summarizes performance highlights.
2. **KPI Metrics Grid**: `grid-cols-2` on mobile, scaling to `grid-cols-4` on desktop.
3. **Performance Trend Chart**:
   - Scales horizontally to fill 100% of container width without scrollbars.
   - Height adapts between `h-48` (mobile) and `h-56` (desktop).
   - Dynamic X-axis label thinning: thin out date labels on mobile (e.g., showing every 2nd or 5th date) to prevent overlapping tick text.
   - Interactive tooltip pill positions dynamically at the top of the canvas, eliminating mobile edge-clipping.
4. **Top Links & Traffic Sources**: Stack vertically as single-column cards on `< lg`, transitioning to 2-column side-by-side on desktop.
5. **Devices & Locations**: Stacks cleanly with percentage progress bars.

---

## 8. Mobile Form & Input Behavior

- **Input Width**: Full width (`w-full`) across all screen sizes.
- **Font Size**: Minimum `14px` (`text-sm`) on inputs to prevent iOS Safari auto-zoom on input focus.
- **Autofill Attributes**: Explicit standard autocomplete attributes (`email`, `current-password`, `new-password`) to streamline mobile password managers.
- **Button Orientation**: Form action buttons stack vertically (`w-full`) on mobile where that improves tap accuracy, switching to `sm:w-auto` row layout on larger screens.

---

## 9. Mobile Safe-Area Handling

All fixed, sticky, or full-height elements support modern mobile safe-area insets (`env(safe-area-inset-*)`):

- `.pt-safe`: `padding-top: env(safe-area-inset-top, 0px)` for top navigation and profile controls beneath status bars and camera cutouts.
- `.pb-safe`: `padding-bottom: env(safe-area-inset-bottom, 0px)` for mobile drawers, bottom sheets, and floating bars above the iOS Home Indicator.
- `.bottom-safe`: `bottom: env(safe-area-inset-bottom, 0px)` for fixed positioning.
- Appearance Form Unsaved Bar: Floating bar includes `pb-safe` ensuring discard/save buttons are never obstructed by mobile operating system navigation gestures.

---

## 10. Linkle Pay UPI Mobile Experience

The UPI modal (`UpiPayModal`) is specifically tuned for mobile interaction:
- **Mobile First CTA**: `Pay via UPI App` renders prominently with a direct `upi://pay` deep link intent. When tapped on Android or iOS devices with UPI applications (GPay, PhonePe, Paytm, BHIM), the operating system natively invokes the app picker.
- **QR Code Sizing**: High-contrast SVG QR code scaled to `200px` within a bounded card, remaining fully scannable without overflowing narrow screens.
- **Quick Copy**: Secondary 1-tap copy button for UPI ID with immediate "Copied" feedback.
- **Download & Share**: Action buttons for saving the high-res PNG or invoking the native `navigator.share` API.

---

## 11. Accessibility (a11y) & Reduced Motion

- **Keyboard Traps**: All modals support `Escape` to close, restore focus on unmount, and lock background scroll.
- **Focus Rings**: Accessible two-tone focus ring utility (`.focus-ring`: `0 0 0 2px var(--app-surface), 0 0 0 4px var(--brand-primary)`).
- **Reduced Motion**: Complete `@media (prefers-reduced-motion: reduce)` support disabling non-essential CSS animations and transitions while preserving functional state updates.
- **Contrast**: Text meets WCAG AA minimum 4.5:1 contrast in both light and dark color modes.

---

## 12. Responsive Test Matrix

Every page was inspected across 7 standard viewport widths:

| Page / Route | 360px (Small Mobile) | 390px (Standard Mobile) | 430px (Large Mobile) | 768px (Tablet) | 1024px (Laptop) | 1280px (Desktop) | 1440px (Wide Desktop) |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Homepage (`/`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Login (`/login`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Register (`/register`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Forgot Password (`/forgot-password`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Reset Password (`/reset-password`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Dashboard Shell** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **My Links (`/dashboard/links`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Appearance (`/dashboard/appearance`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Analytics (`/dashboard/analytics`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Settings (`/dashboard/settings`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Billing (`/dashboard/monetization`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **Public Profile (`/p/[username]`)** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| **UPI Payment Modal** | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
