# Linkle UI/UX Reform — Step UI-06: Settings & Billing / Account Experience

## 1. Overview
Step UI-06 focused exclusively on transforming the Linkle **Account Settings** and **Billing & Plans** workspaces into a calm, trustworthy, high-utility SaaS management experience.

Prior to UI-06:
- The Settings page presented oversized card containers with fragmented save states.
- The Monetization page looked like a generic marketing pricing wall rather than an authenticated account management dashboard.
- Active Stripe subscriptions were not guaranteed to be terminated upon account deletion.
- Username changes lacked real-time database-backed availability checking.

---

## 2. Information Architecture

### Settings (`/dashboard/settings`)
1. **Compact Page Header**:
   - Title: `Settings`
   - Description: `Manage your Linkle account and preferences.`
2. **Canonical Profile Link Card**:
   - Displays full canonical link (`https://linkle.me/p/[username]`).
   - One-click copy with subtle feedback (`Copied!`).
   - Direct link to view the public profile in a new tab.
3. **Profile Identity Form**:
   - **Display Name**: Configures the public page headline.
   - **Username Slug**: Real-time DB availability check with format validation (`^[a-z0-9_-]{3,20}$`).
   - **Anti-Abuse & Aliasing**: Explains the 24h change cooldown and notes that previous usernames permanently redirect to the user's newest handle.
   - **Unsaved Changes Tracker**: Shows pending changes with auto-clearing success messages.
4. **Security & Authentication**:
   - **Email Status**: Live display of account email and verification state (`Verified` vs `Email not verified`).
   - **Sign-in Method**: Identifies whether the account is secured by Google OAuth or standard credentials.
   - **Password Management**: Allows users to dispatch an authenticated password reset link to their verified email address via the production forgot-password flow.
5. **Danger Zone**:
   - Visually distinct section with clear warning copy.
   - Requires typing `delete my account` verbatim before enabling deletion.
   - Explicitly notes: *Active Stripe subscriptions are canceled immediately upon account deletion.*

### Billing & Plans (`/dashboard/monetization` with `/dashboard/billing` redirect)
1. **Current Plan Hero**:
   - Tier badge (`STARTER`, `PRO`, `ENTERPRISE`).
   - Real price and billing interval (e.g. `$9 / month` or `$79 / year (Billed annually)`).
   - Human-readable status:
     - `Active`: "Your subscription is active and renews automatically."
     - `Cancels soon`: "Your subscription will cancel on [Date]. You retain full access until then."
     - `Payment past due`: Restrained amber alert: "Your payment needs attention. Update your payment method in the portal."
     - `Free`: "You are currently on the Linkle Free plan."
   - Renewal/expiration date formatted cleanly (e.g., `October 24, 2026`).
   - Primary Action: `[ Manage subscription ]` launching Stripe Customer Portal.
2. **Resource Usage & Entitlements**:
   - **Resource Usage**:
     - Active links progress bar: `X / 5` on Starter, or `X (Unlimited)` on Pro/Enterprise.
     - Analytics retention window: `7 Days` on Starter, `90 Days` on Pro/Enterprise.
   - **Entitlements Checklist**:
     - Evaluated directly against the server-side `getPlanEntitlements(plan)` matrix (never hardcoded client-side).
     - Active features marked with a green check; tier-gated features marked with `(Pro)` or `(Enterprise)`.
3. **Payment Method**:
   - Displays real card brand, last 4 digits, and expiration date if a card is on file via Stripe.
   - Omitted entirely for Free users (no empty fake card mockups).
4. **Billing History & Invoices**:
   - Renders a clean table of past charges with direct links to real Stripe invoice PDFs.
   - Omitted cleanly if no invoices exist.
5. **Upgrade & Plan Comparison**:
   - Monthly / Annual interval toggle with `Save ~25%` badge.
   - Clean comparison cards for Starter, Pro, and Enterprise.
   - Directly triggers `/api/billing/checkout` and redirects smoothly to Stripe Checkout.

---

## 3. Account Deletion & Active Subscription Handling

### Backend Architecture
Before UI-06, `DELETE /api/user/settings` deleted the `User` record in PostgreSQL (cascading to local `Subscription` rows), but did not notify Stripe if a subscription was active.

In UI-06:
1. `DELETE /api/user/settings` inspects `user.subscription?.stripeSubscriptionId || user.stripeSubscriptionId`.
2. If an active Stripe subscription ID is found, it calls `stripe.subscriptions.cancel(activeSubId)` before proceeding with the database deletion.
3. This guarantees that user deletion permanently stops recurring charges in Stripe.

---

## 4. Technical Validation & State Handling

| Area | Behavior | Backend Source |
| :--- | :--- | :--- |
| **Username Availability** | Debounced (450ms) query to `GET /api/user/settings?checkUsername=xyz` | `prisma.user` and `prisma.usernameHistory` |
| **Username Rules** | 3–20 characters, lowercase alphanumeric, `-`, `_` | `UserSettingsSchema` + Regex validation |
| **Entitlement Checks** | Dynamic rendering of `maxLinks`, `advancedAnalytics`, `removeBranding`, `customDomains` | `ENTITLEMENTS[plan]` matrix |
| **Customer Portal** | Single-click redirect via `/api/billing/portal` | `stripe.billingPortal.sessions.create` |
| **Stripe Checkout** | Creates session with real Price IDs or dynamically calculated line items | `stripe.checkout.sessions.create` |
| **Payment Method** | Card brand, last4, and expiry displayed | `stripe.paymentMethods.list` |
| **Invoices** | Real invoice number, amount, status, date, and PDF URL | `stripe.invoices.list` |

---

## 5. Responsive Behavior & Accessibility

- **Desktop (1440px / 1280px / 1024px)**:
  - Settings: Comfortable readable max-width (`max-w-3xl`) with inline form labels and action rows.
  - Billing: Hero card spanning full width, two-column split for Resource Usage (1/3) and Entitlements (2/3), followed by 3-column plan comparison cards.
- **Tablet (768px)**:
  - Usage and entitlements stack into single column.
  - Plan comparison cards wrap cleanly with responsive gaps.
- **Mobile (430px / 390px / 360px)**:
  - Inputs and buttons stretch to full width for comfortable touch interaction.
  - Public profile URL wraps cleanly without horizontal overflow.
  - Modal dialogs center with soft backdrop blur and keyboard escape support.
  - All statuses include textual labels (never communicating state solely through color).

---

## 6. Discrepancies Discovered & Resolved

1. **Orphan Billing on Account Deletion**:
   - *Discovery*: Database cascade deleted local user records, but left Stripe subscriptions active.
   - *Resolution*: Added automated `stripe.subscriptions.cancel(activeSubId)` call in `DELETE /api/user/settings` prior to database record removal.
2. **Frontend-Only Username Availability**:
   - *Discovery*: Prior settings form lacked a real-time availability check, reporting errors only after full form submission.
   - *Resolution*: Implemented `GET /api/user/settings?checkUsername=xyz` checking both active user accounts and historical aliases.
3. **Usage Metrics Absence in Billing API**:
   - *Discovery*: `/api/billing/subscription` returned plan status but omitted current resource consumption.
   - *Resolution*: Enriched the response with live link counts (`socialLink.count + businessLink.count`), safe payment method metadata, and invoice receipts.
