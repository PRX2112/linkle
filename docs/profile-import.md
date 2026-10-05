# Safe Profile Import Utility

## Overview

Linkle's Safe Profile Import Utility allows new and existing creators to quickly import their social channels, repositories, portfolios, and personal websites by simply pasting profile URLs.

The utility is designed around **zero scraping**, **strict protocol safety**, **intelligent normalization**, **multi-level duplicate detection**, and **explicit user confirmation**.

---

## 1. Supported Sources & URL Normalization

The importer deterministically parses and standardizes URLs into canonical Linkle links:

| Source | Input Formats Handled | Normalized URL | Default Entry Type | Suggested Label |
| :--- | :--- | :--- | :---: | :--- |
| **Instagram** | `instagram.com/handle`, `https://www.instagram.com/handle/?igsh=xyz` | `https://instagram.com/handle` | Social Link | `Instagram (@handle)` |
| **YouTube** | `youtube.com/@channel`, `youtube.com/c/name`, `youtu.be/vid123` | `https://youtube.com/@channel` | Social Link | `YouTube (@channel)` |
| **LinkedIn** | `linkedin.com/in/handle`, `linkedin.com/company/name` | `https://linkedin.com/in/handle` | Social Link | `LinkedIn (handle)` |
| **GitHub** | `github.com/username`, `https://www.github.com/username/` | `https://github.com/username` | Social Link | `GitHub (@username)` |
| **X / Twitter** | `x.com/handle`, `twitter.com/handle`, `https://x.com/@handle` | `https://x.com/handle` | Social Link | `X (@handle)` |
| **Personal Website** | `myportfolio.dev`, `https://company.org/work?utm_source=fb` | `https://myportfolio.dev` | Business CTA | `Myportfolio Website` |

---

## 2. Core Safety & Privacy Principles

### 1. Zero External Scraping
- The importer **never** makes outbound HTTP/network requests to external third-party servers (Instagram, YouTube, LinkedIn, X, GitHub).
- It never accesses private profiles, never requests platform credentials, and never bypasses platform robots.txt or Terms of Service.
- Everything is extracted purely and deterministically from the URL text supplied by the user.

### 2. Malicious Scheme Prevention
- Blocklists all unsafe and scriptable protocols before parsing:
  - `javascript:`
  - `data:`
  - `vbscript:`
  - `file:`
  - `blob:`
  - `about:`
- Rejects URLs containing carriage return (`\r`), newline (`\n`), null byte (`\0`), or control character injection attacks.
- Enforces strict `http:` or `https:` protocols.

### 3. Tracking Parameter Sanitization
- Cleans and strips common tracking, affiliate, and session parameters before suggesting links:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
  - `igsh`, `si`, `fbclid`, `gclid`, `ref`, `source`, `t`, `s`
- Normalizes domain capitalization, removes extraneous `www.` subdomains, and strips dangling trailing slashes.

### 4. Mandatory User Confirmation
- **Never auto-publishes**: Pasting URLs produces a non-destructive suggested preview.
- Users can review every parsed link, edit the suggested label/title, uncheck unwanted links, or delete suggestions before saving.
- Links are only written to the database when the user explicitly clicks **"Confirm & Import"**.

---

## 3. Duplicate Detection System

The service performs two layers of duplicate analysis:

1. **Intra-Batch Deduplication**:
   - If a user pastes `https://twitter.com/alex` and `https://x.com/alex`, both normalize to `https://x.com/alex`.
   - The first occurrence is marked valid and ready for import; subsequent occurrences are marked with `isDuplicate: true` and `duplicateReason: "Duplicate URL in pasted list"`.
2. **Profile Cross-Referencing**:
   - The API compares each suggested link against the user's existing `SocialLink` and `BusinessLink` records in PostgreSQL.
   - If a normalized URL or social platform already exists in the user's profile, it is flagged as duplicate with `isDuplicate: true` and pre-unchecked by default, preventing accidental link collisions.

---

## 4. UI & Dashboard Integration

The profile import utility is accessible in two primary user journeys:

1. **Dashboard Toolbar** ([`src/components/dashboard/LinksManager.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/LinksManager.tsx)):
   - An **"Import"** button is placed on the main toolbar alongside "Add New Link", "Templates", "Preview", and "QR Code".
   - Opens the `<ProfileImportModal />` allowing users to paste batches of links at any time.
2. **Guided Onboarding Wizard** ([`src/components/dashboard/OnboardingWizard.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/OnboardingWizard.tsx)):
   - In Step 2 (Personalize Defaults), new users have a **"Quick Import URLs"** action above the suggested social accounts list.

---

## 5. API Reference

### `POST /api/links/import`

Requires authenticated session. Handles two actions:

#### 1. Parse Action (`action: "parse"`)
Analyzes raw text or URL arrays without saving to the database.

**Request:**
```json
{
  "action": "parse",
  "rawText": "https://github.com/pratik\nhttps://x.com/pratik\nhttps://myportfolio.dev"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "totalInput": 3,
    "validCount": 3,
    "duplicateCount": 0,
    "unsupportedCount": 0,
    "suggestions": [
      {
        "id": "import_0_1740000000",
        "originalUrl": "https://github.com/pratik",
        "normalizedUrl": "https://github.com/pratik",
        "platform": "github",
        "entryType": "social",
        "handle": "pratik",
        "suggestedLabel": "GitHub (@pratik)",
        "isValid": true,
        "isSupported": true,
        "isDuplicate": false,
        "selected": true
      }
    ]
  }
}
```

#### 2. Commit Action (`action: "commit"`)
Persists confirmed items to PostgreSQL inside a database transaction and revalidates profile caches.

**Request:**
```json
{
  "action": "commit",
  "items": [
    {
      "entryType": "social",
      "platform": "github",
      "url": "https://github.com/pratik",
      "label": "GitHub (@pratik)"
    },
    {
      "entryType": "business",
      "platform": "website",
      "url": "https://myportfolio.dev",
      "title": "Myportfolio Website"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully imported 2 links",
  "addedSocialCount": 1,
  "addedBusinessCount": 1
}
```

---

## 6. Automated Testing & Verification

Automated test suite is maintained in [`scripts/test-profile-import.js`](file:///d:/VibingSites/LINKLE/scripts/test-profile-import.js):
```bash
npx tsx scripts/test-profile-import.js
```

### Verified Test Cases:
- Normalization and handle extraction for all 6 supported platforms (Instagram, YouTube, LinkedIn, GitHub, X/Twitter, Website).
- Scheme security: rejection of `javascript:alert(1)`, `data:text/html`, and control characters.
- Query sanitization: stripping `utm_*`, `igsh`, `si`, and trailing slashes.
- Intra-batch duplicate detection (e.g. `twitter.com/user` vs `x.com/user`).
- Database duplicate detection against existing user links.
- Graceful fallback for non-social URLs into clean business links.
- Transactional link persistence with cache revalidation.
