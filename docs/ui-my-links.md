# Linkle UI/UX Reform — Step UI-03: My Links Workspace Redesign

This document details the redesign of the "My Links" (Links Manager) workspace in Linkle, transitioning it into a focused, low-noise, professional content-management editor.

---

## 1. Information Hierarchy & Page Structure

The My Links editor is designed as a content-management workspace rather than a decorative marketing card view:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Header: My Links                                    [ + Add Link ] ... │
│ Manage everything that appears on your Linkle page.                    │
│ [ linkle.me/p/username ] [ Copy ]                                      │
├────────────────────────────────────────────────────────────────────────┤
│ Summary: 7 total links • 6 published • 1 featured • 1 scheduled        │
├────────────────────────────────────────────────────────────────────────┤
│ Tabs: [ Social (3) ] [ Links (2) ] [ Payments (2) ] [ Tools (1) ]      │
├────────────────────────────────────────────────────────────────────────┤
│ Workspace List (Compact rows with drag handles, badges, switches, etc) │
│ ⋮⋮ [icon] Instagram            instagram.com/user     ● Visible  ⋮     │
│ ⋮⋮ [icon] GitHub               github.com/user        ● Visible  ⋮     │
│ ⋮⋮ [thumb] Portfolio           myportfolio.com ★Feat  ● Visible  ⋮     │
├────────────────────────────────────────────────────────────────────────┤
│ Inline Quick-Add Card (Scoped to active category)                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Category Tab Navigation

Linkle preserves all 4 core link sections with clear pill-style segmented tab navigation:
1. **Social**: Direct social channels (Instagram, X, LinkedIn, YouTube, GitHub, Email, Phone, WhatsApp, Website).
2. **Links (Business)**: Custom URL blocks with optional rich thumbnails, subtitles, descriptions, and UTM tracking.
3. **Payments**: Direct payment methods and tipping handles (UPI QR/intent, PayPal, Stripe, Paytm, PhonePe, Google Pay, Crypto).
4. **Tools**: Interactive profile tools (Email capture block with CSV download).

Each tab header displays a live count badge indicating how many items are currently configured.

---

## 3. Link Row Architecture (`LinkItemRow.tsx`)

Every link row is a compact, high-density, accessible row (`h-14` to `h-16` equivalent):
- **Drag Handle (`⋮⋮`)**: Touch-none, accessible grab handle for reordering via `@dnd-kit`.
- **Visual Identifier**:
  - 40px square thumbnail for business link blocks (custom uploaded images).
  - High-contrast, clean neutral platform icons for social and payment methods.
- **Title & Destination**:
  - Truncated bold title and subtle destination URL.
  - Multi-line description clamp on desktop.
- **Status Badges**:
  - `★ Featured`: Amber star badge indicating top-pinned profile treatment.
  - `Hidden`: Neutral tag when visibility is toggled off.
  - `Scheduled`: Date-aware badge showing `Starts [Date]` or `Ends [Date]`.
  - `UTM`: Indicates active campaign query parameters.
- **Analytics Click Count**:
  - Direct display of real click counts per link (`BarChart3`).
- **Visibility Toggle**:
  - Accessible toggle switch with live status text (`Visible` / `Hidden`).
  - Hidden links are given a subdued, dashed style (`opacity-70`) but **never disappear** from the editor.
- **Action Overflow Dropdown (`⋮`)**:
  - `Edit details`: Launches the tabbed `LinkEditModal`.
  - `Copy link URL`: Copies link destination with immediate feedback.
  - `Feature on profile`: Toggles pinned status.
  - `Delete link`: Opens the deliberate `DeleteConfirmModal`.

---

## 4. Add & Edit Workflows

### A. Primary "+ Add Link" Experience (`AddLinkModal.tsx`)
- One clear primary action in the header: `[ + Add link ]`.
- Selecting an option smoothly switches to the target tab and scrolls into the inline entry form.
- Secondary access to profile templates and URL importer.

### B. Logical Edit Modal UX (`LinkEditModal.tsx`)
The previous monolithic edit dialog is split into 3 clear tabbed sections:
1. **Details**: Title/Label, Platform/Destination URL with inline prefix/suffix, description.
2. **Appearance**: Dedicated thumbnail upload and preview for business link cards.
3. **Schedule & UTM**: Start/End publication timestamps and UTM campaign tracking fields with real-time preview.

### C. Deliberate Delete Experience (`DeleteConfirmModal.tsx`)
- Clicking "Delete" in the row overflow menu prompts a focused confirmation dialog.
- Displays the item name and asks for confirmation before triggering the API delete mutation.

---

## 5. Drag-and-Drop UX (`@dnd-kit`)

- Preserves keyboard and pointer sensor drag reordering.
- Normal state: Flat, clean row with subtle border.
- Dragging state: Elevated row with natural drop placeholder and z-index elevation.
- Optimistically updates UI ordering before syncing to the backend reorder APIs (`/api/links/*/reorder`).

---

## 6. Empty States & First-Time Experience

- **Empty Tab**: Custom `EmptyState` component for Social, Business, and Payments with helpful suggestions and a direct `[ + Add ]` CTA.
- **0 Total Links**: Shows a gentle onboarding card with quick shortcuts to add a first social channel, portfolio link, or payment method.

---

## 7. Responsive Behavior

- **Desktop (>= 1024px)**: Full row layout with clicks count, URL display, inline switch, and overflow actions.
- **Tablet (768px - 1023px)**: Compact spacing with touch-friendly controls.
- **Mobile (< 768px)**: Clean mobile-friendly list with primary emphasis on title, destination, visibility toggle, and overflow actions. Zero horizontal overflow.

---

## 8. Verification & Test Results

- **Production Build (`npm run build`)**: Compiled with code 0 across all 28 static and dynamic routes (`/dashboard` compiled at 41.8 kB).
- **Billing Test Suite** (`scripts/test-billing-system.js`): 22/22 passed.
- **Profile Import Test Suite** (`scripts/test-profile-import.js`): 17/17 passed.
- **Templates & Onboarding Suite** (`scripts/test-templates-onboarding.js`): 19/19 passed.
- **UTM Tracking Suite** (`scripts/test-utm-system.js`): 12/12 passed.
- **Live Preview & Context**: Full synchronization maintained between `LinksManager`, `PreviewContext`, and `MobilePreview`.
