# 🔗 LINKLE — Complete Project Plan & Feature Documentation

> **One Link. Endless Possibilities.**
> A full-stack digital profile / link-in-bio platform — more powerful than Linktree.
> Built with Next.js 15, Prisma ORM, PostgreSQL, NextAuth v5, Tailwind CSS, Framer Motion, and @dnd-kit.

---

## Table of Contents

1. [Project Vision & Goal](#1-project-vision--goal)
2. [Tech Stack (Full Detail)](#2-tech-stack-full-detail)
3. [File & Folder Architecture](#3-file--folder-architecture)
4. [Database Schema (All Models)](#4-database-schema-all-models)
5. [Authentication System](#5-authentication-system)
6. [Public Profile Page — `/p/:username`](#6-public-profile-page--pusername)
7. [Dashboard — Overview Page](#7-dashboard--overview-page)
8. [Dashboard — Links Manager](#8-dashboard--links-manager)
9. [Dashboard — Appearance & Theming](#9-dashboard--appearance--theming)
10. [Dashboard — Analytics Engine](#10-dashboard--analytics-engine)
11. [Dashboard — Settings Page](#11-dashboard--settings-page)
12. [Dashboard — Monetization (Planned)](#12-dashboard--monetization-planned)
13. [Live Preview Panel](#13-live-preview-panel)
14. [QR Code System](#14-qr-code-system)
15. [Email Capture System](#15-email-capture-system)
16. [API Reference (Every Endpoint)](#16-api-reference-every-endpoint)
17. [Component Reference (Every Component)](#17-component-reference-every-component)
18. [Data Flow Diagrams](#18-data-flow-diagrams)
19. [Theming & Appearance System](#19-theming--appearance-system)
20. [Scheduled Links System](#20-scheduled-links-system)
21. [Environment Variables & Project Setup](#21-environment-variables--project-setup)
22. [Current Status & Feature Checklist](#22-current-status--feature-checklist)
23. [Roadmap & Planned Features](#23-roadmap--planned-features)
24. [Deployment Guide](#24-deployment-guide)

---

## 1. Project Vision & Goal

**Linkle** is a digital profile aggregator — a "link-in-bio" tool that is significantly more powerful than Linktree. Every registered user gets a beautiful, fully customizable public page at `/p/<username>`.

### What a Linkle Profile Contains
- **Social media links** — Instagram, Twitter/X, LinkedIn, YouTube, GitHub, WhatsApp, Email, Phone, Website
- **Business/custom link blocks** — Cards with title, URL, optional description and thumbnail
- **Payment collection methods** — UPI, Paytm, PhonePe, Google Pay, PayPal, Stripe, Crypto wallet
- **Contact actions** — vCard download, appointment booking, resume download, custom form
- **Physical location** — address text + embedded Google Maps iframe + Directions button
- **Email newsletter capture** — embedded subscribe widget directly on the public profile
- **QR code** — auto-generated, downloadable QR pointing to the user's public profile URL

### Dashboard Capabilities
- Full CRUD on all link types with drag-and-drop reorder
- Live mobile/desktop preview panel (updates in real time)
- Deep appearance customization: color themes, button styles, typography, banner/avatar
- Real-time analytics (page views, link clicks, unique visitors, device breakdown, country breakdown, 14-day chart)
- Account settings (username, display name, danger zone / delete account)
- Scheduled visibility windows for any link (start date / end date)

---

## 2. Tech Stack (Full Detail)

### Core Framework
| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | **Next.js** | ^15.1.7 | App Router, RSC + Client Components, Turbopack dev |
| Language | **TypeScript** | ^5.9.3 | Strict mode |
| Runtime | **React** | ^19.0.0 | Latest stable |
| Rendering | App Router | — | Mix of Server Components and Client Components |

### Database & ORM
| Layer | Technology | Version | Notes |
|---|---|---|---|
| ORM | **Prisma** | ^5.22.0 | Schema-first, migrations |
| Database | **PostgreSQL** | (production) | Schema provider set to `postgresql` |
| Dev DB | SQLite (optional) | — | Change provider in schema.prisma |
| Client | `@prisma/client` | ^5.22.0 | Auto-generated via postinstall |

### Authentication
| Layer | Technology | Version | Notes |
|---|---|---|---|
| Auth library | **NextAuth.js v5** | ^5.0.0-beta.30 | Beta (stable API) |
| Prisma adapter | `@auth/prisma-adapter` | ^2.11.1 | Links NextAuth models to Prisma |
| Password hashing | **bcryptjs** | ^3.0.3 | 10 salt rounds |
| Session strategy | JWT | — | User ID + username in JWT |

### UI & Styling
| Layer | Technology | Version | Notes |
|---|---|---|---|
| CSS framework | **Tailwind CSS** | ^3.4.17 | With PostCSS + autoprefixer |
| Icons | **lucide-react** | ^0.562.0 | Tree-shakeable SVG icons |
| Animations | **Framer Motion** | ^12.37.0 | Page transitions, modal animations |
| Drag & Drop | **@dnd-kit** (core + sortable + utilities) | ^6/10/3 | Link reordering |
| QR codes | **qrcode.react** | ^4.2.0 | QR generation in browser |
| Utilities | `clsx`, `tailwind-merge` | latest | Conditional className merging |

### Email
| Layer | Technology | Notes |
|---|---|---|
| Email library | **nodemailer** | ^7.0.13 — installed, wired for future use |
| Email service | Resend / SMTP | Planned — currently reset links logged to console |

### Tooling
| Tool | Purpose |
|---|---|
| ESLint + eslint-config-next | Linting |
| PostCSS + autoprefixer | CSS processing |
| ts-node | TypeScript seeding scripts |
| Prisma Studio | Visual DB browser (`npx prisma studio`) |

---

## 3. File & Folder Architecture

```
d:\VibingSites\LINKLE\
├── .env                            # Secret env vars (DATABASE_URL, NEXTAUTH_SECRET, etc.)
├── .env.example                    # Template for env vars
├── .gitignore
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind theme config
├── postcss.config.js
├── tsconfig.json
├── package.json
├── seed-analytics.ts               # Script to seed analytics data for dev
│
├── prisma/
│   ├── schema.prisma               # ALL database models (single source of truth)
│   └── dev.db                      # SQLite dev database (if used)
│
└── src/
    ├── auth.ts                     # NextAuth configuration (Credentials provider, JWT callbacks)
    │
    ├── app/                        # Next.js App Router pages & API routes
    │   ├── layout.tsx              # Root layout (Providers wrapper, Google Fonts)
    │   ├── globals.css             # Global CSS variables, animations, utility classes
    │   ├── page.tsx                # Landing / marketing page (/)
    │   │
    │   ├── login/
    │   │   └── page.tsx            # Email + password login form
    │   ├── register/
    │   │   └── page.tsx            # New account registration form
    │   ├── forgot-password/
    │   │   └── page.tsx            # Request password reset (email input)
    │   ├── reset-password/
    │   │   └── page.tsx            # Set new password (?token=<token>)
    │   │
    │   ├── p/
    │   │   └── [username]/
    │   │       └── page.tsx        # Public profile page (SSR, /p/:username)
    │   │
    │   ├── dashboard/              # Protected dashboard shell
    │   │   ├── layout.tsx          # Auth guard + DashboardSidebar + MobilePreview panel
    │   │   ├── page.tsx            # /dashboard root → LinksManager (default tab)
    │   │   ├── overview/
    │   │   │   └── page.tsx        # Dashboard home with quick stats
    │   │   ├── appearance/
    │   │   │   └── page.tsx        # Appearance & theme settings
    │   │   ├── analytics/
    │   │   │   └── page.tsx        # Analytics dashboard
    │   │   ├── monetization/
    │   │   │   └── page.tsx        # Monetization (in progress)
    │   │   └── settings/
    │   │       └── page.tsx        # Account settings
    │   │
    │   └── api/                    # API routes (all server-side)
    │       ├── auth/
    │       │   ├── [...nextauth]/route.ts      # NextAuth handler (GET + POST)
    │       │   ├── forgot-password/route.ts    # POST — generate reset token
    │       │   └── reset-password/route.ts     # POST — consume token, update password
    │       ├── register/
    │       │   └── route.ts                    # POST — create new user account
    │       ├── subscribe/
    │       │   └── route.ts                    # POST — capture visitor email
    │       ├── links/
    │       │   ├── social/
    │       │   │   ├── route.ts                # GET, POST
    │       │   │   ├── [id]/route.ts           # DELETE, PATCH (edit)
    │       │   │   ├── [id]/toggle/route.ts    # PATCH — toggle isVisible
    │       │   │   └── reorder/route.ts        # POST — persist drag-drop order
    │       │   ├── business/
    │       │   │   ├── route.ts                # GET, POST
    │       │   │   ├── [id]/route.ts           # DELETE, PATCH (edit)
    │       │   │   ├── [id]/toggle/route.ts    # PATCH — toggle isVisible
    │       │   │   └── reorder/route.ts        # POST — persist drag-drop order
    │       │   └── payment/
    │       │       ├── route.ts                # GET, POST
    │       │       ├── [id]/route.ts           # DELETE, PATCH (edit)
    │       │       ├── [id]/toggle/route.ts    # PATCH — toggle isVisible
    │       │       └── reorder/route.ts        # POST — persist drag-drop order
    │       ├── user/
    │       │   ├── profile/route.ts            # PATCH — update profile + appearance
    │       │   └── settings/route.ts           # PATCH (username/displayName), DELETE (account)
    │       └── analytics/
    │           ├── route.ts                    # GET — aggregated analytics for dashboard
    │           ├── view/route.ts               # POST — log a profile page view
    │           └── click/route.ts              # POST — log a link click event
    │
    ├── components/
    │   ├── Providers.tsx                       # SessionProvider wrapper (client boundary)
    │   │
    │   ├── dashboard/
    │   │   ├── DashboardSidebar.tsx            # Left nav (logo, user info, nav links, sign-out)
    │   │   ├── LinksManager.tsx                # Tabbed links CRUD (Social/Links/Payments/Tools)
    │   │   ├── AppearanceForm.tsx              # Theme, fonts, profile info, location settings
    │   │   ├── AnalyticsDashboard.tsx          # Stats cards, bar chart, top links, device/country
    │   │   ├── MobilePreview.tsx               # Live phone/desktop preview frame
    │   │   ├── PreviewContext.tsx              # React Context for live preview state
    │   │   ├── QRCodeModal.tsx                 # QR code modal with download
    │   │   ├── LinkEditModal.tsx               # Modal to edit any link (social/business/payment)
    │   │   ├── SettingsForm.tsx                # Username, display name, danger zone
    │   │   └── StyledSelect.tsx                # Reusable styled <select> component
    │   │
    │   ├── profile/                            # Used on public profile AND in live preview
    │   │   ├── ProfileContainer.tsx            # Root wrapper: fetches data, applies theme, tracks views
    │   │   ├── ProfileHeader.tsx               # Avatar, banner, display name, username handle, bio
    │   │   ├── SocialLinks.tsx                 # Social platform icon buttons row
    │   │   ├── BusinessSection.tsx             # Titled link cards with optional description
    │   │   ├── PaymentSection.tsx              # Payment method buttons (UPI, PayPal, Crypto etc.)
    │   │   ├── ContactSection.tsx              # Contact action buttons (vCard, booking, resume)
    │   │   ├── LocationSection.tsx             # Address text, Google Maps iframe, directions button
    │   │   └── EmailCaptureSection.tsx         # Subscriber email capture widget
    │   │
    │   ├── qr/                                 # QR-specific components (shared)
    │   └── ui/
    │       ├── ThemeToggle.tsx                 # Light/dark mode toggle
    │       └── avatar.tsx                      # Reusable avatar component
    │
    ├── lib/
    │   ├── db.ts                               # Prisma client singleton (prevents hot-reload leaks)
    │   ├── types.ts                            # Shared TypeScript types (UserTheme, ProfileUser, etc.)
    │   └── utils.ts                            # Utility helpers (cn() for className merging)
    │
    ├── data/                                   # Static data / seed content
    └── types/
        └── next-auth.d.ts                      # Module augmentation to add `username`, `id` to session
```

---

## 4. Database Schema (All Models)

Linkle uses **Prisma** with **PostgreSQL** (production). All primary keys are CUID strings. All timestamps auto-managed.

### `User` — Central Profile Model
| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | String (CUID) | auto | Primary key |
| `name` | String? | — | From auth provider |
| `email` | String? unique | — | Login email |
| `emailVerified` | DateTime? | — | OAuth email verification |
| `image` | String? | — | OAuth profile image |
| `password` | String? | — | bcrypt hash (credentials auth only) |
| `username` | String? unique | — | Public profile slug `/p/<username>` |
| `displayName` | String? | — | Shown on public profile header |
| `bio` | String? | — | Short bio / tagline |
| `avatarUrl` | String? | — | Custom avatar image URL |
| `bannerUrl` | String? | — | Profile banner/cover image URL |
| `emailCaptureEnabled` | Boolean | false | Toggle email capture widget on profile |
| `emailCaptureTitle` | String | "Subscribe to my newsletter" | Widget headline text |
| `emailCapturePlaceholder` | String | "Enter your email" | Input placeholder text |
| `themePrimaryColor` | String | "#6366f1" | User's chosen accent color (hex) |
| `themeBackgroundColor` | String | "var(--background)" | Background color |
| `themeFontFamily` | String | "Inter" | Font applied to public profile |
| `themeButtonStyle` | String | "pill" | `pill` / `rounded` / `square` / `outline` |
| `locationAddress` | String? | — | Physical address display text |
| `locationGoogleMapsEmbedUrl` | String? | — | Full Google Maps iframe embed URL |
| `locationShowDirectionsBtn` | Boolean | true | Show "Get Directions" button |
| `locationIsVisible` | Boolean | true | Show/hide entire location section |
| `createdAt` | DateTime | now() | Auto |
| `updatedAt` | DateTime | auto | Auto |

**Relations:** `accounts`, `sessions`, `socialLinks`, `businessLinks`, `paymentLinks`, `contactActions`, `profileViews`, `clickEvents`, `capturedEmails`

---

### `SocialLink`
| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | String (CUID) | auto | |
| `userId` | String | — | FK → User (cascade delete) |
| `platform` | String | — | `instagram` / `twitter` / `linkedin` / `youtube` / `github` / `email` / `phone` / `whatsapp` / `website` |
| `url` | String | — | Full profile URL (e.g. `https://instagram.com/handle`) |
| `label` | String? | — | Optional custom label override |
| `isVisible` | Boolean | true | Toggle link display on public profile |
| `order` | Int | 0 | Display order (lower = first) |
| `startDate` | DateTime? | — | Scheduled visibility start |
| `endDate` | DateTime? | — | Scheduled visibility end |
| `featured` | Boolean | false | Pin as featured link |

---

### `BusinessLink`
| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | String (CUID) | auto | |
| `userId` | String | — | FK → User (cascade delete) |
| `title` | String | — | Display card title |
| `url` | String | — | Destination URL |
| `description` | String? | — | Short description shown below title |
| `thumbnailUrl` | String? | — | Optional cover/thumbnail image URL |
| `isVisible` | Boolean | true | |
| `order` | Int | 0 | |
| `startDate` | DateTime? | — | Scheduled visibility start |
| `endDate` | DateTime? | — | Scheduled visibility end |
| `featured` | Boolean | false | |

---

### `PaymentLink`
| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | String (CUID) | auto | |
| `userId` | String | — | FK → User (cascade delete) |
| `platform` | String | — | `upi` / `paytm` / `phonepe` / `googlepay` / `paypal` / `stripe` / `crypto` |
| `value` | String | — | UPI ID / PayPal username / Stripe link / wallet address |
| `isVisible` | Boolean | true | |
| `order` | Int | 0 | |
| `startDate` | DateTime? | — | |
| `endDate` | DateTime? | — | |
| `featured` | Boolean | false | |

---

### `ContactAction`
| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | String (CUID) | auto | |
| `userId` | String | — | FK → User (cascade delete) |
| `type` | String | — | `vcard` / `book_appointment` / `download_resume` / `custom_form` |
| `label` | String | — | Button label text |
| `url` | String | — | Target URL (vCard file, booking page, resume PDF, etc.) |
| `isVisible` | Boolean | true | |
| `order` | Int | 0 | |
| `startDate` | DateTime? | — | |
| `endDate` | DateTime? | — | |
| `featured` | Boolean | false | |

---

### `PasswordResetToken`
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `email` | String | User's email |
| `token` | String unique | 32-byte random hex string |
| `expires` | DateTime | 1 hour from creation |

Unique constraint on `[email, token]`.

---

### `ProfileView` — Analytics Event
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User (cascade delete) |
| `visitorId` | String? | UUID stored in visitor's localStorage (`linkle_visitor_id`) for unique visitor deduplication |
| `referrer` | String? | Traffic source parsed from `document.referrer` (Direct, Twitter, Google, etc.) |
| `device` | String? | `Mobile` / `Desktop` / `Tablet` / `Other` — parsed from User-Agent header |
| `country` | String? | Country code from `x-vercel-ip-country` or `cf-ipcountry` edge headers |
| `createdAt` | DateTime | auto |

Indexes: `userId`, `createdAt`

---

### `ClickEvent` — Analytics Event
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User (cascade delete) |
| `linkId` | String | ID of the clicked link |
| `linkType` | String | `social` / `business` / `payment` / `contact` |
| `linkTitle` | String | Label/title of the link (for display in analytics) |
| `url` | String | Destination URL |
| `referrer` | String? | Traffic source |
| `device` | String? | Mobile / Desktop / Tablet / Other |
| `country` | String? | Country code |
| `createdAt` | DateTime | auto |

Indexes: `userId`, `createdAt`

---

### `CapturedEmail` — Newsletter Subscribers
| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | |
| `userId` | String | FK → User (the profile owner who captured the email) |
| `email` | String | The subscriber's email address (trimmed + lowercased) |
| `createdAt` | DateTime | auto |

Indexes: `userId`, `createdAt`. Deduplication: checked per `userId` + `email` combination before insert.

---

### NextAuth Standard Models
`Account`, `Session`, `VerificationToken` — standard NextAuth/Prisma adapter models (do not modify directly).

---

## 5. Authentication System

### Registration Flow
```
User fills /register form
  → POST /api/register
    → Check email uniqueness (prisma.user.findUnique)
    → bcrypt.hash(password, 10)
    → Generate default username from email prefix
    → prisma.user.create({ email, password: hash, username })
    → Redirect to /login
```

### Login Flow
```
User fills /login form
  → Client: signIn("credentials", { email, password })
    → NextAuth CredentialsProvider.authorize()
      → prisma.user.findUnique({ where: { email } })
      → bcrypt.compare(inputPassword, user.password)
      → Return { id, email, name, image, username }
    → JWT signed: { id, username }
    → Session cookie set
    → Redirect to /dashboard
```

### Session Access
```typescript
// Server Component:
const session = await auth();
session.user.id        // database user ID
session.user.username  // public profile username slug

// Client Component:
const { data: session } = useSession();
```

### Password Reset Flow
```
1. User submits email at /forgot-password
   → POST /api/auth/forgot-password
     → Generate crypto.randomBytes(32).toString('hex') token
     → Store in PasswordResetToken (expires = now + 1 hour)
     → Currently: log reset URL to server console
     → Planned: send email via Resend/Nodemailer

2. User visits /reset-password?token=<token>
   → POST /api/auth/reset-password
     → Find token: prisma.passwordResetToken.findUnique
     → Validate not expired (token.expires > new Date())
     → bcrypt.hash(newPassword, 10)
     → prisma.user.update({ password: hash })
     → prisma.passwordResetToken.delete()
     → Redirect to /login
```

### Protected Routes
All `/dashboard/*` routes are protected at the layout level:
```typescript
// src/app/dashboard/layout.tsx
const session = await auth();
if (!session?.user?.id) redirect("/login");
```

---

## 6. Public Profile Page — `/p/:username`

**Route:** `src/app/p/[username]/page.tsx` — Server Component (SSR)

### Data Fetching
The page fetches the user and ALL their profile data in a single Prisma query:
- User fields (displayName, bio, avatarUrl, bannerUrl, theme fields, location fields, emailCapture fields)
- `socialLinks` (filtered: `isVisible: true`, ordered by `order`)
- `businessLinks` (filtered: `isVisible: true`, ordered by `order`)
- `paymentLinks` (filtered: `isVisible: true`, ordered by `order`)
- `contactActions` (filtered: `isVisible: true`, ordered by `order`)

**Scheduled link filtering:** Only links with `startDate <= now` AND `endDate >= now` (or null dates) are shown.

### `ProfileContainer.tsx`
The root wrapper component that:
1. Applies the user's theme CSS variable: `style={{ "--user-primary": themePrimaryColor }}`
2. Applies the user's `themeFontFamily` via inline Google Fonts `<style>`
3. Renders animated gradient background blobs (uses `--user-primary`)
4. On mount (client-side), fires `POST /api/analytics/view` with `username`, `referrer`, `visitorId`
5. Renders a centralized click tracker — catches `data-track-id`, `data-track-type`, `data-track-title`, `data-track-url` attributes via event bubbling

### Sections Rendered (in order)
1. **ProfileHeader** — avatar, banner, display name, `@username` handle, bio
2. **SocialLinks** — icon button row for each visible social link
3. **BusinessSection** — card list for each visible business/custom link
4. **PaymentSection** — payment method buttons
5. **ContactSection** — contact action buttons (vCard, booking, resume)
6. **EmailCaptureSection** — newsletter subscribe widget (if `emailCaptureEnabled`)
7. **LocationSection** — address + Google Maps embed + directions button (if `locationIsVisible`)
8. **"Powered by Linkle" footer badge**

### SEO
- `generateMetadata()` function generates `title`, `description` based on user's `displayName` and `bio`
- Open Graph tags for social sharing

### Special Route
- `/p/demo` — a hardcoded demo profile showing all features to unauthenticated visitors

---

## 7. Dashboard — Overview Page

**Route:** `/dashboard/overview` — Server Component

### What it Shows
1. **Welcome banner** — "Welcome back, [displayName] 👋"
2. **Quick Stats** (3 cards, real data from DB):
   - Total Links (count of social + business + payment links)
   - Total Clicks (count of ClickEvent records for this user)
   - Profile Views (count of ProfileView records for this user)
3. **Quick Actions** (navigation shortcuts):
   - Manage my links → `/dashboard`
   - Customize Appearance → `/dashboard/appearance`
   - View Analytics → `/dashboard/analytics`
   - View Public Profile → `/p/<username>` (opens in new tab)

---

## 8. Dashboard — Links Manager

**Route:** `/dashboard` (root) — Client Component
**Component:** `src/components/dashboard/LinksManager.tsx`

The most complex dashboard component — tabbed interface for managing all link types.

### Tabs
1. **Social** — Social media platform links
2. **Links** — Business/custom link cards
3. **Payments** — Payment method links
4. **Tools** — Email capture widget settings

---

### Tab 1: Social Links

#### Add Form
- Platform selector: `instagram`, `twitter`, `linkedin`, `youtube`, `github`, `email`, `phone`, `whatsapp`, `website`
- Each platform has a known URL prefix (e.g., `https://instagram.com/`)
- User enters handle only — the full URL is constructed on submit
- Optional custom label field

#### Link Card (per social link)
- Platform icon + platform name
- Full URL displayed
- Optional label shown
- **Visibility toggle** (eye icon) — fires `PATCH /api/links/social/[id]/toggle`
- **Edit button** — opens `LinkEditModal`
- **Delete button** (trash icon) — fires `DELETE /api/links/social/[id]`
- **Drag handle** (grip icon) — enables drag-and-drop reorder

#### Drag-and-Drop Reorder
- Powered by `@dnd-kit` (DndContext + SortableContext + useSortable)
- On drag end → `POST /api/links/social/reorder` with updated order array
- Optimistic UI: order updates instantly before API response

---

### Tab 2: Business/Custom Links

#### Add Form
- Title (required)
- URL (required)
- Description (optional)
- Thumbnail URL (optional)

#### Link Card (per business link)
- Title + optional description text
- URL displayed
- Thumbnail preview (if set)
- Visibility toggle, Edit, Delete, Drag handle (same pattern as Social)

---

### Tab 3: Payment Links

#### Add Form
- Platform selector: `upi`, `paytm`, `phonepe`, `googlepay`, `paypal`, `stripe`, `crypto`
- Payment value / handle (platform-specific placeholder)

#### Link Card (per payment link)
- Platform icon + platform name
- Masked/displayed payment handle
- Visibility toggle, Edit, Delete, Drag handle

---

### Tab 4: Tools — Email Capture

- Toggle switch: **Enable Email Capture Widget** (saves to `emailCaptureEnabled`)
- Custom title field (default: "Subscribe to my newsletter")
- Custom placeholder text field (default: "Enter your email")
- Preview of the widget rendered inline
- Saves via `PATCH /api/user/profile`

#### Viewing Subscribers
- Table showing captured emails for this user's profile (pulled from `CapturedEmail` model)
- Display: email address + date subscribed
- Future: CSV export button

---

### `LinkEditModal.tsx`
A full-screen modal (backdrop blur) for editing any link type:
- **Social:** Change platform, handle, label, schedule dates
- **Business:** Change title, URL, description, schedule dates
- **Payment:** Change platform, handle/value, schedule dates
- **Scheduling section** (all link types): Start Date & Time + End Date & Time (`datetime-local` inputs)
- Saves via `PATCH /api/links/[type]/[id]`

### QR Code Access
- QR Code button in Links Manager header → opens `QRCodeModal`

---

## 9. Dashboard — Appearance & Theming

**Route:** `/dashboard/appearance` — Client Component
**Component:** `src/components/dashboard/AppearanceForm.tsx`

All changes are saved together via `PATCH /api/user/profile`. The live preview panel updates in real time via `PreviewContext`.

### Section 1: Profile Info
| Field | Type | Notes |
|---|---|---|
| Display Name | Text input | Shown on profile header |
| Bio | Textarea | Short bio/tagline |
| Avatar URL | Text input | Profile photo URL |
| Banner URL | Text input | Cover/header banner image URL |

### Section 2: Color Theme

#### 8 Built-in Presets
| Name | Primary Hex | Gradient |
|---|---|---|
| Indigo (default) | `#6366f1` | indigo-500 → purple-600 |
| Rose | `#f43f5e` | rose-500 → pink-600 |
| Amber | `#f59e0b` | amber-400 → orange-500 |
| Emerald | `#10b981` | emerald-400 → teal-500 |
| Sky | `#0ea5e9` | sky-400 → blue-500 |
| Fuchsia | `#d946ef` | fuchsia-500 → pink-500 |
| Cyan | `#06b6d4` | cyan-400 → sky-500 |
| Minimal | `#737373` | neutral-500 → stone-600 |

#### Custom Color Picker
- `<input type="color">` for any hex value
- Updates primary color in real time

### Section 3: Button Style
4 options rendered as visual previews:
| Style | CSS | Look |
|---|---|---|
| `pill` | `rounded-full` | Fully rounded pill shape |
| `rounded` | `rounded-xl` | Softly rounded corners |
| `square` | `rounded-none` | Sharp rectangular corners |
| `outline` | `rounded-xl` + border | Border only, no fill |

### Section 4: Typography / Font Family
7 options (all from Google Fonts):
- Inter (default)
- Poppins
- DM Sans
- Space Grotesk
- Syne
- Playfair Display
- Roboto Mono

### Section 5: Location Settings
| Field | Type | Notes |
|---|---|---|
| Address Text | Text input | Shown above the map |
| Google Maps Embed URL | Text input | Full `https://www.google.com/maps/embed?...` URL |
| Show Directions Button | Toggle | Shows/hides "Get Directions" link |
| Show Location Section | Toggle | Hides entire LocationSection on public profile |

### Section 6: Email Capture Settings (in AppearanceForm)
| Field | Type | Notes |
|---|---|---|
| Enable Widget | Toggle | `emailCaptureEnabled` boolean |
| Widget Title | Text input | `emailCaptureTitle` |
| Input Placeholder | Text input | `emailCapturePlaceholder` |

---

## 10. Dashboard — Analytics Engine

**Route:** `/dashboard/analytics` — Client Component
**Component:** `src/components/dashboard/AnalyticsDashboard.tsx`
**API:** `GET /api/analytics`

### How Analytics Data is Collected

#### Profile Views (`POST /api/analytics/view`)
Triggered on every mount of `ProfileContainer` (public `/p/:username` page):
```json
{
  "username": "jane",
  "referrer": "https://twitter.com/...",   // from document.referrer
  "visitorId": "vis_d83js8djs9"            // from localStorage "linkle_visitor_id"
}
```
- `visitorId` generated with `crypto.randomUUID()` and persisted in localStorage for unique visitor tracking
- Device category: parsed from `req.headers['user-agent']` on the server
- Country: parsed from `x-vercel-ip-country` or `cf-ipcountry` edge headers

#### Link Clicks (`POST /api/analytics/click`)
Triggered via the centralized event bubbler in `ProfileContainer`:
```json
{
  "userId": "usr_...",
  "linkId": "lnk_...",
  "linkType": "social",       // social / business / payment / contact
  "linkTitle": "Instagram",
  "url": "https://instagram.com/jane",
  "referrer": "Direct"
}
```
Links on the public profile have `data-track-id`, `data-track-type`, `data-track-title`, `data-track-url` HTML attributes. The ProfileContainer catches clicks via event bubbling (one listener, no per-link overhead).

### Analytics Dashboard Widgets

#### Stat Cards (4 cards)
| Metric | Source | Aggregation |
|---|---|---|
| Total Clicks | `ClickEvent` | `count()` filtered by `userId` |
| Unique Visitors | `ProfileView` | `count(DISTINCT visitorId)` |
| Profile Views | `ProfileView` | `count()` filtered by `userId` |
| Countries Connected | `ProfileView` | `count(DISTINCT country)` |

#### Daily Performance Chart (14-day bar chart)
- X-axis: last 14 days (date labels)
- Y-axis: clicks + views per day
- Source: `ClickEvent.groupBy('createdAt')` + `ProfileView.groupBy('createdAt')`
- Rendered as styled SVG bars (custom, no external chart library)

#### Top Links Ranking
- Shows top-clicked links with name, click count, and percentage bar
- Source: `ClickEvent.groupBy('linkId')` ordered by `_count.linkId DESC` (limit 5)

#### Device Breakdown
| Device | Detection Method |
|---|---|
| Mobile | User-Agent contains `mobile` (case-insensitive) |
| Tablet | User-Agent contains `tablet` (case-insensitive) |
| Desktop | Everything else |

- Displayed as percentage bars

#### Country Breakdown
- Country codes from edge geolocation headers mapped to country names
- Displayed as ranked list with percentages

---

## 11. Dashboard — Settings Page

**Route:** `/dashboard/settings` — Server Component (fetches user) + Client Component
**Component:** `src/components/dashboard/SettingsForm.tsx`

### Section 1: Profile Username
- Input: `linkle.me/p/` + `[username input]`
- Validation: lowercase letters, numbers, hyphens, underscores (3-20 chars)
- Saves via `PATCH /api/user/settings` → `{ username: "..." }`
- API checks uniqueness before saving

### Section 2: Display Name
- Text input (no restrictions)
- Saves via same `PATCH /api/user/settings` → `{ displayName: "..." }`

### Section 3: Account Info (read-only display)
- Account email
- Join date

### Section 4: Danger Zone — Delete Account
Two-step confirmation:
1. Click "Delete Account" → shows confirmation panel
2. User must type `delete my account` (exact string, case-insensitive)
3. Click "Permanently Delete" → `DELETE /api/user/settings`
   - Deletes all cascade-related data (links, analytics, emails, sessions)
   - Signs user out via `signOut({ callbackUrl: "/" })`
   - Redirects to home page

---

## 12. Dashboard — Monetization (Planned)

**Route:** `/dashboard/monetization` — In Progress

### Planned Features
- Subscription tier display (Free / Pro / Business)
- Stripe integration for plan upgrades
- Feature gating based on plan:
  - Free: Limited links count, no custom domain
  - Pro: Unlimited links, analytics, email capture
  - Business: Custom domain, white-label, priority support

---

## 13. Live Preview Panel

**Component:** `src/components/dashboard/MobilePreview.tsx`
**Context:** `src/components/dashboard/PreviewContext.tsx`

### Architecture
The `PreviewContext` is a React Context that holds a `previewUser` state object — a mirror of the user's profile data that updates instantly as they edit in `AppearanceForm` or `LinksManager`.

```
User edits AppearanceForm (color, font, button style, etc.)
        ↓
updatePreviewUser({ themePrimaryColor: "#f43f5e", ... })   ← PreviewContext
        ↓
MobilePreview reads previewUser from context
        ↓
Renders ProfileHeader, SocialLinks, BusinessSection, etc. with new values
        ↓
Phone frame UI updates in real time (no page reload, no API call)
```

### Preview Modes
- **Mobile** — Renders inside a phone frame (375px width, rounded corners, notch)
- **Desktop** — Renders in a wider frame simulating a browser window

### Preview Controls
- Toggle button: Mobile ↔ Desktop
- Refresh button: Force re-render the preview

### What the Preview Renders
The preview renders the actual profile components (same components used on `/p/:username`):
- `ProfileHeader`
- `SocialLinks`
- `BusinessSection`
- `PaymentSection`
- `LocationSection`
- `EmailCaptureSection`

With `isPreview={true}` prop to disable actual API calls inside the preview.

---

## 14. QR Code System

**Component:** `src/components/dashboard/QRCodeModal.tsx`

### Features
- Auto-generates a QR code for `https://linkle.me/p/<username>`
- Rendered using `qrcode.react` (`<QRCodeSVG>` component)
- Modal with backdrop blur overlay
- **Download as PNG** — renders QR to an `<canvas>`, calls `canvas.toDataURL()`, triggers file download
- Accessible from:
  - Links Manager header button
  - Tools tab in LinksManager

---

## 15. Email Capture System

### Public Profile Side
**Component:** `src/components/profile/EmailCaptureSection.tsx`

- Shown on public profile if `user.emailCaptureEnabled === true`
- Card with icon, title, email input, subscribe button
- On submit → `POST /api/subscribe` with `{ username, email }`
- States: `idle` → `loading` → `success` / `error`
- Success state: animated checkmark + "Subscribe another email" option
- Button color inherits `var(--user-primary)` (user's theme color)
- Button/card border radius adapts to user's `themeButtonStyle`

### API — `POST /api/subscribe`
```
1. Validate: username + email present
2. Validate: email format (regex)
3. Find user by username
4. Check for existing subscription (userId + email uniqueness)
5. Create CapturedEmail record
6. Return 201 { success: true, subscription }
```

### Dashboard Side (Tools Tab)
- Toggle to enable/disable the widget
- Customize title and placeholder text
- View list of captured subscriber emails with dates
- **Planned:** CSV export of subscriber list

---

## 16. API Reference (Every Endpoint)

### Auth Endpoints

#### `POST /api/register`
Create new user account.
```json
// Request Body
{ "email": "user@example.com", "password": "StrongPass123", "name": "Jane Doe" }

// Response 201
{ "success": true, "userId": "usr_..." }

// Errors
// 400: email already exists
// 400: missing fields
// 500: internal error
```

#### `POST /api/auth/forgot-password`
```json
// Request Body
{ "email": "user@example.com" }

// Response 200 (always, to prevent email enumeration)
{ "success": true }
// Side effect: reset link logged to console (email delivery planned)
```

#### `POST /api/auth/reset-password`
```json
// Request Body
{ "token": "<32-byte hex>", "password": "NewPass123" }

// Response 200
{ "success": true }

// Errors: 400 (missing/invalid/expired token), 500
```

---

### Link Endpoints (Social, Business, Payment — identical pattern)

#### `GET /api/links/social`
Returns all social links for the authenticated user, ordered by `order` ASC.
```json
// Response 200
[{ "id": "...", "platform": "instagram", "url": "https://instagram.com/jane", "label": null, "isVisible": true, "order": 0, "startDate": null, "endDate": null, "featured": false }]
```

#### `POST /api/links/social`
```json
// Request Body
{ "platform": "instagram", "url": "https://instagram.com/handle", "label": "My Insta" }
// Response 201 — created SocialLink object
```

#### `DELETE /api/links/social/[id]`
Deletes the link. Validates it belongs to the current user.
```json
// Response 200
{ "success": true }
```

#### `PATCH /api/links/social/[id]`
Edit link details (platform, url, label, startDate, endDate).
```json
// Request Body (all optional)
{ "platform": "twitter", "url": "https://x.com/handle", "label": "Follow me", "startDate": "2026-06-01T00:00:00Z", "endDate": "2026-12-31T23:59:59Z" }
// Response 200 — updated SocialLink object
```

#### `PATCH /api/links/social/[id]/toggle`
Toggle `isVisible`.
```json
// Request Body
{ "isVisible": false }
// Response 200 — updated link object
```

#### `POST /api/links/social/reorder`
Persist new display order after drag-and-drop.
```json
// Request Body
{ "links": [{ "id": "...", "order": 0 }, { "id": "...", "order": 1 }] }
// Response 200
{ "success": true }
```

*Same 6 endpoints exist for `/api/links/business/` and `/api/links/payment/` with type-appropriate fields.*

---

### User Profile Endpoint

#### `PATCH /api/user/profile`
Update profile info and appearance settings.
```json
// Request Body (all fields optional)
{
  "displayName": "Jane Doe",
  "bio": "Designer & Creator",
  "avatarUrl": "https://cdn.example.com/avatar.png",
  "bannerUrl": "https://cdn.example.com/banner.png",
  "themePrimaryColor": "#f43f5e",
  "themeButtonStyle": "pill",
  "themeFontFamily": "Inter",
  "locationAddress": "123 Studio, Mumbai",
  "locationGoogleMapsEmbedUrl": "https://www.google.com/maps/embed?...",
  "locationIsVisible": true,
  "locationShowDirectionsBtn": true,
  "emailCaptureEnabled": true,
  "emailCaptureTitle": "Join my newsletter",
  "emailCapturePlaceholder": "your@email.com"
}
// Response 200 — updated user object
```

---

### User Settings Endpoint

#### `PATCH /api/user/settings`
Update username or display name.
```json
// Request Body
{ "username": "newhandle", "displayName": "Jane Creator" }
// Response 200 — updated user object
// Error 400: username taken or invalid format
```

#### `DELETE /api/user/settings`
Permanently delete the authenticated user's account and all associated data.
```json
// Response 200
{ "success": true }
// Side effect: cascade deletes all links, analytics, emails, sessions
```

---

### Analytics Endpoints

#### `POST /api/analytics/view`
Log a public profile page view.
```json
// Request Body
{
  "username": "jane",
  "referrer": "https://twitter.com/...",
  "visitorId": "vis_d83js8djs9"
}
// Response 200
{ "success": true }
```

#### `POST /api/analytics/click`
Log an outbound link click.
```json
// Request Body
{
  "userId": "usr_...",
  "linkId": "lnk_...",
  "linkType": "social",
  "linkTitle": "Instagram",
  "url": "https://instagram.com/jane",
  "referrer": "Direct"
}
// Response 200
{ "success": true }
```

#### `GET /api/analytics`
Fetch all aggregated analytics for the authenticated user's dashboard.
```json
// Response 200
{
  "stats": [
    { "label": "Total Clicks", "value": "1,248" },
    { "label": "Unique Visitors", "value": "890" },
    { "label": "Profile Views", "value": "2,410" },
    { "label": "Countries Connected", "value": "12" }
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
    { "dateStr": "Jun 01", "clicks": 14, "views": 32 },
    { "dateStr": "Jun 02", "clicks": 22, "views": 45 }
  ]
}
```

#### `POST /api/subscribe`
Capture visitor email on a public profile.
```json
// Request Body
{ "username": "jane", "email": "visitor@example.com" }
// Response 201
{ "success": true, "subscription": { "id": "...", "email": "visitor@example.com", "createdAt": "..." } }
// Errors: 400 (duplicate, invalid), 404 (user not found), 500
```

---

## 17. Component Reference (Every Component)

### Dashboard Components (`src/components/dashboard/`)

| Component | Size | Purpose |
|---|---|---|
| `DashboardSidebar.tsx` | ~6.6KB | Persistent left nav: logo, user avatar, nav links (Overview, Links, Appearance, Analytics, Settings, Monetization), Sign Out button |
| `LinksManager.tsx` | ~48KB | Full tabbed CRUD manager for Social/Business/Payment links + Tools (email capture). Includes DnD, edit modal, QR trigger |
| `AppearanceForm.tsx` | ~22KB | Profile info, 8 color presets + custom picker, 4 button styles, 7 fonts, location settings, email capture settings |
| `AnalyticsDashboard.tsx` | ~16KB | Stat cards, custom SVG bar chart (14 days), top links ranking, device breakdown, country breakdown |
| `MobilePreview.tsx` | ~6.6KB | Phone/desktop frame UI, renders actual profile components in live preview |
| `PreviewContext.tsx` | ~1.1KB | React Context + Provider holding `previewUser` state and `updatePreviewUser` setter |
| `QRCodeModal.tsx` | ~3KB | QR code modal, download-as-PNG, backdrop blur |
| `LinkEditModal.tsx` | ~18KB | Edit modal for social/business/payment links, includes scheduling section |
| `SettingsForm.tsx` | ~9.9KB | Username + display name settings, danger zone with typed confirmation delete |
| `StyledSelect.tsx` | ~4.3KB | Reusable styled `<select>` component used in forms |

---

### Profile Components (`src/components/profile/`)

Shared between public `/p/:username` page AND the live preview panel.

| Component | Size | Purpose |
|---|---|---|
| `ProfileContainer.tsx` | ~10KB | Root: applies theme CSS var, Google Fonts style, renders gradient blobs, fires analytics view event, centralized click tracker |
| `ProfileHeader.tsx` | ~3.3KB | Banner image (if set), avatar (with fallback initials), displayName, `@username` handle, bio |
| `SocialLinks.tsx` | ~5.7KB | Maps platform → icon + color. Renders icon buttons with `data-track-*` attributes for analytics |
| `BusinessSection.tsx` | ~3.4KB | Card list: thumbnail (if set), title, description, URL. `data-track-*` on each card |
| `PaymentSection.tsx` | ~5KB | Platform icon + name + masked value buttons. Themed background color |
| `ContactSection.tsx` | ~2.6KB | Action buttons (vCard, booking, resume, custom). Inherits `--user-primary` |
| `LocationSection.tsx` | ~3KB | Address text, Google Maps `<iframe>` embed, "Get Directions" link |
| `EmailCaptureSection.tsx` | ~7.5KB | Subscribe widget: title, email input, submit button, success/error states, Framer Motion animations |

---

### UI Components (`src/components/ui/`)

| Component | Purpose |
|---|---|
| `ThemeToggle.tsx` | Light/dark mode toggle button (uses next-themes or localStorage) |
| `avatar.tsx` | Reusable avatar with image + fallback initials |

---

## 18. Data Flow Diagrams

### Live Preview Data Flow
```
User changes color in AppearanceForm
            ↓
updatePreviewUser({ themePrimaryColor: "#f43f5e" })
            ↓  (React Context setter)
PreviewContext state updates
            ↓  (re-render via useContext)
MobilePreview reads new previewUser
            ↓
ProfileContainer receives previewUser as props
            ↓
All profile components re-render with new theme
            ↓
Phone/desktop frame shows updated profile instantly
        (no API call, no page reload)
```

### Link CRUD Data Flow
```
User clicks "Add" in LinksManager
            ↓
POST /api/links/social { platform, url, label }
            ↓
route.ts: auth() → session check → prisma.socialLink.create()
            ↓
Returns new link JSON (201)
            ↓
setSocialLinks(prev => [...prev, newLink])   ← optimistic UI
            ↓
updatePreviewUser({ socialLinks: [..., newLink] })
            ↓
Live preview shows new link immediately
```

### Analytics Data Flow
```
Visitor opens /p/jane
            ↓
ProfileContainer mounts (client-side)
            ↓
Reads/creates visitorId in localStorage
            ↓
POST /api/analytics/view { username, referrer, visitorId }
            ↓
Server: parses device from User-Agent, country from edge headers
            ↓
prisma.profileView.create({ userId, visitorId, device, country, referrer })

Visitor clicks "Instagram" link
            ↓
Event bubbles up to ProfileContainer click handler
            ↓
Reads data-track-id, data-track-type, data-track-title, data-track-url
            ↓
POST /api/analytics/click { userId, linkId, linkType, linkTitle, url }
            ↓
prisma.clickEvent.create({ ... })
```

---

## 19. Theming & Appearance System

### CSS Variables (`src/app/globals.css`)
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #09090b;
    --foreground: #ededed;
  }
}
```

Custom utility classes:
- `.gradient-text` — purple-to-pink gradient text
- `.gradient-bg` — purple-to-pink gradient background
- `.glass` — frosted glass card (light mode)
- `.glass-dark` — frosted glass card (dark mode)
- `.shadow-glow` — purple glow box shadow
- `@keyframes float` + `.animate-float` — gentle floating animation for background blobs

### Per-User Dynamic Theming
Each user's chosen primary colour is injected as a CSS variable on the profile container:
```jsx
<div style={{ "--user-primary": user.themePrimaryColor } as React.CSSProperties}>
```

All profile sub-components reference `var(--user-primary)` for:
- Social link icon backgrounds
- Payment button backgrounds
- Business card accent colors
- Contact action button colors
- Email capture subscribe button
- Gradient background blobs
- Profile header gradient overlay

### Font Application
```jsx
// In ProfileContainer, dynamically injected <style> tag:
<style>{`
  @import url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;600;700;900&display=swap');
  .profile-font-scope { font-family: '${fontFamily}', sans-serif; }
`}</style>
```

---

## 20. Scheduled Links System

### How It Works
Any link (Social, Business, Payment, ContactAction) can have optional `startDate` and `endDate` fields.

### On the Public Profile
Filtering logic applied during SSR data fetch:
```typescript
// Pseudo-code (applied in the Prisma where clause or post-fetch filter)
const now = new Date();
const visibleLinks = links.filter(link => {
  if (link.startDate && link.startDate > now) return false;  // not started yet
  if (link.endDate && link.endDate < now) return false;       // already ended
  return true;
});
```

### In the Dashboard
- Links with a future `startDate` show a "Scheduled" badge
- Links with an expired `endDate` show a "Expired" badge  
- The edit modal's scheduling section shows current start/end times

### Setting Schedule in LinkEditModal
- `<input type="datetime-local">` for both start and end
- Leave blank = no scheduling (always visible)
- Format: `YYYY-MM-DDTHH:MM` (browser `datetime-local` format)

---

## 21. Environment Variables & Project Setup

### Required `.env` File
```env
# Database (PostgreSQL for production)
DATABASE_URL="postgresql://user:password@localhost:5432/linkle"

# NextAuth
AUTH_SECRET="your-random-32-char-secret"   # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Public app URL (used for QR codes, profile links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Email delivery (when implemented)
RESEND_API_KEY="re_..."
# OR
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="you@gmail.com"
SMTP_PASS="your-app-password"
```

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
# → http://localhost:3000
```

### Available npm Scripts
| Script | Command | Purpose |
|---|---|---|
| Dev server | `npm run dev` | Next.js dev server (Turbopack) |
| Build | `npm run build` | Production bundle |
| Start prod | `npm run start` | Production server |
| Lint | `npm run lint` | ESLint check |
| Seed analytics | `npm run seed` | Populate dev DB with sample analytics |
| DB GUI | `npx prisma studio` | Visual database browser |
| DB reset | `npx prisma migrate reset` | Reset and re-migrate database |

---

## 22. Current Status & Feature Checklist

### ✅ Fully Implemented & Working

#### Authentication
- [x] Email + password registration
- [x] Login with JWT session (NextAuth v5)
- [x] Forgot password (token generated, logged to console)
- [x] Reset password (token-validated, bcrypt re-hash)
- [x] Protected dashboard routes (server-side redirect)
- [x] Session user with `id` + `username` fields

#### Public Profile Page
- [x] SSR at `/p/:username`
- [x] Profile header (avatar, banner, name, username, bio)
- [x] Social links section with platform icons
- [x] Business/custom link cards
- [x] Payment methods section
- [x] Contact actions section
- [x] Location section with Google Maps embed
- [x] Email capture widget (live, saves to DB)
- [x] Animated gradient background themed to user's primary color
- [x] "Powered by Linkle" footer badge
- [x] Demo profile at `/p/demo`
- [x] Dynamic SEO metadata generation

#### Dashboard — Links Manager
- [x] Social links tab: add, delete, toggle, DnD reorder
- [x] Business links tab: add, delete, toggle, DnD reorder
- [x] Payment links tab: add, delete, toggle, DnD reorder
- [x] Edit modal for all link types (platform, URL, label, dates)
- [x] Scheduled links (start date / end date) per link
- [x] Tools tab: email capture enable/disable + customize
- [x] QR code modal (downloadable PNG)

#### Dashboard — Appearance
- [x] Profile info editing (name, bio, avatar URL, banner URL)
- [x] 8 color theme presets
- [x] Custom hex color picker
- [x] 4 button styles (pill, rounded, square, outline)
- [x] 7 font family options
- [x] Location settings (address, Maps URL, visibility toggle)
- [x] Email capture settings
- [x] Save all changes via `PATCH /api/user/profile`

#### Dashboard — Analytics
- [x] Real event tracking: page views + link clicks to PostgreSQL
- [x] Total clicks, unique visitors, profile views, countries cards
- [x] Daily performance bar chart (14 days)
- [x] Top links ranking
- [x] Device breakdown (Mobile/Desktop/Tablet)
- [x] Country breakdown
- [x] Edge-based geolocation (Vercel + Cloudflare headers)

#### Dashboard — Live Preview
- [x] Real-time phone frame preview (React Context)
- [x] Mobile/Desktop toggle
- [x] Updates instantly on all edits (no reload)

#### Dashboard — Settings
- [x] Username change (uniqueness enforced)
- [x] Display name change
- [x] Account info display
- [x] Delete account (with typed confirmation, cascade delete)

#### Dashboard — Overview
- [x] Quick stats (total links, clicks, views — real DB data)
- [x] Quick action shortcuts

#### QR Code
- [x] Auto-generated QR for `/p/<username>`
- [x] Download as PNG

#### Email Capture
- [x] Widget on public profile
- [x] `POST /api/subscribe` saves to `CapturedEmail` model
- [x] Deduplication (no double-subscribing)

---

### 🔲 Planned / In Progress

| Priority | Feature | Notes |
|---|---|---|
| 🔴 High | Email delivery for password reset | Integrate Resend or Nodemailer + SMTP |
| 🔴 High | OAuth providers (Google, GitHub) | `NextAuth` `GoogleProvider`, `GitHubProvider` |
| 🟡 Medium | Monetization page | Subscription tiers + Stripe integration |
| 🟡 Medium | CSV export of captured emails | Download subscriber list from dashboard |
| 🟡 Medium | Featured links persistence | Persist `featured` boolean to DB; show starred links at top |
| 🟢 Low | Custom domain support | Map custom domains to `/p/<username>` |
| 🟢 Low | Contact actions CRUD in dashboard | UI to add/manage vCard, booking, resume links |
| 🟢 Low | Analytics date range filter | Filter analytics by 7d / 30d / 90d / custom |
| 🟢 Low | Profile view history (for user) | Show user who visited when |
| 🟢 Low | Link thumbnails auto-fetch | Auto-fetch OG image for business link thumbnails |
| 🟢 Low | Theme background color | Full background color customization (not just primary) |

---

## 23. Roadmap & Planned Features

### Phase 1 — Core Completion (Current Sprint)
- [ ] Email delivery (Resend integration for password reset)
- [ ] OAuth sign-in (Google, GitHub)
- [ ] CSV export for captured emails
- [ ] Contact actions CRUD UI in dashboard

### Phase 2 — Power Features
- [ ] Monetization / subscription page (Stripe)
- [ ] Custom domain support
- [ ] Featured link pinning (persist to DB + show at top)
- [ ] Analytics date range picker
- [ ] Link thumbnail auto-fetch (Open Graph)

### Phase 3 — Scale & Polish
- [ ] Rate limiting on API routes (protect against abuse)
- [x] Image upload (Cloudinary) with client compression & image-only restrictions
- [ ] Admin panel for platform management
- [ ] Affiliate / referral system for "Powered by Linkle" badge

---

## 24. Deployment Guide

### Production Database (PostgreSQL)
1. Provision a PostgreSQL database (Supabase, Railway, Neon, PlanetScale, etc.)
2. Update `schema.prisma` provider is already set to `"postgresql"`
3. Set `DATABASE_URL` to the PostgreSQL connection string
4. Run `npx prisma migrate deploy` in CI/CD pipeline

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://user:pass@host:5432/linkle"
AUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Deploy to Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Set all environment variables in Vercel project settings
3. Deploy — Vercel auto-detects Next.js and configures build
4. Vercel's edge headers (`x-vercel-ip-country`) will power geolocation analytics automatically

### Deploy to other Node.js hosts
```bash
npm run build
npm run start   # runs on port 3000 (set PORT env var to override)
```

### Post-Deployment Checklist
- [ ] `NEXTAUTH_URL` matches the live domain exactly
- [ ] `NEXT_PUBLIC_APP_URL` matches the live domain
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Test registration → login → profile → dashboard flow end-to-end
- [ ] Verify analytics events are being captured (`/p/demo`)
- [ ] Verify password reset link is delivered (once email is integrated)

---

*Document generated: June 2026 · Linkle v1.0.0*
*Based on actual codebase analysis — reflects every feature, file, and API endpoint currently implemented.*
