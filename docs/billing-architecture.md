# Production Billing & Subscription Architecture

## Overview

Linkle uses a production-ready, tier-based subscription architecture integrated with **Stripe Billing**, **Stripe Checkout**, and the **Stripe Customer Portal**.

The system is built with strict security and operational safeguards:
1. **Never Frontend-Only**: All paid feature gates and link limits are enforced server-side.
2. **Strict Idempotency**: Stripe webhook retries and duplicate events are deduplicated via a database-backed `WebhookEvent` ledger.
3. **Automated State Synchronization**: Webhook events automatically maintain subscription periods, cancellation flags, and plan tier downgrades.
4. **Self-Service Customer Management**: Subscribers can modify plans, update payment methods, view invoices, or cancel subscriptions through Stripe's hosted Billing Portal.

---

## 1. Database Schema

The database schema ([`prisma/schema.prisma`](file:///d:/VibingSites/LINKLE/prisma/schema.prisma)) models subscriptions, customer references, and webhook idempotency:

### `Subscription` Model
```prisma
model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId     String    @unique
  stripeSubscriptionId String?   @unique
  stripePriceId        String?
  status               String    @default("incomplete") // active, trialing, past_due, canceled, unpaid, incomplete
  plan                 String    @default("STARTER") // STARTER, PRO, ENTERPRISE
  interval             String?   // month, year
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean   @default(false)
  canceledAt           DateTime?
  trialStart           DateTime?
  trialEnd             DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([userId, status])
  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
}
```

### `WebhookEvent` Model (Idempotency Ledger)
```prisma
model WebhookEvent {
  id          String   @id // Stripe Event ID (evt_...)
  type        String
  processedAt DateTime @default(now())
  payload     Json?

  @@index([type])
}
```

### `User` Billing Fields
```prisma
model User {
  // ...
  plan                   String        @default("Starter") // Denormalized tier for fast queries
  stripeCustomerId       String?       @unique
  stripeSubscriptionId   String?       @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?
  subscription           Subscription?
  // ...
}
```

---

## 2. Plans & Billing Intervals

Linkle offers three standard tiers across monthly and annual intervals (with a 25% annual discount):

| Plan Tier | Display Name | Monthly Price | Annual Price | Price ID Configuration (Env) |
| :--- | :--- | :---: | :---: | :--- |
| `STARTER` | Starter | **$0** (Free) | **$0** (Free) | None (default tier) |
| `PRO` | Pro | **$9 / mo** | **$79 / yr** | `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID` |
| `ENTERPRISE` | Enterprise | **$29 / mo** | **$249 / yr** | `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`, `STRIPE_ENTERPRISE_YEARLY_PRICE_ID` |

---

## 3. Centralized Feature Entitlement Matrix

Entitlements are declared centrally in [`src/lib/billing/entitlements.ts`](file:///d:/VibingSites/LINKLE/src/lib/billing/entitlements.ts) and enforced in backend routes:

| Entitlement Key | Feature Gated | `STARTER` | `PRO` | `ENTERPRISE` | Enforcement Point |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `maxLinks` | Maximum active link count | 5 links | **Unlimited** | **Unlimited** | `/api/links/business`, `/api/links/social` |
| `advancedAnalytics` | Historical ranges (14d, 30d, 90d) & UTM reports | ❌ (7d only) | ✅ | ✅ | `/api/analytics` |
| `removeBranding` | Hide Linkle profile watermark | ❌ | ✅ | ✅ | `/api/user/profile` |
| `advancedLeads` | Email capture subscriber export | ❌ | ✅ | ✅ | `/api/subscribe` |
| `premiumCustomization` | Custom themes & styling controls | ❌ | ✅ | ✅ | `/api/user/profile` |
| `analyticsExport` | Raw event log export | ❌ | ❌ | ✅ | `/api/analytics` |
| `customDomains` | Custom domain routing (planned) | ❌ | ✅ | ✅ | Domain verification router |

### Server-Side Enforcement Example
```typescript
// Link Limit Enforcement (/api/links/business/route.ts)
const limitCheck = await verifyLinkLimit(session.user.id);
if (!limitCheck.allowed) {
  return NextResponse.json(
    { error: "Starter plan link limit reached (5 links). Upgrade to Pro for unlimited links." },
    { status: 403 }
  );
}
```

---

## 4. Stripe Webhook Events & Lifecycle

The webhook endpoint at [`src/app/api/webhooks/stripe/route.ts`](file:///d:/VibingSites/LINKLE/src/app/api/webhooks/stripe/route.ts) processes events securely and idempotently:

```
┌─────────────────────────────────┐
│ Stripe Event Delivered to API   │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 1. Verify Webhook Signature     │
│ (stripe.webhooks.constructEvent)│
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 2. Check Idempotency Ledger     │
│ WebhookEvent.findUnique(event.id│
└──────┬───────────────────┬──────┘
       │ Already exists    │ New event
       ▼                   ▼
┌──────────────┐   ┌───────────────────────────────┐
│ Return 200 OK│   │ 3. Process Event Action       │
│ (Skip work)  │   │ - checkout.session.completed  │
└──────────────┘   │ - customer.subscription.update│
                   │ - customer.subscription.delete│
                   │ - invoice.payment_failed      │
                   └───────────────┬───────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │ 4. Persist to WebhookEvent    │
                   │ Return 200 OK                 │
                   └───────────────────────────────┘
```

### Handled Webhook Events

1. **`checkout.session.completed`**:
   - Matches `client_reference_id` or `session.metadata.userId`.
   - Attaches `stripeCustomerId` and `stripeSubscriptionId`.
   - Initializes `Subscription` and upgrades `User.plan`.
2. **`customer.subscription.created` & `customer.subscription.updated`**:
   - Synchronizes `status` (`active`, `trialing`, `past_due`, `canceled`).
   - Syncs `currentPeriodEnd`, `cancelAtPeriodEnd`, `interval`, and `stripePriceId`.
   - If `status === "canceled"` or `status === "incomplete_expired"`, downgrades `User.plan` back to `"Starter"`.
3. **`customer.subscription.deleted`**:
   - Triggered when subscription cancellation completes at period end.
   - Downgrades `User.plan` to `"Starter"` and marks `Subscription.status = "canceled"`.
4. **`invoice.payment_succeeded`**:
   - Extends subscription `currentPeriodEnd`.
5. **`invoice.payment_failed`**:
   - Sets `Subscription.status = "past_due"`. User enters grace period before automatic downgrade.

---

## 5. API Endpoints

### 1. Checkout Session Creation
- **Endpoint**: `POST /api/billing/checkout`
- **Payload**: `{ "plan": "Pro" | "Enterprise", "interval": "monthly" | "yearly" }`
- **Response**: `{ "url": "https://checkout.stripe.com/..." }`

### 2. Stripe Customer Portal
- **Endpoint**: `POST /api/billing/portal`
- **Response**: `{ "url": "https://billing.stripe.com/p/session/..." }`

### 3. Subscription Status Query
- **Endpoint**: `GET /api/billing/subscription`
- **Response**:
```json
{
  "plan": "PRO",
  "status": "active",
  "isPaidActive": true,
  "interval": "monthly",
  "currentPeriodEnd": "2026-11-03T16:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "entitlements": {
    "maxLinks": null,
    "advancedAnalytics": true,
    "removeBranding": true,
    "advancedLeads": true,
    "premiumCustomization": true,
    "analyticsExport": false,
    "customDomains": true
  }
}
```

---

## 6. Testing Procedure

Automated billing test suite is maintained in [`scripts/test-billing-system.js`](file:///d:/VibingSites/LINKLE/scripts/test-billing-system.js):
```bash
npx tsx scripts/test-billing-system.js
```

### Verified Scenarios:
1. **Plan Normalization**: Correct parsing of `STARTER`, `PRO`, `ENTERPRISE`, intervals, and pricing calculations.
2. **Entitlement Matrix Verification**: Server-side validation of link limits (5 links for Starter, unlimited for Pro) and feature flags.
3. **Database Relational Integrity**: Creation of `Subscription` records linked to `User` and `stripeCustomerId`.
4. **Idempotent Webhook Processing**: Re-sending identical Stripe event ID `evt_test_123` returns early without duplicating database operations.
5. **Subscription Lifecycle Synchronization**: Transition from `active` → `past_due` → `canceled`, verifying automatic tier downgrade to `Starter`.
6. **Server-Side Gate Enforcement**: Rejection of 6th link on a Starter plan with HTTP 403 Forbidden.
