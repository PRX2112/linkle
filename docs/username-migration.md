# Linkle — Permanent Username History & Alias Migration Report

> **Date:** October 2, 2026  
> **Topic:** Permanent Username History, Alias Routing, Anti-Collision & Abuse Protection  
> **Target Environment:** Production Ready  
> **Framework & Stack:** Next.js 15.1.7 (Next.js 15.5.14 runtime) · Prisma ORM 5.22.0 · PostgreSQL

---

## 1. Executive Summary

In link-in-bio and personal aggregation platforms, users frequently update or rebrand their public handles. Previously, changing a username broke existing external references: printed QR codes, social media bios, search-engine indexes, and bookmarks would instantly render `404 Not Found`. Furthermore, bad actors could immediately register an abandoned username to impersonate the previous creator.

To eliminate this vulnerability, Linkle now implements an enterprise-grade **Permanent Username History System**:
1. When a user updates their username, their previous username is automatically archived into a permanent alias table (`UsernameHistory`) associated with their account.
2. Public requests for any previous username (`/p/oldusername`) trigger an **HTTP 308 Permanent Redirect** directly to the current canonical username (`/p/currentusername`).
3. Historical aliases are protected against collisions: no other user can register or claim an active alias held by another account.
4. If a user chooses to reclaim one of their own previous usernames, the system smoothly re-promotes the alias to the canonical handle.
5. If an account is deleted, all historical aliases are deleted via database cascade, safely releasing the handles back to the global pool.
6. Anti-abuse rate-limiting (24-hour cooldown) prevents dictionary squatting and database bloat.
7. Dynamic QR generation and canonical OpenGraph metadata are guaranteed to reference the current canonical username.

---

## 2. Database Schema & Migration Details

### 2.1 Prisma Schema Definition
A new relational model, `UsernameHistory`, was added to [`prisma/schema.prisma`](file:///d:/VibingSites/LINKLE/prisma/schema.prisma):

```prisma
model User {
  id              String            @id @default(cuid())
  username        String?           @unique
  // ... other fields
  usernameHistory UsernameHistory[]
}

model UsernameHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  username  String   @unique
  createdAt DateTime @default(now())

  @@index([username])
  @@index([userId])
}
```

### 2.2 Database Migration
* **Command Executed**: `npx prisma db push`
* **Datasource**: PostgreSQL (`linklex_db` on schema `public`).
* **Table Created**: `public."UsernameHistory"`
  * Primary key: `id text PRIMARY KEY`
  * Foreign key: `userId text REFERENCES "User"(id) ON DELETE CASCADE`
  * Unique constraint: `username text UNIQUE`
  * Composite/Single indices: `idx_username`, `idx_userId`
* **Cascade Semantics**: If a user deletes their account (`User.delete`), all historical alias records are automatically purged via PostgreSQL `ON DELETE CASCADE`.

---

## 3. Architecture & Resolution Flow

### 3.1 Username Change Lifecycle (`PATCH /api/user/settings`)

```
User submits new username: "alex_design" (previously "alexcreator")
                    │
                    ▼
     Validate Format & Reserved Names
     (3-20 chars, regex, RESERVED_USERNAMES)
                    │
                    ▼
        Check Collision Constraints:
     1. Is "alex_design" active on another User?
     2. Is "alex_design" a historical alias of another User?
                    │
                    ▼
        Check Anti-Abuse Cooldown:
     Has this user changed usernames within the last 24h?
                    │
                    ▼
           Prisma Transaction:
     1. Archive "alexcreator" in UsernameHistory for this user
     2. Delete "alex_design" from UsernameHistory (if self-reclaiming)
     3. Update User.username to "alex_design"
                    │
                    ▼
     Revalidate Tag Cache for both old and new slugs
```

### 3.2 Public Profile Resolution (`GET /p/[slug]`)

```
Public Request: /p/alexcreator
                    │
                    ▼
        Query Active User by Slug:
     prisma.user.findUnique({ where: { username: "alexcreator" } })
                    │
             ┌──────┴──────┐
        Found?             Not Found?
           │                      │
           ▼                      ▼
  Canonical Render        Query UsernameHistory:
  (HTTP 200 OK)           prisma.usernameHistory.findUnique({
                            where: { username: "alexcreator" },
                            include: { user: true }
                          })
                                  │
                           ┌──────┴──────┐
                      Found?             Not Found?
                         │                      │
                         ▼                      ▼
                canonical = user.username    notFound()
                Is canonical != slug?       (HTTP 404)
                         │
                  ┌──────┴──────┐
                Yes             No (Prevent Loop)
                  │                     │
                  ▼                     ▼
          HTTP 308 Redirect        notFound()
          Location: /p/alex_design
```

### 3.3 Single-Hop Resolution (Zero Redirect Chains or Loops)
If a user updates their username multiple times (`v1` -> `v2` -> `v3`):
* `UsernameHistory` contains rows:
  * `v1` -> `User(v3)`
  * `v2` -> `User(v3)`
* A request to `/p/v1` immediately looks up the relation `user.username` (`v3`) and permanently redirects directly to `/p/v3` in **a single HTTP 308 hop**.
* A request to `/p/v2` permanently redirects directly to `/p/v3` in **a single HTTP 308 hop**.
* No intermediate chain (`v1 -> v2 -> v3`) exists.
* Redirect loops are mathematically impossible because the redirect condition strictly enforces `canonical.toLowerCase() !== normalized`.

---

## 4. Key Security & Functional Enhancements

### 4.1 Collision & Impersonation Prevention
* **Registration** ([`src/app/api/register/route.ts`](file:///d:/VibingSites/LINKLE/src/app/api/register/route.ts)):
  During signup, the system checks both `User.username` AND `UsernameHistory.username`. If an alias is active for an existing user, new registrants cannot take it.
* **Settings** ([`src/app/api/user/settings/route.ts`](file:///d:/VibingSites/LINKLE/src/app/api/user/settings/route.ts)):
  When changing a username, the system verifies that no other user holds the target handle as either their current username or an alias.
* **Self-Reclaim**:
  If a user previously held username `A`, switched to `B`, and later wants to switch back to `A`, the system recognizes that the user owns alias `A`, removes it from history, and promotes it back to active canonical without collision errors.

### 4.2 Reserved Route Protection
Expanded `RESERVED_USERNAMES` in [`src/lib/validation.ts`](file:///d:/VibingSites/LINKLE/src/lib/validation.ts) to guard top-level routing namespaces:
`admin`, `administrator`, `login`, `register`, `signup`, `signin`, `signout`, `logout`, `dashboard`, `settings`, `analytics`, `monetization`, `api`, `auth`, `forgot-password`, `reset-password`, `verify-email`, `p`, `demo`, `linkle`, `support`, `status`, `help`, `billing`, `pricing`, `webhook`, `webhooks`, `sitemap`, `robots`, `favicon`, `mail`, `app`, `null`, `undefined`.

### 4.3 Anti-Abuse Cooldown
* To prevent rapid username churn, dictionary squatting, or database bloat, username updates are restricted to **once every 24 hours** per user (`USERNAME_CHANGE_COOLDOWN_HOURS`, configurable).
* Requests exceeding this limit receive an HTTP 429 response detailing the remaining cooldown hours.

### 4.4 Canonical Metadata & OpenGraph Consistency
* In [`src/app/p/[username]/page.tsx`](file:///d:/VibingSites/LINKLE/src/app/p/[username]/page.tsx), `generateMetadata` resolves aliases to the current user's profile and emits:
  ```ts
  alternates: {
    canonical: `https://linkle.app/p/${user.username}`,
  },
  openGraph: {
    url: `https://linkle.app/p/${user.username}`,
    images: [...],
  }
  ```
  Search-engine bots (Googlebot, Bingbot) receiving historical URLs immediately index the canonical URL and transfer link equity via the HTTP 308 redirect.

### 4.5 Dynamic QR Code Integrity
* [`QRCodeModal.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/QRCodeModal.tsx) and [`ProfileContainer.tsx`](file:///d:/VibingSites/LINKLE/src/components/profile/ProfileContainer.tsx) normalize and bind the QR payload to the current canonical profile URL.
* Even if an external party has a physical card with a printed QR pointing to an old username, the permanent redirect instantly transports the scanner to the creator's updated live profile.

---

## 5. Automated Verification Results

An end-to-end automated test suite was developed at [`scripts/test-username-history.js`](file:///d:/VibingSites/LINKLE/scripts/test-username-history.js):

| # | Test Scenario | Verified Condition | Status |
|---|---|---|---|
| 1 | Initial User Creation | `/p/test_u1` resolves directly with HTTP 200 OK | ✅ PASS |
| 2 | First Username Change | `test_u1` archived in `UsernameHistory` pointing to User A | ✅ PASS |
| 3 | Old URL Resolution | Visiting `/p/test_u1` issues HTTP 308 Permanent Redirect to `/p/test_u2` | ✅ PASS |
| 4 | Current URL Resolution | Visiting `/p/test_u2` resolves directly with HTTP 200 OK | ✅ PASS |
| 5 | Multiple Historical Usernames | User holds multiple historical aliases simultaneously (`u1`, `u2`) | ✅ PASS |
| 6 | Single-Hop Oldest URL | Oldest URL `/p/test_u1` redirects directly to `/p/test_u3` without chains | ✅ PASS |
| 7 | Single-Hop Intermediate URL | Intermediate URL `/p/test_u2` redirects directly to `/p/test_u3` without loops | ✅ PASS |
| 8 | Active Collision Prevention | User B cannot claim active canonical username `test_u3` | ✅ PASS |
| 9 | Historical Collision Prevention | User B cannot claim historical alias `test_u1` | ✅ PASS |
| 10 | Historical Collision Prevention | User B cannot claim historical alias `test_u2` | ✅ PASS |
| 11 | Self-Reclaim Behavior | User A successfully reclaims `test_u1` as active canonical handle | ✅ PASS |
| 12 | Inverted Alias Redirect | Former canonical `test_u3` now redirects to reclaimed `test_u1` | ✅ PASS |
| 13 | Deleted Account Cascade | All `UsernameHistory` rows for User A are purged on account deletion | ✅ PASS |
| 14 | Deleted Old URL 404 | Old URLs for deleted account return HTTP 404 Not Found | ✅ PASS |
| 15 | Deleted Current URL 404 | Current URL for deleted account returns HTTP 404 Not Found | ✅ PASS |
| 16 | Handle Recycled on Deletion | Released username is eligible for new registration post-deletion | ✅ PASS |

**Result:** **16 / 16 tests passed (100%)**.

---

## 6. Files Changed & Migrations

| File | Status | Description |
|---|---|---|
| `prisma/schema.prisma` | Modified | Added `UsernameHistory` model with unique constraint, foreign key with `onDelete: Cascade`, and added `usernameHistory` relation to `User`. |
| `src/app/api/user/settings/route.ts` | Modified | Added historical alias collision check, anti-abuse cooldown check, atomic archiving transaction, self-reclaim support, and dual cache purging. |
| `src/app/api/register/route.ts` | Modified | Added check against `UsernameHistory` to prevent registration of active historical aliases. |
| `src/lib/validation.ts` | Modified | Expanded `RESERVED_USERNAMES` with system and routing namespaces. |
| `src/app/p/[username]/page.tsx` | Modified | Added alias query resolution, `permanentRedirect` (HTTP 308), loop prevention, and canonical URL metadata. |
| `src/components/dashboard/QRCodeModal.tsx` | Modified | Ensured QR payload always formats to normalized canonical username and configured app URL. |
| `src/components/dashboard/SettingsForm.tsx` | Modified | Added user-facing note informing creators that previous usernames permanently redirect to their new link. |
| `scripts/test-username-history.js` | **Created** | Automated test suite verifying full alias lifecycle, collision prevention, and cascade deletion. |
| `docs/username-migration.md` | **Created** | This architecture and migration document. |

---

## 7. Migration Verification Summary

* **Database Migration**: Executed via `npx prisma db push`.
* **Prisma Client**: Regenerated via `npx prisma generate`.
* **ESLint**: Passed with 0 errors (`npm run lint`).
* **Production Build**: Passed with 0 errors across all 24 compiled routes (`npm run build`).
* **Automated Suites Executed**:
  1. `node scripts/test-username-history.js` (16/16 Passed)
  2. `node scripts/test-auth-security.js` (18/18 Passed)
  3. `node scripts/test-upi-qr-decode.js` (Passed 100%)
