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

Users manage everything from a polished dashboard that features a live **mobile/desktop preview panel**, drag-and-drop reordering, per-link visibility toggles, and deep appearance customisation.

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
| OAuth providers (Google, GitHub, etc.) | 🔲 Planned |
| Email delivery for password reset | 🔲 Planned |

### 2.2 Public Profile Page (`/p/:username`)
| Feature | Status |
|---|---|
| Profile header (avatar, banner, display name, bio, username) | ✅ Done |
| Social links section with platform icons | ✅ Done |
| Business / custom link blocks | ✅ Done |
| Payment methods section (UPI, PayPal, Stripe, Crypto…) | ✅ Done |
| Location section with embedded Google Maps | ✅ Done |
| Contact actions section | ✅ Done |
| Animated gradient background (themed to user's primary color) | ✅ Done |
| "Powered by Linkle" footer badge | ✅ Done |
| Demo profile at `/p/demo` | ✅ Done |

### 2.3 Dashboard — Links Manager
| Feature | Status |
|---|---|
| Tabs: Social / Links / Payments / Tools | ✅ Done |
| Add, delete, toggle visibility per link | ✅ Done |
| Drag-and-drop reorder (persisted to DB via API) | ✅ Done |
| Per-link click counter (mock UI; real analytics planned) | ✅ Done |
| Pin a link as "Featured" | ✅ Done (UI) |
| QR code modal (downloadable) | ✅ Done |
| Email capture block (Tools tab) | ✅ Done (UI) |
| Scheduled links (set start/end dates) | 🔲 Coming Soon |
| Link edit in-place | 🔲 Planned |

### 2.4 Dashboard — Appearance
| Feature | Status |
|---|---|
| Profile info editing (display name, bio, avatar URL, banner URL) | ✅ Done |
| 8 colour theme presets (Indigo, Rose, Amber, Emerald, Sky, Fuchsia, Cyan, Minimal) | ✅ Done |
| Custom hex colour picker | ✅ Done |
| 4 button styles (Pill, Rounded, Square, Outline) | ✅ Done |
| 7 typography / font family options | ✅ Done |
| Location settings (address, Google Maps embed URL, visibility toggle) | ✅ Done |
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
| Monetization page (route exists) | 🔲 In Progress |
| Settings page (route exists) | 🔲 In Progress |
| Username settings | 🔲 Planned |

### 2.8 QR Code
| Feature | Status |
|---|---|
| Auto-generated QR for `/p/<username>` | ✅ Done |
| Download QR as PNG | ✅ Done |
| QR accessible from Links page and Tools tab | ✅ Done |

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
| Database | **SQLite** (dev) | — |
| Client | `@prisma/client` | ^5.22.0 |

> SQLite is used for development simplicity. For production, swap the `datasource` provider in `schema.prisma` to `postgresql` or `mysql` and update `DATABASE_URL`.

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

### Tooling
| Tool | Purpose |
|---|---|
| `eslint` + `eslint-config-next` | Linting |
| `postcss` + `autoprefixer` | CSS processing |
| `next dev` | Dev server (Turbopack) |

---

## 4. Architecture

```
d:\VibingSites\LINKLE\
├── prisma/
│   └── schema.prisma          # Database schema (SQLite, Prisma models)
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
│   │   ├── p/[username]/      # Public profile page (SSR)
│   │   ├── dashboard/         # Protected dashboard shell
│   │   │   ├── layout.tsx     # Auth guard + sidebar + preview panel
│   │   │   ├── page.tsx       # /dashboard → redirect to /dashboard/overview
│   │   │   ├── overview/      # Dashboard home
│   │   │   ├── appearance/    # Appearance settings
│   │   │   ├── analytics/     # Analytics view
│   │   │   ├── monetization/  # Monetization (planned)
│   │   │   └── settings/      # Settings (planned)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/  # NextAuth handler
│   │       │   ├── forgot-password/route.ts
│   │       │   └── reset-password/route.ts
│   │       ├── links/
│   │       │   ├── social/         # GET, POST, DELETE, PATCH toggle, POST reorder
│   │       │   ├── business/       # GET, POST, DELETE, PATCH toggle, POST reorder
│   │       │   └── payment/        # GET, POST, DELETE, PATCH toggle, POST reorder
│   │       └── user/
│   │           └── profile/        # PATCH user profile & appearance
│   ├── components/
│   │   ├── Providers.tsx           # SessionProvider wrapper
│   │   ├── dashboard/
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── LinksManager.tsx    # Social / Business / Payment / Tools tabs
│   │   │   ├── AppearanceForm.tsx  # Theme, fonts, profile, location
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── MobilePreview.tsx   # Live phone/desktop preview frame
│   │   │   ├── PreviewContext.tsx  # React Context for live preview state
│   │   │   └── QRCodeModal.tsx
│   │   ├── profile/
│   │   │   ├── ProfileContainer.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── SocialLinks.tsx
│   │   │   ├── BusinessSection.tsx
│   │   │   ├── PaymentSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── LocationSection.tsx
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

Linkle uses **Prisma** with **SQLite** (dev). All IDs are CUID strings. Timestamps are auto-managed.

### Models

#### `User`
The central model. Extends NextAuth's standard user with Linkle-specific profile and theme fields.

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

#### `PaymentLink`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User |
| `platform` | String | `upi`, `paytm`, `phonepe`, `googlepay`, `stripe`, `paypal`, `crypto` |
| `value` | String | UPI ID / payment link / wallet address |
| `isVisible` | Boolean | Default `true` |
| `order` | Int | Display order |

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
| `/p/[username]` | Server Component | No | Public user profile |
| `/dashboard` | Server Component | **Yes** | Redirects to `/dashboard/overview` |
| `/dashboard/overview` | Server Component | **Yes** | Dashboard home |
| `/dashboard` (root) | Client Component | **Yes** | Links Manager (default tab) |
| `/dashboard/appearance` | Client Component | **Yes** | Appearance & theme settings |
| `/dashboard/analytics` | Client Component | **Yes** | Analytics dashboard |
| `/dashboard/monetization` | — | **Yes** | Monetization (in progress) |
| `/dashboard/settings` | — | **Yes** | Settings (in progress) |

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
The reset link is currently **logged to the server console**. Email delivery is planned.

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
  "locationIsVisible": true
}
// Response 200 — updated user object
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
| `AppearanceForm.tsx` | Profile info, colour themes, button styles, typography, location |
| `AnalyticsDashboard.tsx` | Stats cards, bar chart, top links, device & country breakdown |
| `MobilePreview.tsx` | Live phone/desktop frame; renders real profile components |
| `PreviewContext.tsx` | React Context + provider that holds the live preview user state |
| `QRCodeModal.tsx` | Modal with `qrcode.react` QR for the user's profile URL + download |

### Profile Components (`src/components/profile/`)

These components are used both on the **public profile page** (`/p/[username]`) and inside the **live preview panel** in the dashboard.

| Component | Purpose |
|---|---|
| `ProfileContainer.tsx` | Wrapper that fetches and assembles the full public profile |
| `ProfileHeader.tsx` | Avatar, banner image, display name, username handle, bio |
| `SocialLinks.tsx` | Renders social platform icon buttons |
| `BusinessSection.tsx` | Renders titled link cards with optional description |
| `PaymentSection.tsx` | Renders payment method buttons (UPI, PayPal, Crypto etc.) |
| `ContactSection.tsx` | Renders contact action buttons (vCard, booking, resume) |
| `LocationSection.tsx` | Renders address text, Google Maps iframe, directions button |

### UI Components (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `ThemeToggle.tsx` | Light / dark mode toggle button |
| `avatar.tsx` | Reusable avatar component |

---

## 9. Authentication Flow

```
Registration
  POST /api/register (or /api/auth/register)
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
     → Log reset URL to console (email sending planned)
  3. User visits /reset-password?token=<token>
  4. POST /api/auth/reset-password
     → Validate token exists & not expired
     → bcrypt.hash(newPassword)
     → prisma.user.update({ password })
     → prisma.passwordResetToken.delete()
     → Redirect to /login
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
The core product is functional end-to-end:
- ✅ Auth (register, login, forgot/reset password)
- ✅ Public profiles with full theming
- ✅ Dashboard with live preview
- ✅ Links CRUD (social, business, payment) with DnD reorder
- ✅ Appearance customisation persisted to DB
- ✅ QR code generation and download
- ✅ Real-time analytics system (page views, link clicks, unique visitors, device & country breakdowns, dynamic 14-day daily charts)

### Immediate Next Steps
| Priority | Feature | Notes |
|---|---|---|
| 🔴 High | Email delivery for password reset | Integrate Resend / Nodemailer |
| 🔴 High | Username setup flow | Enforce unique username on register/settings |
| 🔴 High | Link edit functionality | In-place edit for existing links |
| 🟡 Medium | Monetization page | Subscription tiers, Stripe integration |
| 🟡 Medium | Settings page | Account settings, danger zone (delete account) |
| 🟡 Medium | OAuth providers | Google, GitHub sign-in |
| 🟢 Low | Scheduled links | Date-gated link visibility |
| 🟢 Low | Email capture backend | Store captured emails, CSV export |
| 🟢 Low | Featured links persistence | Persist star/featured state to DB |
| 🟢 Low | Production database | Migrate SQLite → PostgreSQL for deployment |
| 🟢 Low | Custom domain support | Map custom domains to `/p/<username>` |

### Implemented Feature: Real-Time Analytics System
The Linkle analytics engine replaces all static charts and mock records with real database events:
- **`ProfileView` & `ClickEvent`**: Tracks every mount on public `/p/[username]` paths and any outbound link tap.
- **Client-Side Event Bubbling**: Utilizes a centralized bubbling click-handler inside the root `ProfileContainer` that catches tracking attributes (`data-track-id`, `data-track-type`, etc.) dynamically without bloated per-component onClick properties.
- **Edge-Based Geolocation & Device Parsing**: Uses lightweight headers (`x-vercel-ip-country`, `cf-ipcountry`) and client user-agent parsing for instant geolocation and device breakdowns.
- **Prisma Aggregations**: Uses highly optimized relational aggregates (`groupBy`, `count`, `distinct`) to feed performance widgets, chronological 14-day tracking charts, top links lists, and visitor counts.

### Planned Feature: Email Delivery
Use **Resend** (or Nodemailer + SMTP) to send password-reset emails. Update `forgot-password/route.ts`:
```ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
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

### Environment Variables
Create a `.env` file in the project root:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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
| Postinstall | `prisma generate` | Auto-runs after `npm install` |

### Deployment Notes
1. Switch `DATABASE_URL` to a PostgreSQL connection string and update `schema.prisma` provider to `"postgresql"`.
2. Run `npx prisma migrate deploy` in CI/CD.
3. Set `NEXTAUTH_SECRET` to a strong random value (`openssl rand -base64 32`).
4. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
5. Deploy to **Vercel** (recommended for Next.js) or any Node.js host.

---

*Documentation generated: June 2026 · Linkle v1.0.0*
