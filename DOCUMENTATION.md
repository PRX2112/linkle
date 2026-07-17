# Linkle — Full Project Documentation

> **One Link. Endless Possibilities.**  
> A modern, feature-rich digital profile / link-in-bio platform built with Next.js 15, Prisma, and NextAuth v5.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
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
| Business / custom link blocks | ✅ Done |
| Payment methods section (UPI, PayPal, Stripe, Crypto…) | ✅ Done |
| Location section with embedded Google Maps | ✅ Done |
| Contact actions section | ✅ Done |
| Email capture / newsletter subscribe widget | ✅ Done |
| Scheduled link filtering (startDate / endDate enforced server-side) | ✅ Done |
| Dynamic Open Graph metadata per profile | ✅ Done |
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
| Email capture settings & subscriber list (Tools tab) | ✅ Done |
| Link edit in-place (LinkEditModal) | ✅ Done |
| Scheduled links (set start/end dates per link) | ✅ Done (schema + UI + server enforcement) |

### 2.4 Dashboard — Appearance
| Feature | Status |
|---|---|
| Profile info editing (display name, bio, avatar URL, banner URL) | ✅ Done |
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
│   │       ├── links/
│   │       │   ├── social/         # GET, POST, DELETE, PATCH toggle, PATCH edit, POST reorder
│   │       │   ├── business/       # GET, POST, DELETE, PATCH toggle, PATCH edit, POST reorder
│   │       │   └── payment/        # GET, POST, DELETE, PATCH toggle, PATCH edit, POST reorder
│   │       ├── subscribe/          # POST — email capture ✅
│   │       ├── analytics/          # GET aggregated stats, POST view, POST click
│   │       └── user/
│   │           ├── profile/        # PATCH user profile & appearance
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
│   │   │   ├── LinkEditModal.tsx   # In-place link editor with scheduling ✅
│   │   │   ├── SettingsForm.tsx    # Username change + account deletion ✅
│   │   │   └── StyledSelect.tsx    # Custom animated icon dropdown ✅
│   │   ├── profile/
│   │   │   ├── ProfileContainer.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── SocialLinks.tsx
│   │   │   ├── BusinessSection.tsx
│   │   │   ├── PaymentSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   ├── LocationSection.tsx
│   │   │   └── EmailCaptureSection.tsx  # Newsletter subscribe widget ✅
│   │   ├── qr/                     # QR code components
│   │   └── ui/
│   │       ├── ThemeToggle.tsx     # Light / dark mode toggle
│   │       └── avatar.tsx
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── types.ts                # Shared TypeScript types
│   │   └── utils.ts                # Utility helpers (cn, etc.)
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
Captures an email for a user's newsletter list. No authentication required — called from the public profile page.
```json
// Body
{ "username": "janedoe", "email": "visitor@example.com" }

// Response 201
{ "success": true, "subscription": { "id": "...", "email": "...", "createdAt": "..." } }

// Errors: 400 (duplicate email, invalid format), 404 (username not found), 500
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

## 8. Components

### Dashboard Components (`src/components/dashboard/`)

| Component | Purpose |
|---|---|
| `DashboardSidebar.tsx` | Persistent left nav with logo, user info, nav links, sign-out |
| `LinksManager.tsx` | Tabbed interface for Social / Business / Payment / Tools; DnD reorder |
| `AppearanceForm.tsx` | Profile info, colour themes, button styles, typography, location, email capture settings |
| `AnalyticsDashboard.tsx` | Stats cards, bar chart, top links, device & country breakdown |
| `MobilePreview.tsx` | Live phone/desktop frame; renders real profile components |
| `PreviewContext.tsx` | React Context + provider that holds the live preview user state |
| `QRCodeModal.tsx` | Modal with `qrcode.react` QR for the user's profile URL + download |
| `LinkEditModal.tsx` | Full-featured in-place link editor for social, business, and payment links; supports scheduled start/end dates |
| `SettingsForm.tsx` | Username & display name editor + danger zone account deletion with typed confirmation |
| `StyledSelect.tsx` | Custom animated dropdown with icon support; used in link modals and platform selectors |

### Profile Components (`src/components/profile/`)

These components are used both on the **public profile page** (`/p/[username]`) and inside the **live preview panel** in the dashboard.

| Component | Purpose |
|---|---|
| `ProfileContainer.tsx` | Wrapper that assembles the full public profile; centralised analytics event bubbling via data attributes |
| `ProfileHeader.tsx` | Avatar, banner image, display name, username handle, bio |
| `SocialLinks.tsx` | Renders social platform icon buttons |
| `BusinessSection.tsx` | Renders titled link cards with optional description |
| `PaymentSection.tsx` | Renders payment method buttons (UPI, PayPal, Crypto etc.) |
| `ContactSection.tsx` | Renders contact action buttons (vCard, booking, resume) |
| `LocationSection.tsx` | Renders address text, Google Maps iframe, directions button |
| `EmailCaptureSection.tsx` | Animated newsletter subscribe widget; calls `POST /api/subscribe`; adapts border-radius to user's `buttonStyle` |

### UI Components (`src/components/ui/`)

| Component | Purpose |
|---|---|
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
- ✅ In-place link editing with scheduled dates (LinkEditModal)
- ✅ Featured link pinning
- ✅ Appearance customisation persisted to DB (incl. email capture settings)
- ✅ QR code generation and download
- ✅ Real-time analytics system (page views, link clicks, unique visitors, device & country breakdowns, dynamic 14-day daily charts)
- ✅ Email capture / newsletter subscription widget with backend deduplication
- ✅ Monetization pricing page (3-tier: Starter / Pro / Enterprise, monthly/yearly toggle)
- ✅ Settings page (username change with uniqueness validation + account deletion with confirmation)

### Feature Notes

#### Real-Time Analytics System
- **`ProfileView` & `ClickEvent`**: Tracks every mount on public `/p/[username]` paths and any outbound link tap.
- **Client-Side Event Bubbling**: A centralized click-handler in `ProfileContainer` catches tracking attributes (`data-track-id`, `data-track-type`, etc.) without bloated per-component `onClick` props.
- **Edge-Based Geolocation & Device Parsing**: Uses `x-vercel-ip-country` / `cf-ipcountry` headers and client user-agent parsing.
- **Prisma Aggregations**: `groupBy`, `count`, `distinct` for all dashboard widgets.

#### Email Capture System
- Toggle enabled in Appearance dashboard; title/placeholder are customisable.
- `EmailCaptureSection` on public profile adapts border-radius to the user's `buttonStyle`.
- `POST /api/subscribe` validates email format and deduplicates per user.

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
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/linkle"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email (optional — for password reset delivery)
SMTP_HOST="smtp.example.com"
SMTP_USER="no-reply@example.com"
SMTP_PASS="your-smtp-password"
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
| Postinstall | `prisma generate` | Auto-runs after `npm install` |

### Deployment Notes
1. Ensure `DATABASE_URL` is a **PostgreSQL** connection string (provider in `schema.prisma` is already `postgresql`).
2. Run `npx prisma migrate deploy` in CI/CD.
3. Set `NEXTAUTH_SECRET` to a strong random value (`openssl rand -base64 32`).
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
5. Deploy to **Vercel** (recommended for Next.js) or any Node.js host.
6. For geolocation analytics, Vercel and Cloudflare automatically inject `x-vercel-ip-country` / `cf-ipcountry` headers — no extra config needed.

---

*Documentation updated: July 2026 · Linkle v1.1.0*
