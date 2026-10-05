# Linkle — Full Project Documentation

> **One Link. Endless Possibilities.**  
> A modern, feature-rich digital profile / link-in-bio platform built with Next.js 15, Prisma, and NextAuth v5.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
   - [2.1 Authentication](#21-authentication)
   - [2.2 Public Profile Page](#22-public-profile-page-pusername)
   - [2.3 Dashboard — Links Manager](#23-dashboard--links-manager)
   - [2.4 Dashboard — Appearance](#24-dashboard--appearance)
   - [2.5 Dashboard — Analytics](#25-dashboard--analytics)
   - [2.6 Dashboard — Live Preview Panel](#26-dashboard--live-preview-panel)
   - [2.7 Dashboard — Monetization & Settings](#27-dashboard--monetization--settings)
   - [2.8 QR Code](#28-qr-code)
   - [2.9 Email Capture](#29-email-capture)
   - [2.10 Cloudinary Photo Upload & Compression](#210-cloudinary-photo-upload--in-browser-compression-engine)
   - [2.11 Linkle Pay: Dynamic UPI "Pay Me" & QR Intent](#211-linkle-pay-dynamic-upi-pay-me--qr-intent-engine)
   - [2.12 Upstash Redis Rate Limiting](#212-upstash-redis-rate-limiting)
   - [2.13 Tag-Based Edge Caching & On-Demand Revalidation](#213-tag-based-edge-caching--on-demand-revalidation)
3. [Tech Stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Database Schema](#5-database-schema)
6. [Routes & Pages](#6-routes--pages)
7. [API Reference](#7-api-reference)
8. [Components](#8-components)
9. [Authentication Flow](#9-authentication-flow)
10. [Theming & Appearance System](#10-theming--appearance-system)
11. [Planning & Roadmap](#11-planning--roadmap)
12. [Project Setup](#12-project-setup)

---

## 1. Project Overview

**Linkle** is a digital profile aggregator — like Linktree, but more powerful. Every user gets a public page at `/p/<username>` where they can showcase:

- Social media links (Instagram, Twitter, LinkedIn, YouTube, GitHub, WhatsApp, etc.)
- Custom business / portfolio link blocks
- Payment collection methods (UPI, PayPal, Stripe, Crypto, etc.)
- Physical location with an embedded Google Maps widget
- Contact actions (vCard, appointment booking, resume download)
- Email capture / newsletter subscription widget

Users manage everything from a polished dashboard that features a live **mobile/desktop preview panel**, drag-and-drop reordering, per-link visibility toggles, in-place link editing, and deep appearance customisation.

---

## 2. Features

### 2.1 Authentication
| Feature | Status |
|---|---|
| Email + Password sign-in | ✅ Done |
| JWT-based sessions (NextAuth v5) | ✅ Done |
| User registration | ✅ Done |
| Forgot password (token generated, logged to console) | ✅ Done |
| Reset password (token-validated, bcrypt re-hash) | ✅ Done |
| Protected dashboard routes (server-side redirect) | ✅ Done |
| Account deletion (with typed confirmation) | ✅ Done |
| OAuth providers (Google, GitHub, etc.) | 🔲 Planned |
| Email delivery for password reset | 🔲 Planned (nodemailer installed) |

### 2.2 Public Profile Page (`/p/:username`)
| Feature | Status |
|---|---|
| Profile header (avatar, banner, display name, bio, username) | ✅ Done |
| Social links section with platform icons | ✅ Done |
| Business / custom link blocks with thumbnail images | ✅ Done |
| Payment methods section with Linkle Pay (Dynamic UPI "Pay Me" modal with verified QR, deep link, PNG download + PayPal, Stripe, Crypto...) | ✅ Done |
| Location section with embedded Google Maps | ✅ Done |
| Contact actions section | ✅ Done |
| Email capture / newsletter subscribe widget | ✅ Done |
| Scheduled link filtering (startDate / endDate enforced server-side) | ✅ Done |
| Dynamic SEO metadata (Title, Description, Canonical URL, Robots) | ✅ Done |
| Dynamic 1200x630 Open Graph image generator (`next/og` ImageResponse) | ✅ Done |
| Twitter / X Cards (`summary_large_image`) | ✅ Done |
| Schema.org JSON-LD Structured Data (`ProfilePage`, `Person`/`Organization`, `sameAs`) | ✅ Done |
| Robots Directives (`/robots.txt`) with strict bot rules | ✅ Done |
| Scalable Dynamic XML Sitemap (`/sitemap.xml`, 50k capacity, private data excluded) | ✅ Done |
| Web Application Manifest (`/manifest.webmanifest`) & Multi-Resolution App Icons | ✅ Done |
| Animated gradient background (themed to user's primary color) | ✅ Done |
| "Powered by Linkle" footer badge | ✅ Done |
| Demo profile at `/p/demo` | ✅ Done |

### 2.3 Dashboard — Links Manager
| Feature | Status |
|---|---|
| Tabs: Social / Links / Payments / Tools | ✅ Done |
| Add, delete, toggle visibility per link | ✅ Done |
| Drag-and-drop reorder (persisted to DB via API) | ✅ Done |
| Per-link click counter (real data from ClickEvent DB) | ✅ Done |
| Pin a link as "Featured" | ✅ Done (schema + UI) |
| QR code modal (downloadable) | ✅ Done |
| Business link thumbnail photo upload with client-side compression | ✅ Done |
| Email capture settings & subscriber list (Tools tab) | ✅ Done |
| Link edit in-place (LinkEditModal) | ✅ Done |
| Scheduled links (set start/end dates per link) | ✅ Done (schema + UI + server enforcement) |

### 2.4 Dashboard — Appearance
| Feature | Status |
|---|---|
| Profile info editing (display name, bio, Cloudinary avatar & banner upload with in-browser compression and live preview sync) | ✅ Done |
| 8 colour theme presets (Indigo, Rose, Amber, Emerald, Sky, Fuchsia, Cyan, Minimal) | ✅ Done |
| Custom hex colour picker | ✅ Done |
| 4 button styles (Pill, Rounded, Square, Outline) | ✅ Done |
| 7 typography / font family options | ✅ Done |
| Location settings (address, Google Maps embed URL, visibility toggle) | ✅ Done |
| Email capture widget settings (title, placeholder, enabled toggle) | ✅ Done |
| Live preview panel updates in real time (React Context) | ✅ Done |
| Save all changes via `PATCH /api/user/profile` | ✅ Done |

### 2.5 Dashboard — Analytics
| Feature | Status |
|---|---|
| Total clicks, unique visitors, link views, countries cards | ✅ Done |
| Daily performance bar chart (last 14 days) | ✅ Done |
| Top links ranking with progress bars | ✅ Done |
| Device breakdown (Mobile / Desktop / Other) | ✅ Done |
| Country breakdown | ✅ Done |
| Real event tracking / analytics backend | ✅ Done |

### 2.6 Dashboard — Live Preview Panel
| Feature | Status |
|---|---|
| Real-time mobile phone frame preview | ✅ Done |
| Toggle between Mobile / Desktop preview modes | ✅ Done |
| Preview reflects all appearance & link changes instantly | ✅ Done |
| Refresh button | ✅ Done |

### 2.7 Dashboard — Monetization & Settings
| Feature | Status |
|---|---|
| Monetization page — 3-tier pricing UI (Starter / Pro / Enterprise) | ✅ Done |
| Monthly / yearly billing toggle (25% yearly discount) | ✅ Done |
| Settings page — username & display name management | ✅ Done |
| Account deletion with typed confirmation | ✅ Done |
| Stripe payment backend integration | 🔲 Planned |

### 2.8 QR Code
| Feature | Status |
|---|---|
| Auto-generated QR for `/p/<username>` | ✅ Done |
| Download QR as PNG | ✅ Done |
| QR accessible from Links page and Tools tab | ✅ Done |

### 2.9 Email Capture
| Feature | Status |
|---|---|
| `emailCaptureEnabled` / title / placeholder settings on User | ✅ Done |
| `CapturedEmail` DB model (deduplication per user) | ✅ Done |
| `EmailCaptureSection` widget on public profile | ✅ Done |
| `POST /api/subscribe` backend endpoint | ✅ Done |
| Subscriber list in dashboard Tools tab | ✅ Done |
| CSV export of captured emails | 🔲 Planned |

### 2.10 Cloudinary Photo Upload & In-Browser Compression Engine
| Feature | Status |
|---|---|
| Server-side Cloudinary SDK streaming (`cloudinary.uploader.upload_stream`) | ✅ Done |
| Client-side HTML5 Canvas lossless/high-quality compression (auto-converts to WebP, custom bounds) | ✅ Done |
| Strict image-only restriction on client (drag-and-drop & file picker `accept="image/*"`) | ✅ Done |
| Strict server-side verification: MIME whitelist + binary magic bytes (JPEG, PNG, GIF, WebP, SVG) | ✅ Done |
| 10MB payload size ceiling enforcement | ✅ Done |
| Reusable `ImageUpload.tsx` component with live compression savings stats | ✅ Done |
| Seamless fallback toggle between direct file upload and external URL input | ✅ Done |
| Integrated for Profile Avatar, Profile Banner, and Business Link Thumbnails | ✅ Done |

### 2.11 Linkle Pay: Dynamic UPI "Pay Me" & QR Intent Engine
| Feature | Status |
|---|---|
| Dynamic NPCI-compliant UPI URI generation (`upi://pay?pa={upiId}&pn={displayName}&cu=INR`) | ✅ Done |
| Automatic VPA validation (`isValidUpiId`, `cleanUpiId`) | ✅ Done |
| Payer enters custom amount directly in their UPI app (no hardcoded fixed amount) | ✅ Done |
| Linkle-styled interactive `UpiPayModal` with high-contrast QR (`qrcode.react` Level H) | ✅ Done |
| One-click "Copy UPI ID" action with visual checkmark feedback | ✅ Done |
| Mobile deep link ("Pay via UPI App") button invoking native app chooser (GPay, PhonePe, Paytm, BHIM, Cred) | ✅ Done |
| High-resolution branded QR PNG download (`Payee Name`, `UPI ID`, `Linkle` badge) | ✅ Done |
| Web Share API integration (`navigator.share`) with clipboard fallback | ✅ Done |
| Reactive QR updates on UPI ID or display name change in dashboard/preview | ✅ Done |
| Automated end-to-end QR decode verification test (`scripts/test-upi-qr-decode.js` via `jsQR`) | ✅ Done |
| Zero regressions on PayPal, Stripe, Crypto, and Paytm accordion components | ✅ Done |

### 2.12 Upstash Redis Rate Limiting
| Feature | Status |
|---|---|
| Sliding window rate limiting on public routes via `@upstash/ratelimit` | ✅ Done |
| Newsletter subscriptions limited to 5 requests / min per IP | ✅ Done |
| Analytics tracking limited to 30 requests / 10 sec per IP | ✅ Done |
| Auth endpoints limited to 10 requests / min per IP | ✅ Done |
| Standard `429 Too Many Requests` responses with `X-RateLimit-*` headers | ✅ Done |
| Resilient fail-open fallback if Redis credentials are not configured or offline | ✅ Done |

### 2.13 Tag-Based Edge Caching & On-Demand Revalidation
| Feature | Status |
|---|---|
| Dynamic edge caching with cache tags (`user-profile-${username}`) | ✅ Done |
| On-demand cache invalidation via `revalidateProfile()` on profile or link updates | ✅ Done |
| Sub-second edge response times for public `/p/[username]` pages | ✅ Done |


---

## 3. Tech Stack

### Core Framework
| Layer | Technology | Version |
|---|---|---|
| Framework | **Next.js** | ^15.1.7 |
| Language | **TypeScript** | ^5.9.3 |
| Runtime | **React** | ^19.0.0 |
| Rendering | App Router (RSC + Client Components) | — |

### Database & ORM
| Layer | Technology | Version |
|---|---|---|
| ORM | **Prisma** | ^5.22.0 |
| Database | **PostgreSQL** (dev & prod) | — |
| Client | `@prisma/client` | ^5.22.0 |

> The schema `datasource` provider is set to `postgresql`. Ensure `DATABASE_URL` points to a valid PostgreSQL instance. For local development a local Postgres or a cloud instance (e.g. Supabase, Neon) is required.

### Authentication
| Layer | Technology | Version |
|---|---|---|
| Auth library | **NextAuth.js** | ^5.0.0-beta.30 (v5) |
| Prisma adapter | `@auth/prisma-adapter` | ^2.11.1 |
| Password hashing | **bcryptjs** | ^3.0.3 |
| Strategy | JWT sessions | — |

### UI & Styling
| Layer | Technology | Version |
|---|---|---|
| CSS framework | **Tailwind CSS** | ^3.4.17 |
| Icons | **lucide-react** | ^0.562.0 |
| Animation | **Framer Motion** | ^12.37.0 |
| Drag & Drop | **@dnd-kit** (core + sortable + utilities) | ^6/10/3 |
| QR codes | **qrcode.react** | ^4.2.0 |
| Utility | `clsx`, `tailwind-merge` | latest |

### Media Storage & Optimization
| Layer | Technology | Version |
|---|---|---|
| Cloud Media SDK | **cloudinary** | ^2.9.0 |
| Client-Side Compression | HTML5 Canvas Resampling (WebP) | Native |

### Caching & Rate Limiting
| Layer | Technology | Version |
|---|---|---|
| Redis Client | **@upstash/redis** | ^1.38.0 |
| Rate Limiter | **@upstash/ratelimit** | ^2.0.8 |
| Edge Revalidation | Next.js `revalidateTag` (`user-profile-*`) | Native |

### QR Testing & Verification
| Layer | Technology | Version |
|---|---|---|
| QR Matrix Rasterizer | **qrcode** | ^1.5.4 |
| QR Decoder | **jsqr** | ^1.4.0 |

### Email (installed, delivery pending)
| Layer | Technology | Version |
|---|---|---|
| Email transport | **nodemailer** | ^7.0.13 |

### Tooling
| Tool | Purpose |
|---|---|
| `eslint` + `eslint-config-next` | Linting |
| `postcss` + `autoprefixer` | CSS processing |
| `next dev` | Dev server (Turbopack) |
| `ts-node` | Seed script runner (`npm run seed`) |

---

## 4. Architecture

```
d:\VibingSites\LINKLE\
├── prisma/
│   └── schema.prisma          # Database schema (PostgreSQL, Prisma models)
├── scripts/
│   └── test-upi-qr-decode.js  # Automated QR encode/decode verification with jsQR
├── seed-analytics.ts          # Analytics seed script (ts-node)
├── src/
│   ├── auth.ts                # NextAuth config (Credentials provider, JWT callbacks)
│   ├── app/
│   │   ├── layout.tsx         # Root layout (Providers, fonts)
│   │   ├── globals.css        # Global styles, CSS variables, animations
│   │   ├── page.tsx           # Landing / marketing page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── forgot-password/   # Forgot password page
│   │   ├── reset-password/    # Reset password page (token param)
│   │   ├── p/[username]/      # Public profile page (SSR + dynamic OG metadata)
│   │   ├── dashboard/         # Protected dashboard shell
│   │   │   ├── layout.tsx     # Auth guard + sidebar + preview panel
│   │   │   ├── page.tsx       # /dashboard → Links Manager (default)
│   │   │   ├── overview/      # Dashboard home
│   │   │   ├── appearance/    # Appearance settings
│   │   │   ├── analytics/     # Analytics view
│   │   │   ├── monetization/  # 3-tier pricing page ✅
│   │   │   └── settings/      # Username / account deletion settings ✅
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/  # NextAuth handler
│   │       │   ├── forgot-password/route.ts
│   │       │   └── reset-password/route.ts
│   │       ├── upload/             # POST — Cloudinary photo upload with magic byte inspection ✅
│   │       ├── links/
│   │       │   ├── social/         # GET, POST, DELETE, PATCH toggle, PATCH edit, POST reorder
│   │       │   ├── business/       # GET, POST, DELETE, PATCH toggle, PATCH edit, POST reorder
│   │       │   └── payment/        # GET, POST, DELETE, PATCH toggle, PATCH edit, POST reorder
│   │       ├── subscribe/          # POST — email capture (rate-limited via Upstash) ✅
│   │       ├── analytics/          # GET aggregated stats, POST view, POST click (rate-limited)
│   │       └── user/
│   │           ├── profile/        # PATCH user profile & appearance (revalidates edge cache)
│   │           └── settings/       # PATCH username/displayName, DELETE account ✅
│   ├── components/
│   │   ├── Providers.tsx           # SessionProvider wrapper
│   │   ├── dashboard/
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── LinksManager.tsx    # Social / Business / Payment / Tools tabs
│   │   │   ├── AppearanceForm.tsx  # Theme, fonts, profile, location, email capture
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── MobilePreview.tsx   # Live phone/desktop preview frame
│   │   │   ├── PreviewContext.tsx  # React Context for live preview state
│   │   │   ├── QRCodeModal.tsx
│   │   │   ├── LinkEditModal.tsx   # In-place link editor with scheduling & thumbnails ✅
│   │   │   ├── SettingsForm.tsx    # Username change + account deletion ✅
│   │   │   └── StyledSelect.tsx    # Custom animated icon dropdown ✅
│   │   ├── profile/
│   │   │   ├── ProfileContainer.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── SocialLinks.tsx
│   │   │   ├── BusinessSection.tsx
│   │   │   ├── PaymentSection.tsx  # Multi-platform support + UPI modal trigger ✅
│   │   │   ├── UpiPayModal.tsx     # Interactive Linkle Pay UPI modal with QR & deep links ✅
│   │   │   ├── ContactSection.tsx
│   │   │   ├── LocationSection.tsx
│   │   │   └── EmailCaptureSection.tsx  # Newsletter subscribe widget ✅
│   │   ├── qr/                     # QR code components
│   │   └── ui/
│   │       ├── ThemeToggle.tsx     # Light / dark mode toggle
│   │       ├── avatar.tsx
│   │       └── ImageUpload.tsx     # Drag-and-drop uploader with in-browser compression ✅
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── types.ts                # Shared TypeScript types
│   │   ├── utils.ts                # Utility helpers (cn, etc.)
│   │   ├── cloudinary.ts           # Cloudinary SDK configuration singleton ✅
│   │   ├── imageCompression.ts     # Client-side canvas compression & format validation ✅
│   │   ├── upi.ts                  # Dynamic UPI URI generator & VPA validator ✅
│   │   ├── ratelimit.ts            # Upstash Redis sliding window rate limiters ✅
│   │   ├── cache.ts                # Tag-based edge cache revalidation helper ✅
│   │   └── validation.ts           # Zod schemas for all API payloads
│   ├── data/                       # Static data / seed content
│   └── types/                      # Extended type declarations (next-auth module augmentation)
└── tailwind.config.ts
```

### Data Flow — Dashboard Live Preview

```
User edits in AppearanceForm / LinksManager
        │
        ▼
   updatePreviewUser() ← PreviewContext (React Context)
        │
        ▼
  MobilePreview reads previewUser
        │
        ▼
  ProfileHeader, SocialLinks, BusinessSection, PaymentSection re-render
        │
        ▼
  Phone / Desktop frame updates in real time (no page reload)
```

### API Request Flow — Link CRUD

```
Client (LinksManager)
  ──POST /api/links/social──▶  route.ts handler
                                 └─ auth() → session check
                                 └─ prisma.socialLink.create()
                                 └─ return new link JSON
  ◀── new link data ──────────
  setSocialLinks(prev => [...prev, data])   ← optimistic UI update
```

### Data Flow — Cloudinary Image Upload & Client Compression

```
User selects / drops photo in ImageUpload
        │
        ▼
MIME Type Validation (image/png, jpeg, webp, gif only)
        │
        ▼
Client-Side Compression (`compressImage()`)
  ├─ Aspect-ratio bounding (e.g. max 800px / 1600px)
  ├─ Offscreen Canvas redraw with high-quality smoothing
  └─ Encoded to optimized WebP (0.84 quality)
        │
        ▼
POST /api/upload (multipart/form-data)
  ├─ Session Authentication (`auth()`)
  ├─ Binary Magic Byte signature inspection (JPEG, PNG, GIF, WebP)
  ├─ 10MB payload ceiling check
  └─ `cloudinary.uploader.upload_stream` to `linkle/{folder}`
        │
        ▼
Returns secure Cloudinary CDN URL (https://res.cloudinary.com/...)
        │
        ▼
Live preview updates instantly; saved to DB via User Profile or Link PATCH
```

### Data Flow — Linkle Pay UPI Intent & Dynamic QR Verification

```
Visitor clicks UPI payment button on /p/[username]
        │
        ▼
PaymentSection triggers UpiPayModal
        │
        ▼
Dynamic URI Generated (`src/lib/upi.ts`)
upi://pay?pa={cleanUpiId}&pn={displayName}&cu=INR
        │
        ├──▶ Desktop Payer: Scans high-contrast QR (`qrcode.react` Level H)
        │       └─ Decodes directly into payer's phone camera / UPI scanner app
        │
        ├──▶ Mobile Payer: Taps "Pay via UPI App" Deep Link Button
        │       └─ Native OS intent invokes GPay, PhonePe, Paytm, BHIM, Cred
        │
        └──▶ Payee Tools:
                ├─ One-click "Copy UPI ID"
                ├─ High-res PNG QR card download (Canvas rendering)
                └─ Native Web Share API (navigator.share)
```


---

## 5. Database Schema

Linkle uses **Prisma** with **PostgreSQL**. All IDs are CUID strings. Timestamps are auto-managed.

### Models

#### `User`
The central model. Extends NextAuth's standard user with Linkle-specific profile, theme, and email-capture fields.

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `name` | String? | Full name (from auth) |
| `email` | String? unique | Login email |
| `emailVerified` | DateTime? | OAuth email verification |
| `image` | String? | OAuth profile image |
| `password` | String? | bcrypt hash (credentials auth) |
| `username` | String? unique | Public profile slug (`/p/<username>`) |
| `displayName` | String? | Shown on public profile |
| `bio` | String? | Short bio |
| `avatarUrl` | String? | Custom avatar URL |
| `bannerUrl` | String? | Profile banner URL |
| `emailCaptureEnabled` | Boolean | Default: `false` |
| `emailCaptureTitle` | String | Default: `"Subscribe to my newsletter"` |
| `emailCapturePlaceholder` | String | Default: `"Enter your email"` |
| `themePrimaryColor` | String | Default: `#6366f1` |
| `themeBackgroundColor` | String | Default: `var(--background)` |
| `themeFontFamily` | String | Default: `Inter` |
| `themeButtonStyle` | String | `pill` / `rounded` / `square` / `outline` |
| `locationAddress` | String? | Physical address text |
| `locationGoogleMapsEmbedUrl` | String? | Google Maps iframe embed URL |
| `locationShowDirectionsBtn` | Boolean | Default: `true` |
| `locationIsVisible` | Boolean | Default: `true` |
| `createdAt` | DateTime | Auto |
| `updatedAt` | DateTime | Auto |

#### `SocialLink`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `platform` | String | `instagram`, `twitter`, `linkedin`, `youtube`, `github`, `email`, `phone`, `whatsapp`, `website` |
| `url` | String | Profile URL or handle |
| `label` | String? | Custom label |
| `isVisible` | Boolean | Default `true` |
| `order` | Int | Display order |
| `startDate` | DateTime? | Scheduled publish start (optional) |
| `endDate` | DateTime? | Scheduled publish end (optional) |
| `featured` | Boolean | Default `false` — pin as featured |

#### `BusinessLink`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `title` | String | Display title |
| `url` | String | Destination URL |
| `description` | String? | Short description |
| `thumbnailUrl` | String? | Cover image URL |
| `isVisible` | Boolean | Default `true` |
| `order` | Int | Display order |
| `startDate` | DateTime? | Scheduled publish start |
| `endDate` | DateTime? | Scheduled publish end |
| `featured` | Boolean | Default `false` |

#### `PaymentLink`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `platform` | String | `upi`, `paytm`, `phonepe`, `googlepay`, `stripe`, `paypal`, `crypto` |
| `value` | String | UPI ID / payment link / wallet address |
| `isVisible` | Boolean | Default `true` |
| `order` | Int | Display order |
| `startDate` | DateTime? | Scheduled publish start |
| `endDate` | DateTime? | Scheduled publish end |
| `featured` | Boolean | Default `false` |

#### `ContactAction`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `type` | String | `vcard`, `book_appointment`, `download_resume`, `custom_form` |
| `label` | String | Button label |
| `url` | String | Target URL |
| `isVisible` | Boolean | Default `true` |
| `order` | Int | Display order |
| `startDate` | DateTime? | Scheduled publish start |
| `endDate` | DateTime? | Scheduled publish end |
| `featured` | Boolean | Default `false` |

#### `PasswordResetToken`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `email` | String | |
| `token` | String unique | 32-byte hex, expires in 1 hour |
| `expires` | DateTime | |

#### `ProfileView`
Tracks visitor profile views for real-time analytics.
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `visitorId` | String? | Unique visitor tracking (local storage `linkle_visitor_id`) |
| `referrer` | String? | Traffic source (Direct, Twitter, Google, etc.) |
| `device` | String? | Mobile / Desktop / Tablet / Other (parsed from User-Agent) |
| `country` | String? | Country code (parsed from Vercel/Cloudflare edge geolocation headers) |
| `createdAt` | DateTime | Auto |

#### `ClickEvent`
Tracks outbound click events on user links.
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `linkId` | String | ID of clicked social, business, payment, or contact link |
| `linkType` | String | `social` / `business` / `payment` / `contact` |
| `linkTitle` | String | Label or title of the link |
| `url` | String | Destination URL |
| `referrer` | String? | Traffic source |
| `device` | String? | Mobile / Desktop / Tablet / Other |
| `country` | String? | Country code |
| `createdAt` | DateTime | Auto |

#### `CapturedEmail`
Stores subscriber emails collected via the public profile email capture widget.
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `email` | String | Subscriber email (deduplicated per user) |
| `createdAt` | DateTime | Auto |

#### NextAuth standard models
`Account`, `Session`, `VerificationToken` — standard NextAuth/Prisma adapter models.

---

## 6. Routes & Pages

| Route | Type | Auth Required | Description |
|---|---|---|---|
| `/` | Server Component | No | Marketing landing page |
| `/login` | Client Component | No | Email/password sign-in |
| `/register` | Client Component | No | New account creation |
| `/forgot-password` | Client Component | No | Request password reset |
| `/reset-password?token=<token>` | Client Component | No | Set new password |
| `/p/[username]` | Server Component | No | Public user profile (with dynamic OG metadata) |
| `/dashboard` | Server Component | **Yes** | Links Manager (default tab) |
| `/dashboard/overview` | Server Component | **Yes** | Dashboard home |
| `/dashboard/appearance` | Client Component | **Yes** | Appearance & theme settings |
| `/dashboard/analytics` | Client Component | **Yes** | Analytics dashboard |
| `/dashboard/monetization` | Client Component | **Yes** | 3-tier pricing / plan upgrade page ✅ |
| `/dashboard/settings` | Server Component | **Yes** | Username, display name & account deletion ✅ |

---

## 7. API Reference

All API routes are in `src/app/api/`. All routes that mutate data require an active session (checked via `auth()`).

### Auth Endpoints

#### `POST /api/auth/forgot-password`
Request a password reset token.
```json
// Body
{ "email": "user@example.com" }

// Response (always 200 to avoid leaking user existence)
{ "success": true }
```
The reset link is currently **logged to the server console**. Email delivery via nodemailer is planned.

---

#### `POST /api/auth/reset-password`
Consume a reset token and update the password.
```json
// Body
{ "token": "<hex token>", "password": "newPassword123" }

// Response 200
{ "success": true }

// Errors: 400 (missing/expired token), 500
```

---

### Link Endpoints

All link endpoints follow the same REST pattern. Examples shown for `social`; `business` and `payment` are identical.

#### `GET /api/links/social`
Returns all social links for the authenticated user, ordered by `order` asc.

#### `POST /api/links/social`
```json
// Body
{ "platform": "instagram", "url": "https://instagram.com/handle", "label": "My Insta" }
// Response 201 — the created SocialLink object
```

#### `DELETE /api/links/social/[id]`
Deletes the link with the given ID (must belong to the current user).

#### `PATCH /api/links/social/[id]/toggle`
Toggles `isVisible` for the link.
```json
// Body
{ "isVisible": true }
```

#### `PATCH /api/links/social/[id]`
Updates an existing link's properties (label, url, startDate, endDate, featured, etc.).

#### `POST /api/links/social/reorder`
Persists a new display order after drag-and-drop.
```json
// Body
{ "links": [{ "id": "...", "order": 0 }, { "id": "...", "order": 1 }] }
```

---

### User Profile Endpoint

#### `PATCH /api/user/profile`
Updates profile info and appearance settings.
```json
// Body (all fields optional)
{
  "displayName": "Jane Doe",
  "bio": "Designer & Creator",
  "avatarUrl": "https://...",
  "bannerUrl": "https://...",
  "themePrimaryColor": "#f43f5e",
  "themeButtonStyle": "pill",
  "themeFontFamily": "Inter",
  "locationAddress": "123 Studio, Mumbai",
  "locationGoogleMapsEmbedUrl": "https://www.google.com/maps/embed?...",
  "locationIsVisible": true,
  "emailCaptureEnabled": true,
  "emailCaptureTitle": "Join my newsletter",
  "emailCapturePlaceholder": "your@email.com"
}
// Response 200 — updated user object
```

---

### User Settings Endpoints

#### `PATCH /api/user/settings`
Updates the authenticated user's username and/or display name. Validates username uniqueness and format (3–20 chars, alphanumeric + `-` / `_`).
```json
// Body
{ "username": "janedoe", "displayName": "Jane Doe" }

// Response 200 — updated user object
// Errors: 400 (invalid format, username already taken), 401, 500
```

#### `DELETE /api/user/settings`
Permanently deletes the authenticated user's account. Prisma `onDelete: Cascade` removes all related links, analytics events, captured emails, and sessions.
```json
// Response 200
{ "success": true }
// Errors: 401, 500
```

---

### Email Capture Endpoint

#### `POST /api/subscribe`
Captures an email for a user's newsletter list. No authentication required — called from the public profile page. Rate-limited by visitor IP.
```json
// Body
{ "username": "janedoe", "email": "visitor@example.com" }

// Response 201
{ "success": true, "subscription": { "id": "...", "email": "...", "createdAt": "..." } }

// Errors: 400 (duplicate email, invalid format), 404 (username not found), 429 (rate limit exceeded), 500
```

---

### Media Upload Endpoint

#### `POST /api/upload`
Streams an image asset to Cloudinary. Requires an active user session (`auth()`).

- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: The binary image file (File / Blob)
  - `folder` (optional): Target subfolder (`avatars`, `banners`, `thumbnails`, or `general`). Path-traversal sanitized.
- **Validations & Protections**:
  - **MIME Type Whitelist**: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/svg+xml`.
  - **Magic Byte Signature Inspection**: Validates binary headers (JPEG `FF D8 FF`, PNG `89 50 4E 47`, GIF `47 49 46`, WebP `RIFF...WEBP`, SVG `<svg`) to prevent spoofed/malicious file uploads.
  - **Size Ceiling**: 10MB maximum file size.
  - **Auto-Optimization**: Directly piped to Cloudinary with `fetch_format: auto` and `quality: auto`.

```json
// Response 200
{
  "url": "https://res.cloudinary.com/j9iy9acr/image/upload/v1790520841/linkle/avatars/default_avatar.jpg",
  "publicId": "linkle/avatars/default_avatar",
  "width": 800,
  "height": 800,
  "format": "webp",
  "bytes": 62410
}

// Errors: 400 (no file, unsupported format, corrupted binary signature, size > 10MB), 401 (unauthorized), 500 (Cloudinary credentials missing or stream error)
```

---


### Analytics Endpoints

#### `POST /api/analytics/view`
Logs a public profile page view. Automatically resolves user device category (Mobile/Desktop/Tablet) and matches edge geolocation headers (`x-vercel-ip-country`, `cf-ipcountry`) to capture the visitor's country.
```json
// Body
{
  "username": "jane",
  "referrer": "https://twitter.com/...",
  "visitorId": "vis_d83js8djs9"
}

// Response 200
{
  "success": true
}
```

#### `POST /api/analytics/click`
Logs an outbound click event on a social, business, payment, or contact link.
```json
// Body
{
  "userId": "usr_9d8s7g8h9",
  "linkId": "lnk_3h4j5k6l7",
  "linkType": "social",
  "linkTitle": "Instagram",
  "url": "https://instagram.com/jane",
  "referrer": "Direct"
}

// Response 200
{
  "success": true
}
```

#### `GET /api/analytics`
Fetches real aggregated performance metrics and charts for the authenticated user's dashboard.
```json
// Response 200
{
  "stats": [
    { "label": "Total Clicks", "value": "1,248", "icon": "click" },
    { "label": "Unique Visitors", "value": "890", "icon": "visitor" },
    { "label": "Profile Views", "value": "2,410", "icon": "view" },
    { "label": "Countries Connected", "value": "12", "icon": "globe" }
  ],
  "countries": [
    { "name": "India", "pct": 65 },
    { "name": "United States", "pct": 20 }
  ],
  "devices": [
    { "label": "Mobile", "value": 75 },
    { "label": "Desktop", "value": 22 },
    { "label": "Tablet", "value": 3 }
  ],
  "topLinks": [
    { "name": "My Instagram", "clicks": 450, "pct": 36 },
    { "name": "Hire Me (vCard)", "clicks": 210, "pct": 17 }
  ],
  "dailyChart": [
    { "dateStr": "May 20", "clicks": 14, "views": 32 },
    { "dateStr": "May 21", "clicks": 22, "views": 45 }
  ]
}
```

---

### Rate Limiting & Protection

Public-facing API endpoints are protected using **Upstash Redis** sliding-window rate limiters configured in `src/lib/ratelimit.ts`:

| Route | Target | Limit | Window | Action on Exceed |
|---|---|---|---|---|
| `POST /api/subscribe` | Visitor IP | 5 requests | 60 seconds | `429 Too Many Requests` |
| `POST /api/analytics/*` | Visitor IP | 30 requests | 10 seconds | `429 Too Many Requests` |
| `POST /api/auth/*` | Visitor IP | 10 requests | 60 seconds | `429 Too Many Requests` |

When rate-limited, responses include standard headers:
- `X-RateLimit-Limit`: Maximum allowable requests in the window
- `X-RateLimit-Remaining`: Requests remaining in the current window
- `X-RateLimit-Reset`: Unix timestamp when the quota resets

*Fail-Open Resilience*: If Redis is unavailable or unconfigured, the application logs a warning and allows requests through to avoid locking out legitimate users.

---

### Edge Caching & On-Demand Revalidation

Public profile pages at `/p/[username]` leverage Next.js tag-based edge caching for sub-millisecond worldwide delivery:
- Cache Tag: `user-profile-${username.toLowerCase()}`
- Invalidation: `revalidateProfile(username)` in `src/lib/cache.ts` triggers on-demand cache purge whenever user details, appearance settings, or links are updated via `PATCH /api/user/profile` or `/api/links/*`.

---


## 8. Components

### Dashboard Components (`src/components/dashboard/`)

| Component | Purpose |
|---|---|
| `DashboardSidebar.tsx` | Persistent left nav with logo, user info, nav links, sign-out |
| `LinksManager.tsx` | Tabbed interface for Social / Business / Payment / Tools; DnD reorder |
| `AppearanceForm.tsx` | Profile info with Cloudinary avatar & banner uploaders, colour themes, button styles, typography, location, email capture settings |
| `AnalyticsDashboard.tsx` | Stats cards, bar chart, top links, device & country breakdown |
| `MobilePreview.tsx` | Live phone/desktop frame; renders real profile components |
| `PreviewContext.tsx` | React Context + provider that holds the live preview user state |
| `QRCodeModal.tsx` | Modal with `qrcode.react` QR for the user's profile URL + download |
| `LinkEditModal.tsx` | Full-featured in-place link editor for social, business, and payment links; supports scheduled start/end dates and thumbnail photo upload |
| `SettingsForm.tsx` | Username & display name editor + danger zone account deletion with typed confirmation |
| `StyledSelect.tsx` | Custom animated dropdown with icon support; used in link modals and platform selectors |

### Profile Components (`src/components/profile/`)

These components are used both on the **public profile page** (`/p/[username]`) and inside the **live preview panel** in the dashboard.

| Component | Purpose |
|---|---|
| `ProfileContainer.tsx` | Wrapper that assembles the full public profile; centralised analytics event bubbling via data attributes |
| `ProfileHeader.tsx` | Avatar, banner image, display name, username handle, bio |
| `SocialLinks.tsx` | Renders social platform icon buttons |
| `BusinessSection.tsx` | Renders titled link cards with optional thumbnail image and description |
| `PaymentSection.tsx` | Renders payment method buttons (UPI, PayPal, Stripe, Crypto etc.); triggers Linkle Pay interactive UPI modal for UPI cards while preserving native details accordions for others |
| `UpiPayModal.tsx` | Interactive Linkle Pay modal: dynamic verified QR code (Level H), visible UPI ID, one-click copy, 'Pay via UPI App' mobile deep link, PNG QR download, and Web Share API |
| `ContactSection.tsx` | Renders contact action buttons (vCard, booking, resume) |
| `LocationSection.tsx` | Renders address text, Google Maps iframe, directions button |
| `EmailCaptureSection.tsx` | Animated newsletter subscribe widget; calls `POST /api/subscribe`; adapts border-radius to user's `buttonStyle` |

### UI Components (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `ImageUpload.tsx` | Reusable photo uploader with client-side HTML5 canvas compression to WebP, drag-and-drop dropzone, live savings metrics, replace/remove actions, and URL fallback toggle |
| `ThemeToggle.tsx` | Light / dark mode toggle button |
| `avatar.tsx` | Reusable avatar component |


---

## 9. Authentication Flow

```
Registration
  POST /api/auth/register
    → Validate email uniqueness
    → bcrypt.hash(password, 10)
    → prisma.user.create()
    → Redirect to /login

Login
  Client: signIn("credentials", { email, password })
    → NextAuth CredentialsProvider.authorize()
    → prisma.user.findUnique({ where: { email } })
    → bcrypt.compare(password, user.password)
    → Return { id, email, name, image, username }
    → JWT signed with { id, username }
    → Redirect to /dashboard

Session Access
  Server Component: const session = await auth()
  Client Component: const session = useSession()
  session.user.id       ← user DB id
  session.user.username ← public profile username

Password Reset
  1. User submits email at /forgot-password
  2. POST /api/auth/forgot-password
     → Generate 32-byte hex token
     → Store in PasswordResetToken (expires 1h)
     → Log reset URL to console (nodemailer email sending planned)
  3. User visits /reset-password?token=<token>
  4. POST /api/auth/reset-password
     → Validate token exists & not expired
     → bcrypt.hash(newPassword)
     → prisma.user.update({ password })
     → prisma.passwordResetToken.delete()
     → Redirect to /login

Account Deletion
  1. User visits /dashboard/settings → Danger Zone
  2. Types "delete my account" to confirm
  3. DELETE /api/user/settings
     → auth() session check
     → prisma.user.delete() — Prisma cascade removes all related records
     → signOut({ callbackUrl: "/" })
```

---

## 10. Theming & Appearance System

### CSS Variables (`globals.css`)
The global stylesheet defines CSS custom properties for light/dark mode:
- `--background`, `--foreground`
- Utility classes: `.gradient-text`, `.gradient-bg`, `.glass`, `.glass-dark`, `.shadow-glow`
- Animations: `animate-float`

### User Primary Color
Each user's chosen primary colour is injected as a CSS variable into the profile container:
```jsx
<div style={{ "--user-primary": themePrimary } as React.CSSProperties}>
```
Profile components reference `var(--user-primary)` for button backgrounds, icon backgrounds, and gradient blobs, making the entire profile dynamically themed.

### Theme Presets
8 built-in colour presets stored in `AppearanceForm.tsx`:

| Name | Hex | Gradient |
|---|---|---|
| Indigo (default) | `#6366f1` | `indigo-500 → purple-600` |
| Rose | `#f43f5e` | `rose-500 → pink-600` |
| Amber | `#f59e0b` | `amber-400 → orange-500` |
| Emerald | `#10b981` | `emerald-400 → teal-500` |
| Sky | `#0ea5e9` | `sky-400 → blue-500` |
| Fuchsia | `#d946ef` | `fuchsia-500 → pink-500` |
| Cyan | `#06b6d4` | `cyan-400 → sky-500` |
| Minimal | `#737373` | `neutral-500 → stone-600` |

### Button Styles
4 styles selectable per user: `pill` (rounded-full), `rounded` (rounded-xl), `square` (no radius), `outline` (border, no fill).

### Typography
7 font families: Inter, Poppins, DM Sans, Space Grotesk, Syne, Playfair Display, Roboto Mono.

---

## 11. Planning & Roadmap

### Current Status
The core product is fully functional end-to-end:
- ✅ Auth (register, login, forgot/reset password, account deletion)
- ✅ Public profiles with full theming, dynamic OG metadata, and scheduled link filtering
- ✅ Dashboard with live preview
- ✅ Links CRUD (social, business, payment, contact) with DnD reorder
- ✅ In-place link editor with scheduled dates & thumbnail uploads (LinkEditModal)
- ✅ Featured link pinning
- ✅ Appearance customisation persisted to DB (incl. email capture settings)
- ✅ QR code generation and download
- ✅ Real-time analytics system (page views, link clicks, unique visitors, device & country breakdowns, dynamic 14-day daily charts)
- ✅ Email capture / newsletter subscription widget with backend deduplication
- ✅ Monetization pricing page (3-tier: Starter / Pro / Enterprise, monthly/yearly toggle)
- ✅ Settings page (username change with uniqueness validation + account deletion with confirmation)
- ✅ Cloudinary photo uploads for avatars, banners, and link thumbnails with client-side canvas WebP compression and format validation
- ✅ Linkle Pay: Dynamic UPI "Pay Me" feature with verified QR generation, deep linking, PNG download, and Web Share
- ✅ Upstash Redis sliding-window rate limiting on public routes (newsletter, analytics, auth)
- ✅ Tag-based edge caching and on-demand cache invalidation (revalidateProfile)

### Feature Notes

#### Cloudinary Photo Upload & Compression Engine
- **In-Browser Compression**: Uses native HTML5 Canvas drawing with `imageSmoothingQuality = "high"` in `src/lib/imageCompression.ts`. Binds max dimension (e.g. 800px / 1600px), converts raster images to optimized WebP at 0.84 quality, and displays savings metrics (e.g. `✨ 3.2 MB → 450 KB (86% saved)`).
- **Strict Image-Only Restriction**: Enforces `accept="image/*"` and MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) on client; rejects non-image formats immediately.
- **Server-Side Security**: `/api/upload` verifies authenticated sessions, enforces a 10MB ceiling, and validates **binary magic byte signatures** (JPEG, PNG, GIF, WebP, SVG) to prevent extension spoofing.
- **Direct Stream**: Piped to Cloudinary using `cloudinary.uploader.upload_stream` to `linkle/{folder}`.
- **UI Flexibility**: `ImageUpload.tsx` supports drag-and-drop, replace/remove buttons, live preview, and an inline fallback toggle to paste direct image URLs.

#### Linkle Pay: Dynamic UPI & QR Intent System
- **NPCI UPI Spec**: `upi://pay?pa={cleanUpiId}&pn={displayName}&cu=INR` generated dynamically in `src/lib/upi.ts`.
- **No Fixed Amount**: Omitted `am` parameter so the payer enters their desired amount directly within their native UPI app.
- **High-Contrast Scannable QR**: Rendered using `qrcode.react` with Error Correction Level `H` on a white backdrop for reliable scanning in both dark and light modes.
- **Mobile Deep Link**: Deep link button (`<a href="upi://pay?...">`) styled with Linkle gradient and glow, directly launching installed UPI apps (Google Pay, PhonePe, Paytm, BHIM, Cred) on mobile devices.
- **Payee Tools**: One-click "Copy UPI ID", high-resolution branded PNG QR card export, and native Web Share API (`navigator.share`).
- **Automated Verification**: Verified using `jsQR` in `scripts/test-upi-qr-decode.js` ensuring encoded QR matrices decode to the exact URI intent.
- **Zero Regressions**: PayPal, Stripe, Crypto, and Paytm continue using their existing accordion views without disruption.

#### Upstash Redis Rate Limiting
- **Sliding-Window Algorithm**: Implemented via `@upstash/ratelimit` on public endpoints (`/api/subscribe`, `/api/analytics/*`, `/api/auth/*`).
- **Fail-Open Resilience**: Gracefully bypasses rate limiting if Redis credentials are not configured or temporarily unreachable.
- **RFC Standard Headers**: Returns `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` with `429 Too Many Requests`.

#### Real-Time Analytics System
- **`ProfileView` & `ClickEvent`**: Tracks every mount on public `/p/[username]` paths and any outbound link tap.
- **Client-Side Event Bubbling**: A centralized click-handler in `ProfileContainer` catches tracking attributes (`data-track-id`, `data-track-type`, etc.) without bloated per-component `onClick` props.
- **Edge-Based Geolocation & Device Parsing**: Uses `x-vercel-ip-country` / `cf-ipcountry` headers and client user-agent parsing.
- **Prisma Aggregations**: `groupBy`, `count`, `distinct` for all dashboard widgets.

#### Email Capture System
- Toggle enabled in Appearance dashboard; title/placeholder are customisable.
- `EmailCaptureSection` on public profile adapts border-radius to the user's `buttonStyle`.
- `POST /api/subscribe` validates email format, deduplicates per user, and enforces IP rate limits.

#### Scheduled Links
- `startDate` / `endDate` on every link model (`SocialLink`, `BusinessLink`, `PaymentLink`, `ContactAction`).
- Profile page server-side filters links at render time — expired or future-dated links are never served to visitors.
- `LinkEditModal` exposes date pickers for scheduling.

### Planned
| Feature | Notes |
|---|---|
| Email delivery for password reset | `nodemailer` installed; SMTP config pending |
| Stripe payment backend | Wiring Pro/Enterprise upgrades |
| OAuth providers | Google, GitHub (NextAuth adapter ready) |
| Custom domains | Pro tier feature |
| Captured email CSV export | Dashboard Tools tab |

### Planned: Email Delivery
Use **nodemailer** (already installed) to send password-reset emails. Update `forgot-password/route.ts`:
```ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

await transporter.sendMail({
  from: 'Linkle <no-reply@linkle.app>',
  to: email,
  subject: 'Reset your Linkle password',
  html: `<a href="${resetUrl}">Reset password</a>`,
});
```

---

## 12. Project Setup

### Prerequisites
- Node.js 18+
- npm / pnpm
- Git
- PostgreSQL instance (local or cloud, e.g. Supabase, Neon)

### Environment Variables
Create a `.env` file in the project root:
```env
# Database Configurations (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/linkle?schema=public"

# NextAuth v5 Configuration
AUTH_SECRET="your-secure-next-auth-secret-key"
AUTH_TRUST_HOST=true
NEXTAUTH_URL="http://localhost:3000"

# Public App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary Integration (Image Uploads & Hosting)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Upstash Redis Configuration (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-database.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-rest-token-here"

# Google OAuth Credentials (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Delivery (Optional)
SMTP_HOST="smtp.resend.com"
SMTP_PORT=587
SMTP_USER="resend"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="Linkle <noreply@yourdomain.com>"
```

### Installation & Dev Server
```bash
# Install dependencies
npm install

# Run Prisma migrations and generate client
npx prisma migrate dev --name init
npx prisma generate

# Start the dev server
npm run dev
```
App will be available at **http://localhost:3000**

### Seed Analytics Data (optional)
```bash
npm run seed
```
Populates sample `ProfileView` and `ClickEvent` records for a demo account using `seed-analytics.ts`.

### Automated QR Decode Verification Test
```bash
node scripts/test-upi-qr-decode.js
```
Runs the automated validation test generating dynamic UPI URIs, encoding to QR, and decoding with `jsQR` to verify exact intent payload accuracy.

### Database GUI (optional)
```bash
npx prisma studio
```

### Available Scripts
| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Starts Next.js dev server |
| Production build | `npm run build` | Creates optimised production bundle |
| Start production | `npm run start` | Starts production server |
| Lint | `npm run lint` | ESLint check |
| Seed analytics | `npm run seed` | Seeds sample analytics data via ts-node |
| QR verification test | `node scripts/test-upi-qr-decode.js` | Validates UPI URI generation and verifies QR matrix decoding via jsQR |
| Postinstall | `prisma generate` | Auto-runs after `npm install` |

### Deployment Notes
1. Ensure `DATABASE_URL` is a **PostgreSQL** connection string (provider in `schema.prisma` is already `postgresql`).
2. Run `npx prisma migrate deploy` in CI/CD.
3. Set `AUTH_SECRET` to a strong random value (`openssl rand -base64 33`).
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
5. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in production environment settings.
6. Deploy to **Vercel** (recommended for Next.js) or any Node.js host.
7. For geolocation analytics, Vercel and Cloudflare automatically inject `x-vercel-ip-country` / `cf-ipcountry` headers — no extra config needed.

---

*Documentation updated: September 2026 · Linkle v1.2.0*

