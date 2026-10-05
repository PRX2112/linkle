# Linkle UI/UX Reform — Step UI-02: Dashboard Shell, Navigation & Responsive Structure

This document details the architecture, layout, navigation hierarchy, and responsive behavior of Linkle's authenticated dashboard workspace.

---

## 1. Dashboard Layout & Shell Architecture

The dashboard shell replaces the previous card-heavy, glowing container layout with a focused, quiet, high-productivity SaaS workspace structured as follows:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Sidebar (Desktop) │ Top Header (Page Title, Context, Actions, Preview) │
│ [Logo]            ├────────────────────────────────────────────────────┤
│                   │ Main Workspace             │ Live Profile Preview   │
│ - Workspace Items │ (Max-width bounded,        │ (Sticky, secondary,    │
│ - Account Items   │  predictable padding,      │  device frame,         │
│                   │  clean vertical rhythm)    │  no layout shifts)     │
│ [Plan] [UserMenu] │                            │                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Components
1. **`DashboardShell`** (`src/components/dashboard/DashboardShell.tsx`):
   Coordinates the persistent sidebar, top header, editing workspace, desktop preview aside, and mobile drawer/modal overlays.
2. **`DashboardSidebar`** (`src/components/dashboard/DashboardSidebar.tsx`):
   Provides primary navigation, collapsible desktop state, account status, and user profile menu.
3. **`DashboardHeader`** (`src/components/dashboard/DashboardHeader.tsx`):
   Presents page title, context description, public profile shortcuts, account plan chip, and mobile preview toggle.
4. **`UserMenu`** (`src/components/dashboard/UserMenu.tsx`):
   Accessible popover for account settings, billing, profile shortcuts, and sign-out.
5. **`MobilePreview`** (`src/components/dashboard/MobilePreview.tsx`):
   Secondary profile preview with realistic device framing, live preview status indicator, and mobile/desktop viewport toggle.

---

## 2. Navigation Hierarchy (Single Source of Truth)

All dashboard navigation items are centralized in `src/lib/dashboard-nav.ts`:

### A. Workspace
- **Overview** (`/dashboard/overview`): At-a-glance performance summary, quick actions, and traffic stats.
- **My Links** (`/dashboard`): Primary profile editor for social, business, payment, and tool links.
- **Appearance** (`/dashboard/appearance`): Custom user profile themes, Google Fonts, colors, and button styles.
- **Analytics** (`/dashboard/analytics`): Deep traffic, conversion, event, and UTM campaign analytics.

### B. Account
- **Billing & Plans** (`/dashboard/monetization`): Production subscription tiers, Stripe Customer Portal launcher, and invoices.
- **Settings** (`/dashboard/settings`): Username management, display name, account email, and danger zone.

### C. Active State Rules
- **Active Navigation Items**: Restrained indigo background (`bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold`) with an accessible vertical accent indicator (`border-l-2 border-brand-600 dark:border-brand-500`) and `aria-current="page"`.
- **Inactive Items**: Quiet neutral styling (`text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60`).

---

## 3. Sidebar Behavior & Desktop Collapse

- **Expanded Mode** (`w-64` / `256px`):
  - Displays full Linkle logo and wordmark.
  - Category headers (`WORKSPACE`, `ACCOUNT`).
  - Full item labels and icons.
  - Plan summary card and expanded UserMenu.
- **Collapsed Mode** (`w-[72px]`):
  - Retains logo mark and collapse toggle trigger.
  - Navigation icons centered with accessible `Tooltip` on hover/focus.
  - Miniaturized avatar button for UserMenu.
  - Remembers user preference in `localStorage` (`linkle_sidebar_collapsed`).

---

## 4. Responsive Behavior

### Desktop (>= 1280px / `xl`)
- Sidebar is permanently visible (either expanded or collapsed).
- Main editing workspace is bounded to `max-w-5xl` with consistent `px-6 md:px-8` padding.
- Live Profile Preview is permanently docked in the right sticky aside (`w-[380px] 2xl:w-[420px]`).

### Tablet (768px - 1279px)
- Sidebar remains visible or can be collapsed to conserve screen real estate.
- The editing workspace occupies full width.
- A "Preview" action in the header allows the user to open the live preview in an overlay sheet without navigating away or losing form state.

### Mobile (< 768px)
- Top bar provides hamburger menu button for slide-in navigation drawer.
- The editing workspace receives focus with zero horizontal overflow.
- A dedicated "Preview" button in the header triggers a full-screen preview view, enabling seamless switching between **EDIT** and **PREVIEW** with zero page reloads and complete state preservation.

---

## 5. Account Plan & Entitlement Visibility

The dashboard shell directly queries user subscription data server-side via Prisma in `src/app/dashboard/layout.tsx`:
- **Starter (Free)**: Displays "Starter Plan" with subtle "Free" badge and an upgrade prompt linking to `/dashboard/monetization`.
- **Pro / Enterprise**: Displays "Pro Plan" or "Enterprise Plan" with an active emerald indicator.
- Never creates fake or mock entitlement states.

---

## 6. Accessibility (A11y) Decisions

1. **Semantic Structure**: Uses semantic `<aside>`, `<nav>`, `<header>`, and `<main>` landmarks.
2. **Keyboard Focus**: Focus visible rings on all sidebar items, collapse toggle, user menu triggers, and preview controls (`focus-visible:ring-2 focus-visible:ring-brand-500/30`).
3. **Screen Readers**:
   - `aria-current="page"` on the active link.
   - `aria-expanded` and `aria-haspopup="menu"` on the UserMenu.
   - `role="dialog"` and `aria-modal="true"` on mobile drawer and preview overlays.
4. **Escape Key Handling**: Pressing `Escape` automatically dismisses the mobile navigation drawer, user menu, or mobile preview sheet.

---

## 7. Verification & Build Status

- **`npm run build`**: Compiled cleanly with code 0 across all 28 static and dynamic routes.
- **Billing Test Suite** (`scripts/test-billing-system.js`): 22/22 passed.
- **Profile Import Test Suite** (`scripts/test-profile-import.js`): 17/17 passed.
- **Templates & Onboarding Suite** (`scripts/test-templates-onboarding.js`): 19/19 passed.
- **UTM Tracking Suite** (`scripts/test-utm-system.js`): 12/12 passed.
- **Public Profile Compatibility**: Verified that `/p/[username]` and `/p/demo` render with full user-customized profile theme fidelity.
