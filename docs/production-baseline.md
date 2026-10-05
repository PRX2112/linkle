# Linkle — Production Baseline Report

> **Baseline Date:** October 2, 2026  
> **Repository:** `PRX2112/linkle` (`d:\VibingSites\LINKLE`)  
> **Version:** 1.0.0 (Release candidate / Baseline)  
> **Runtime / Framework:** Next.js 15.1.7 (Next.js 15.5.14 runtime) · React 19.0.0 · TypeScript 5.9.3 · Prisma 5.22.0 · PostgreSQL

---

## Executive Summary

Linkle is an all-in-one digital profile and link-in-bio web application. Users configure links, custom appearance themes, UPI payments, and email subscriptions through an authenticated dashboard with a live dual-mode preview panel. Public profiles are served at `/p/[username]` with on-demand tag-based edge caching (`user-profile-${username}`) and non-blocking asynchronous analytics tracking.

This baseline report captures the current operational status, architecture, package dependencies, API surface, security posture, performance characteristics, SEO readiness, monetization gaps, and prioritized next steps before subsequent feature development.

---

## 1. Current Architecture

```
                                      ┌───────────────────────────────────────────────┐
                                      │              Next.js 15 App Router            │
                                      │     (Edge Middleware & Route Handlers)        │
                                      └───────┬───────────────────────────────┬───────┘
                                              │                               │
                      ┌───────────────────────┴──────────────┐                │
                      │  src/middleware.ts                   │                │
                      │  Sliding-Window Rate Limiter         │                │
                      │  (Upstash Redis @upstash/ratelimit)  │                │
                      └───────────────────────┬──────────────┘                │
                                              │                               │
               ┌──────────────────────────────┼───────────────────────────────┼──────────────────────────────┐
               │                              │                               │                              │
               ▼                              ▼                               ▼                              ▼
    ┌────────────────────┐         ┌────────────────────┐          ┌────────────────────┐         ┌────────────────────┐
    │  Public Profile    │         │  Admin Dashboard   │          │  API Route Layer   │         │  Media Pipeline    │
    │  /p/[username]     │         │  /dashboard/*      │          │  /api/*            │         │  /api/upload       │
    ├────────────────────┤         ├────────────────────┤          ├────────────────────┤         ├────────────────────┤
    │ • Dynamic theming  │         │ • Links CRUD       │          │ • Auth / Password  │         │ • Client Canvas    │
    │ • Social & links   │         │ • Appearance & Art │          │ • Links CRUD       │         │   WebP compression │
    │ • UPI Pay Modal    │         │ • Real-time preview│          │ • Analytics        │         │ • Magic bytes check│
    │ • Email capture    │         │ • Analytics charts │          │ • Email subscribe  │         │ • Cloudinary CDN   │
    │ • Google Maps      │         │ • Monetization UI  │          │ • Stripe webhook   │         │   streaming        │
    │ • Tag edge caching │         │ • Settings         │          │ • OG image render  │         └────────────────────┘
    └─────────┬──────────┘         └─────────┬──────────┘          └─────────┬──────────┘
              │                              │                               │
              └──────────────────────────────┼───────────────────────────────┘
                                             ▼
                                  ┌────────────────────┐
                                  │    Prisma ORM     │
                                  │    (PostgreSQL)    │
                                  └────────────────────┘
```

### Core Architecture Layers:
1. **Frontend & App Router**: Next.js 15 App Router, React 19, Tailwind CSS v3, and Framer Motion v12.
2. **Authentication**: NextAuth v5 (Beta 30) with JWT session strategy, custom Credentials Provider with bcrypt password hashing, Google OAuth provider configuration, and server-side layout redirect guards.
3. **Database Layer**: Prisma ORM 5.22 connected to PostgreSQL via connection pool pooling, managing User, Account, Session, VerificationToken, PasswordResetToken, SocialLink, BusinessLink, PaymentLink, ContactAction, ProfileView, ClickEvent, and CapturedEmail models.
4. **Caching & Revalidation**: Dynamic profile queries cached with Next.js `unstable_cache` tagged with `user-profile-${username}` (1-hour fallback TTL) and purged on-demand using `revalidateProfile()` upon profile or link mutations.
5. **Rate Limiting**: Sliding-window IP rate limiting configured across public sensitive endpoints via `@upstash/ratelimit` with fail-open fallback.
6. **Analytics Pipeline**: Client event bubbling in `ProfileContainer.tsx` sending lightweight beacons to `/api/analytics/view` and `/api/analytics/click`, using Next.js `after()` for non-blocking database writes.
7. **Image Processing Pipeline**: In-browser client-side HTML5 Canvas compression converting images to WebP (`src/lib/imageCompression.ts`) before uploading to `/api/upload`, which performs server-side MIME and binary magic-byte validation before streaming to Cloudinary.
8. **Linkle Pay UPI Engine**: Dynamic NPCI-compliant URI generation (`upi://pay?pa={cleanUpi}&pn={name}&cu=INR`), SVG rendering with `qrcode.react`, high-resolution PNG download card rendering, native Web Share API, and mobile intent deep links.

---

## 2. Current Dependencies

Recorded directly from [package.json](file:///d:/VibingSites/LINKLE/package.json):

### Production Dependencies (`dependencies`)
| Package | Version | Purpose |
|---|---|---|
| `@auth/prisma-adapter` | `^2.11.1` | NextAuth Prisma database adapter |
| `@dnd-kit/core` | `^6.3.1` | Drag and drop core engine for link reordering |
| `@dnd-kit/sortable` | `^10.0.0` | Sortable preset for drag and drop |
| `@dnd-kit/utilities` | `^3.2.2` | CSS transform helpers for dnd-kit |
| `@prisma/client` | `^5.22.0` | Generated type-safe Prisma client |
| `@upstash/ratelimit` | `^2.0.8` | Redis-based sliding-window rate limiting |
| `@upstash/redis` | `^1.38.0` | Serverless HTTP Redis client |
| `bcryptjs` | `^3.0.3` | Password hashing and comparison |
| `cloudinary` | `^2.11.0` | Cloudinary v2 SDK for media management and streaming |
| `clsx` | `^2.1.1` | Utility for conditionally joining class names |
| `dnd-kit` | `^0.0.2` | dnd-kit wrapper package |
| `framer-motion` | `^12.37.0` | UI animations and modal transitions |
| `lucide-react` | `^0.562.0` | Icon library |
| `next` | `^15.1.7` | Next.js framework (compiled with Next.js 15.5.14) |
| `next-auth` | `^5.0.0-beta.30` | NextAuth v5 authentication engine |
| `nodemailer` | `^7.0.13` | SMTP email transport for password resets |
| `qrcode.react` | `^4.2.0` | React SVG/Canvas QR rendering |
| `react` | `^19.0.0` | React 19 UI library |
| `react-dom` | `^19.0.0` | React 19 DOM renderer |
| `stripe` | `^22.3.2` | Stripe API Node.js client |
| `tailwind-merge` | `^3.4.0` | Tailwind class conflict resolution |
| `zod` | `^4.4.3` | Schema declaration and validation |

### Development Dependencies (`devDependencies`)
| Package | Version | Purpose |
|---|---|---|
| `@types/bcryptjs` | `^2.4.6` | TypeScript definitions for bcryptjs |
| `@types/node` | `^25.0.6` | Node.js type definitions |
| `@types/nodemailer` | `^8.0.0` | TypeScript definitions for nodemailer |
| `@types/qrcode` | `^1.5.6` | TypeScript definitions for qrcode |
| `@types/react` | `^19.2.8` | TypeScript definitions for React 19 |
| `@types/react-dom` | `^19.2.3` | TypeScript definitions for React DOM 19 |
| `autoprefixer` | `^10.4.23` | PostCSS vendor prefixing |
| `eslint` | `^9.39.2` | Linter |
| `eslint-config-next` | `^15.1.7` | Next.js specific ESLint configuration |
| `jsqr` | `^1.4.0` | QR matrix raster decoder used in automated tests |
| `postcss` | `^8.5.6` | CSS transformation tool |
| `prisma` | `^5.22.0` | Prisma CLI and schema migrations |
| `qrcode` | `^1.5.4` | Node.js QR generation library |
| `tailwindcss` | `^3.4.17` | Utility-first CSS framework |
| `ts-node` | `^10.9.2` | TypeScript execution engine for seed scripts |
| `typescript` | `^5.9.3` | TypeScript compiler |

---

## 3. Working Features

### 3.1 Authentication & User Management
- **Registration**: Form validation via `UserRegisterSchema` (Zod), duplicate email and username check, reserved username filtering, bcrypt password hashing (cost factor 12).
- **Credentials Sign-in**: Email/password authentication via NextAuth v5 credentials provider, returning signed JWT session token.
- **Google OAuth**: Pre-configured in `src/auth.ts` with custom profile callback generating a collision-resistant unique username fallback.
- **Password Reset Flow**: `POST /api/auth/forgot-password` generates 32-byte crypto hex token, stores in `PasswordResetToken` with 1-hour expiration, and dispatches HTML email via `nodemailer` (with mock console output fallback if SMTP credentials are not provided). `POST /api/auth/reset-password` validates token expiry and re-hashes password.
- **Route Protection**: `src/app/dashboard/layout.tsx` validates session server-side; redirects unauthorized visitors to `/login`.
- **Account Settings**: Username updates with uniqueness check, display name update, account deletion with full cascade deletion of associated links and metrics.

### 3.2 Links Manager Dashboard
- **Link Types**: Social links, Business links (with title, URL, description, thumbnail), and Payment links.
- **Reordering**: Smooth drag-and-drop powered by `@dnd-kit/sortable` with batch order persistence via `/api/links/*/reorder`.
- **Visibility Toggles**: Instant toggle without full page reload via `/api/links/*/[id]/toggle`.
- **In-Place Modal Editor**: `LinkEditModal` allows editing title, URL, description, thumbnails, featured status, and scheduled start/end dates.
- **Date Scheduling**: Start date and end date scheduling; filtered both client-side and server-side in Prisma queries.
- **Per-Link Click Metrics**: Displays actual click counts aggregated from `ClickEvent` database records.

### 3.3 Theming, Appearance & Live Preview
- **Theme Presets**: 8 curated color themes (Indigo, Rose, Amber, Emerald, Sky, Fuchsia, Cyan, Minimal) plus arbitrary hex color picker.
- **Button Styles**: 4 distinct button geometries (Pill, Rounded, Square, Outline).
- **Dual-Mode Live Preview**: Side panel phone frame updating immediately on keystroke via `PreviewContext` with toggle between Mobile (375px) and Desktop (100%) viewport simulation.
- **Asset Uploads**: Profile avatar and banner uploads powered by Cloudinary with client-side canvas compression and live URL fallback options.

### 3.4 Public Profiles (`/p/[username]`)
- **Dynamic Theming**: CSS custom properties (`--user-primary`) and button style classes injected per user.
- **Dynamic Google Fonts**: Font family styling with `@import` stylesheet loading.
- **Social & Business Sections**: Icon resolution for platforms, responsive link cards, and thumbnail displays.
- **Interactive Location**: Address card with optional embedded Google Maps iframe and directions button.
- **Email Capture**: Newsletter subscription block (`EmailCaptureSection`) with duplicate suppression and rate-limiting.
- **Contact Actions**: Support for vCard, appointment booking, and resume download buttons.

### 3.5 Linkle Pay & UPI QR Engine
- **Dynamic URI Construction**: Standard NPCI format `upi://pay?pa={cleanUpi}&pn={displayName}&cu=INR` generated dynamically in `src/lib/upi.ts`.
- **Open Amount Model**: Amount parameter omitted so payers select custom amounts in their native UPI application.
- **Interactive UPI Modal**: Modal displaying high-contrast QR code rendered via `qrcode.react` (Level H error correction) on a white canvas.
- **Mobile Deep Link**: "Pay via UPI App" direct deep link button opening installed UPI apps (Google Pay, PhonePe, Paytm, BHIM, Cred).
- **Payee Tools**: One-click UPI ID copy, branded high-res PNG card download, and Web Share API integration.
- **Automated Verification**: End-to-end verification script (`scripts/test-upi-qr-decode.js`) decoding generated QR codes via `jsQR` with 100% accuracy.

### 3.6 Analytics Engine
- **Tracking**: Non-blocking asynchronous event capture for views and clicks using Next.js `after()`.
- **Bot & Self-View Exclusion**: Crawlers and profile owners are excluded from metrics.
- **Device & Geolocation**: Device type parsed from user agent; country inferred from `x-vercel-ip-country` or `cf-ipcountry` headers.
- **Dashboard Reporting**: `/api/analytics` provides 14-day history chart, total clicks, profile views, unique visitors, top countries, device breakdown, and top-clicked links.

### 3.7 Media Upload & Security
- **In-Browser Compression**: HTML5 Canvas auto-converts uploads to WebP with max-dimension bounds and quality tuning, cutting file sizes by 60–85%.
- **Client Restrictions**: Restricted file input (`accept="image/*"`) rejecting non-image files.
- **Server Verification**: `/api/upload` enforces session authorization, 10MB ceiling, MIME check, and **binary magic-byte inspection** (JPEG, PNG, GIF, WebP, SVG).
- **Cloudinary Streaming**: Direct stream upload via `cloudinary.uploader.upload_stream`.

### 3.8 Edge Caching & Rate Limiting
- **Edge Caching**: Next.js `unstable_cache` wrapping profile lookups, tagged with `user-profile-${username}` and purged on update.
- **Sliding-Window Rate Limiting**: Upstash Redis enforcing rate limits on `/api/subscribe` (5/min), `/api/analytics/*` (30/10s), and `/api/auth/*` (10/min) with standard RFC `X-RateLimit-*` headers and fail-open resilience.

---

## 4. Prisma Schema & Relationships

```
                     ┌──────────────────┐
                     │       User       │
                     └────────┬─────────┘
                              │ 1:N
        ┌─────────────┬───────┼──────────────┬─────────────┬─────────────┐
        ▼             ▼       ▼              ▼             ▼             ▼
   Account         Session  SocialLink  BusinessLink  PaymentLink  ContactAction
   (NextAuth)     (NextAuth)  
        │             │       │              │             │             │
        └─────────────┴───────┼──────────────┴─────────────┴─────────────┘
                              │ 1:N
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ProfileView            ClickEvent           CapturedEmail
   (visitorId, country)   (linkId, type)       (email, unique per user)
```

- **User Model**: Holds auth credentials, profile information, theme properties (`themePrimaryColor`, `themeBackgroundColor`, `themeFontFamily`, `themeButtonStyle`), location settings, email capture settings, and billing fields (`plan`, `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`).
- **Cascade Deletions**: All child models (`Account`, `Session`, `SocialLink`, `BusinessLink`, `PaymentLink`, `ContactAction`, `ProfileView`, `ClickEvent`, `CapturedEmail`) declare `onDelete: Cascade` referencing `User.id`.
- **Indices**: Dedicated composite indices on `ProfileView([userId, createdAt])`, `ProfileView([userId, visitorId])`, `ProfileView([userId, country])`, `ProfileView([userId, device])`, `ClickEvent([userId, createdAt])`, `ClickEvent([userId, linkId, linkType])`, and `CapturedEmail([userId, createdAt])`.

---

## 5. API Routes Surface

| Route | Methods | Auth Required | Purpose | Caching / Rate Limit |
|---|---|---|---|---|
| `/api/register` | `POST` | No | New user account creation | Rate-limited via `/api/auth/*` |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Mixed | NextAuth v5 authentication handlers | Excluded from auth rate limiter |
| `/api/auth/forgot-password` | `POST` | No | Request password reset email | Rate-limited (10 req/min) |
| `/api/auth/reset-password` | `POST` | No | Complete password reset with token | Rate-limited (10 req/min) |
| `/api/user/profile` | `GET`, `PATCH` | Yes (Session) | Fetch or update user profile & appearance | Invalidates `user-profile-${username}` |
| `/api/user/settings` | `PATCH`, `DELETE` | Yes (Session) | Change username or delete account | Invalidates `user-profile-${username}` |
| `/api/links/social` | `GET`, `POST` | Yes (Session) | List or create social links | Invalidates `user-profile-${username}` |
| `/api/links/social/[id]` | `PATCH`, `DELETE` | Yes (Session) | Update or delete a social link | Invalidates `user-profile-${username}` |
| `/api/links/social/[id]/toggle` | `PATCH` | Yes (Session) | Toggle visibility of social link | Invalidates `user-profile-${username}` |
| `/api/links/social/reorder` | `POST` | Yes (Session) | Batch update social link ordering | Invalidates `user-profile-${username}` |
| `/api/links/business` | `GET`, `POST` | Yes (Session) | List or create business links | Invalidates `user-profile-${username}` |
| `/api/links/business/[id]` | `PATCH`, `DELETE` | Yes (Session) | Update or delete a business link | Invalidates `user-profile-${username}` |
| `/api/links/business/[id]/toggle` | `PATCH` | Yes (Session) | Toggle visibility of business link | Invalidates `user-profile-${username}` |
| `/api/links/business/reorder` | `POST` | Yes (Session) | Batch update business link ordering | Invalidates `user-profile-${username}` |
| `/api/links/payment` | `GET`, `POST` | Yes (Session) | List or create payment links | Invalidates `user-profile-${username}` |
| `/api/links/payment/[id]` | `PATCH`, `DELETE` | Yes (Session) | Update or delete a payment link | Invalidates `user-profile-${username}` |
| `/api/links/payment/[id]/toggle` | `PATCH` | Yes (Session) | Toggle visibility of payment link | Invalidates `user-profile-${username}` |
| `/api/links/payment/reorder` | `POST` | Yes (Session) | Batch update payment link ordering | Invalidates `user-profile-${username}` |
| `/api/subscribe` | `POST` | No | Newsletter / email capture submission | Rate-limited (5 req/min) |
| `/api/upload` | `POST` | Yes (Session) | Image upload with magic-byte check to Cloudinary | Force-dynamic, 10MB limit |
| `/api/analytics` | `GET` | Yes (Session) | Aggregated dashboard analytics | Force-dynamic |
| `/api/analytics/view` | `POST` | No | Log profile view event (async via `after()`) | Rate-limited (30 req/10s) |
| `/api/analytics/click` | `POST` | No | Log outbound link click (async via `after()`) | Rate-limited (30 req/10s) |
| `/api/webhooks/stripe` | `POST` | No (Stripe sig) | Ingest Stripe subscription lifecycle events | Webhook signature verified |
| `/api/og` | `GET` | No | Dynamic Open Graph image generation (`@vercel/og`) | Runtime: `nodejs` |

---

## 6. Environment Variables Baseline

| Variable | Required In Production | Purpose | Current Implementation Status |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection URL | Active via Prisma client |
| `AUTH_SECRET` | **Yes** | NextAuth v5 session encryption secret | Active in `src/auth.ts` |
| `AUTH_TRUST_HOST` | **Yes** | Trust host header for auth callbacks | Active (`true`) |
| `NEXTAUTH_URL` | Recommended | Canonical base URL for NextAuth | Active in `.env` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public application URL for links/OG images | Active (`http://localhost:3000` / production domain) |
| `UPSTASH_REDIS_REST_URL` | **Yes** | Upstash Redis REST endpoint for rate limiting | Active in `src/lib/ratelimit.ts` (with fail-open fallback) |
| `UPSTASH_REDIS_REST_TOKEN` | **Yes** | Upstash Redis REST token for rate limiting | Active in `src/lib/ratelimit.ts` |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | Cloudinary cloud identifier | Active in `src/lib/cloudinary.ts` |
| `CLOUDINARY_API_KEY` | **Yes** | Cloudinary API Key | Active in `src/lib/cloudinary.ts` |
| `CLOUDINARY_API_SECRET` | **Yes** | Cloudinary API Secret | Active in `src/lib/cloudinary.ts` |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth app client ID | Active in `src/auth.ts` |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth app client secret | Active in `src/auth.ts` |
| `SMTP_HOST` | Optional | Production SMTP host (e.g. Resend) | Active in `src/lib/mail.ts` |
| `SMTP_PORT` | Optional | SMTP port (587 or 465) | Active in `src/lib/mail.ts` |
| `SMTP_USER` | Optional | SMTP username | Active in `src/lib/mail.ts` |
| `SMTP_PASSWORD` | Optional | SMTP password / API token | Active in `src/lib/mail.ts` |
| `SMTP_FROM` | Optional | Sender email header string | Active in `src/lib/mail.ts` |
| `GMAIL_USER` | Optional | Fallback Gmail address for dev testing | Active in `src/lib/mail.ts` |
| `GMAIL_PASS` | Optional | Gmail App Password for dev testing | Active in `src/lib/mail.ts` |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key for subscriptions | Active with mock fallback string for builds in `src/lib/stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signature secret | Active in `src/app/api/webhooks/stripe/route.ts` |

---

## 7. Known Limitations

1. **Font Family Setting Persistence**:
   - `AppearanceForm.tsx` supports 7 font families (Inter, Poppins, DM Sans, Space Grotesk, Syne, Playfair Display, Roboto Mono) and previews them live.
   - However, `UserProfileSchema` in `src/lib/validation.ts` does not include `themeFontFamily`, and `PATCH /api/user/profile` does not persist it to the `User.themeFontFamily` database column. Font selection resets on page reload.
2. **Contact Actions Management UI**:
   - The database schema and public profile render `ContactAction` records (vCard, appointment, resume).
   - However, the dashboard Links Manager currently only provides creation forms for Social, Business, and Payment links. Contact actions must be created via seed/direct API.
3. **Password Reset Token Retention**:
   - Expired password reset tokens in `PasswordResetToken` table are only purged when a user initiates a new reset request or successfully redeems a token. There is no scheduled cron job to prune abandoned expired tokens.
4. **Local Analytics Geolocation**:
   - Geolocation relies exclusively on reverse-proxy edge headers (`x-vercel-ip-country`, `cf-ipcountry`). When run locally without a proxy, country defaults to `"Unknown"`.

---

## 8. Security Concerns

1. **Proxy IP Spoofing Risk**:
   - `src/middleware.ts` extracts the client IP via `request.headers.get("x-forwarded-for")?.split(",")[0]`.
   - In environments where the edge proxy does not sanitize incoming headers, clients could theoretically spoof the first entry of `X-Forwarded-For` to bypass rate limits. On Vercel, `x-real-ip` or platform-managed headers should be prioritized.
2. **Password Reset Tokens Stored in Plaintext**:
   - `crypto.randomBytes(32).toString("hex")` is saved directly to `PasswordResetToken.token`.
   - Standard security practice recommends storing a SHA-256 hash of the token in the database, preventing token leakage in case of read-only database compromise.
3. **SVG Upload Vector**:
   - `/api/upload` accepts `image/svg+xml` after verifying that the buffer contains `<svg`.
   - SVGs can contain embedded JavaScript (e.g. `<script>`, `<foreignObject>`, or `onload` handlers). While Cloudinary serves images as sanitized resources, uploading un-sanitized SVG files presents a theoretical stored XSS risk if served inline from the same origin. Restricting uploads to raster formats (JPEG, PNG, WebP, GIF) or sanitizing with DOMPurify is advised.
4. **Stripe Fallback Secret in Build**:
   - `src/lib/stripe.ts` sets a dummy key `sk_test_mock_placeholder_for_build` if `STRIPE_SECRET_KEY` is omitted so Next.js static page generation succeeds. If deployed without setting the production key, payment initialization will silently fail with authentication errors.

---

## 9. Performance Concerns

1. **Render-Blocking Dynamic Font Import**:
   - `ProfileContainer.tsx` injects `@import url('https://fonts.googleapis.com/css2?family=...:wght@400;500;600;700;800;900&display=swap')` inside a client-side `<style>` tag.
   - This introduces an external network round-trip during client hydration, resulting in Flash of Unstyled Text (FOUT) or layout shift.
2. **Next.js Image Optimization Warnings (`@next/next/no-img-element`)**:
   - Standard HTML `<img>` elements are used across 9 components (`AppearanceForm.tsx`, `DashboardSidebar.tsx`, `LinksManager.tsx`, `BusinessSection.tsx`, `PaymentSection.tsx`, `ProfileContainer.tsx`, `ProfileHeader.tsx`, `avatar.tsx`, `ImageUpload.tsx`).
   - Using Next.js `<Image />` with Cloudinary loader or `next/image` domain configurations would enable automated responsive sizing, AVIF/WebP negotiation, and improved Largest Contentful Paint (LCP).
3. **High-Volume Raw Analytics Growth**:
   - Every public profile visit and outbound link click inserts an individual row into `ProfileView` or `ClickEvent`.
   - While composite indices exist, high-traffic profiles could accumulate hundreds of thousands of rows, gradually slowing aggregation queries on `/api/analytics`. A scheduled rollup table (e.g. `DailyAnalyticsSummary`) will be necessary at scale.

---

## 10. SEO Concerns

1. **Missing Dynamic OG Route Integration**:
   - The project includes a dedicated OG image generator at `/api/og` (`@vercel/og`).
   - However, `generateMetadata` in `src/app/p/[username]/page.tsx` only points `openGraph.images` to `user.avatarUrl ? [user.avatarUrl] : []`, completely ignoring the branded dynamic social card generated at `/api/og?username=${username}`.
2. **Uncached Database Query in Metadata**:
   - `generateMetadata` invokes `prisma.user.findUnique({ where: { username } })` directly rather than reusing the cached profile data from `getCachedProfile(username)`.
3. **Missing Robots & Sitemap**:
   - There is no `src/app/sitemap.ts` or `src/app/robots.ts`, preventing automated crawling and indexing of public creator profiles by search engines.
4. **Missing Twitter & Schema.org Structured Data**:
   - No `twitter: { card: 'summary_large_image' }` tags are set.
   - No JSON-LD `Person` or `ProfilePage` structured data is emitted for rich search engine snippets.

---

## 11. Monetization Gaps

1. **Simulated Upgrade Flow**:
   - The Monetization page (`src/app/dashboard/monetization/page.tsx`) features a 3-tier pricing UI (Starter, Pro, Enterprise) with monthly/yearly billing toggle (25% discount).
   - However, clicking "Upgrade to Pro" triggers a client-side `setTimeout` simulation rather than redirecting to a real Stripe Checkout session.
2. **Missing Checkout & Portal Route Handlers**:
   - No backend route exists to create a Stripe Checkout Session (`/api/billing/checkout`) or open the Stripe Customer Billing Portal (`/api/billing/portal`).
3. **Webhook Disconnect**:
   - The Stripe webhook handler (`/api/webhooks/stripe/route.ts`) is fully implemented for `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.
   - However, because sessions are never created through Stripe Checkout, the webhook receives no real production events.
4. **Absence of Plan Feature Gating**:
   - Features promised under the Pro plan (unlimited links, removal of Linkle branding, custom domains) are not programmatically gated in the code. Free users currently have access to the same link creation capacity and UI options as Pro users.

---

## 12. Recommended Implementation Order

To maintain stability and deliver maximum engineering value without breaking existing behavior, subsequent improvements should follow this phased implementation order:

```
┌────────────────────────────────────────────────────────┐
│  Phase 1: Persistence & Schema Alignment Fixes         │
│  • Persist themeFontFamily in validation & API         │
│  • Add Contact Actions UI to Links Manager             │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Phase 2: SEO & Social Discovery                       │
│  • Wire /api/og dynamic cards into generateMetadata    │
│  • Add sitemap.ts & robots.ts                          │
│  • Add Twitter Card & JSON-LD Person schema            │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Phase 3: Core Web Vitals & Asset Performance          │
│  • Migrate key <img> tags to next/image                │
│  • Optimize font loading (eliminate @import latency)   │
│  • Daily analytics aggregation / rollups               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Phase 4: Security Hardening                           │
│  • Hash password reset tokens (SHA-256) in database    │
│  • Restrict / sanitize SVG uploads                     │
│  • Automated pruning for expired tokens                │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  Phase 5: Full Monetization Activation                 │
│  • Implement /api/billing/checkout & portal endpoints  │
│  • Connect MonetizationPage CTA to Stripe Checkout     │
│  • Enforce plan-based feature gates (limits & badges)  │
└────────────────────────────────────────────────────────┘
```

---

*Baseline generated on October 2, 2026 for Linkle v1.0.0 production baseline.*
