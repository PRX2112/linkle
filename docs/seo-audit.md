# Linkle Production SEO Audit & Specification

## 1. Executive Summary

This document details the production-grade Search Engine Optimization (SEO) system engineered for Linkle's public profiles (`/p/[username]`) and core application routes. The implementation elevates Linkle profiles from simple web pages into rich, discoverable knowledge graph entities compatible with modern search engines (Google, Bing), social platforms (Twitter/X, LinkedIn, Facebook, Discord, Slack, iMessage), and RSS/crawler bots, while strictly protecting private user data.

---

## 2. Core SEO Architecture

### 2.1 Dynamic Metadata Generation
Public profile metadata is generated on the server using Next.js App Router's `generateMetadata` lifecycle in [src/app/p/[username]/page.tsx](file:///d:/VibingSites/LINKLE/src/app/p/%5Busername%5D/page.tsx) and [src/app/p/demo/page.tsx](file:///d:/VibingSites/LINKLE/src/app/p/demo/page.tsx).

* **Dynamic Title**:
  * Active Profile: `${displayName} (@${canonicalUsername}) | Linkle`
  * Missing Profile: `User Not Found | Linkle`
* **Dynamic Meta Description**:
  * If bio is present: Normalizes whitespace, extracts bio, and truncates cleanly to ≤ 155 characters followed by `...` if needed.
  * If bio is empty: Generic, engaging fallback: `Connect with ${displayName} (@${canonicalUsername}) on Linkle. Explore social links, business links, and payment options.`
* **Canonical URL**:
  * Set via `alternates.canonical`. Always references the current canonical username: `${appUrl}/p/${canonicalUsername}`.
  * Ensures that case variations (`/p/PrXtiK`) or historical aliases redirect cleanly without splitting search ranking signals.
* **Open Graph Specification**:
  * `og:title`: `${displayName} (@${canonicalUsername}) | Linkle`
  * `og:description`: Dynamic profile description
  * `og:url`: `${appUrl}/p/${canonicalUsername}`
  * `og:site_name`: `Linkle`
  * `og:type`: `profile`
  * `og:locale`: `en_US`
  * `og:image`: Primary 1200x630 dynamic OG image (`/p/${canonicalUsername}/opengraph-image`) plus optional secondary avatar image
* **Twitter / X Card Specification**:
  * `twitter:card`: `summary_large_image`
  * `twitter:title`: `${displayName} (@${canonicalUsername}) | Linkle`
  * `twitter:description`: Dynamic description
  * `twitter:image`: `${appUrl}/p/${canonicalUsername}/opengraph-image`
  * `twitter:creator`: `@${canonicalUsername}`

---

## 3. Dynamic Open Graph Image Generator

To ensure shared profile links generate premium social preview cards across all messaging apps and social networks, a native server-side image generator was built using Next.js `ImageResponse` ([next/og](file:///d:/VibingSites/LINKLE/src/app/p/%5Busername%5D/opengraph-image.tsx) and [src/app/api/og/route.tsx](file:///d:/VibingSites/LINKLE/src/app/api/og/route.tsx)).

* **Image Dimensions**: 1200 × 630 pixels (`image/png`).
* **Design & Aesthetics**:
  * Modern dark background (`#09090b`) with radial gradient purple accents (`rgba(139, 92, 246, 0.35)` and `rgba(99, 102, 241, 0.3)`).
  * Linkle brand badge with gradient icon logo and "LINKLE" wordmark.
  * "Verified Profile" pill badge.
  * User display name in 46px bold typography.
  * User handle in violet (`#a78bfa`).
  * Bio excerpt in light slate (`#94a3b8`).
  * Footer banner with tagline "One Link For Everything" and canonical profile URL.
* **Resilience & Fallbacks**:
  * If the user has a valid avatar URL, an `AbortController` (1.8s timeout) validates that the remote image is reachable before rendering.
  * If the user has no avatar (or the image is unreachable), a gradient monogram circle featuring the user's initial is rendered instead.
  * Layout uses strict Satori flexbox properties to prevent rendering exceptions.

---

## 4. Schema.org JSON-LD Structured Data

Every public profile renders an inline, server-rendered `<script type="application/ld+json">` conforming to schema.org specifications:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "dateCreated": "2026-06-02T10:48:08.376Z",
  "dateModified": "2026-09-27T14:54:12.286Z",
  "mainEntity": {
    "@type": "Person",
    "name": "Pratik Parmar",
    "alternateName": "@prxtik",
    "identifier": "prxtik",
    "description": "Connect with Pratik Parmar on Linkle.",
    "image": "https://res.cloudinary.com/...",
    "url": "https://linkle.site/p/prxtik",
    "sameAs": [
      "https://instagram.com/prxtikz"
    ]
  }
}
```

### Entity Type Intelligence
* **Organization Detection**: If the user's `displayName` or `bio` matches commercial/brand keywords (`inc`, `corp`, `ltd`, `llc`, `agency`, `studio`, `team`, `official`, `store`, `shop`, `brand`, `company`, `foundation`, `club`), the entity is classified as `"Organization"`.
* **Person Default**: All individual creators default to `"Person"`.
* **`sameAs` Array**: Extracted from active, visible social links (`isVisible: true`, valid `http://` or `https://` URLs). Hidden links and internal navigation links are strictly excluded.

---

## 5. Privacy & Zero Data Leakage Guarantee

Search engine crawlers and bots only receive public data. The following data is strictly prevented from appearing in metadata, JSON-LD, or HTML tags:

| Sensitive Data | Exposed in SEO / HTML? | Safeguard |
|---|---|---|
| User email address | **NO** | Never queried or mapped in JSON-LD |
| Password hash | **NO** | Excluded from profile queries |
| Subscriber emails / capture counts | **NO** | Never serialized in metadata |
| Visitor analytics / view counts | **NO** | Click and view counts excluded from SSR payload |
| Stripe customer / subscription IDs | **NO** | Excluded from public profile mappings |
| Internal database cuid (`cm...`) | **NO** | JSON-LD uses `identifier: username` only |

---

## 6. Robots & Indexing Directives

### 6.1 Robots.txt ([src/app/robots.ts](file:///d:/VibingSites/LINKLE/src/app/robots.ts))
* **Allowed**:
  * `/` (Landing page)
  * `/p/*` (Public user profiles)
* **Disallowed**:
  * `/dashboard/` & `/dashboard/*` (Private user workspace)
  * `/api/` & `/api/*` (Internal endpoints)
  * `/login`, `/register` (Authentication)
  * `/forgot-password`, `/reset-password`, `/verify-email`
  * `/_next/` (Build chunks)
* **Sitemap Reference**: Points to `${baseUrl}/sitemap.xml`.

### 6.2 Profile Page Robots Directives
* **Active Profile**: `index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1`
* **Nonexistent Profile (404)**: `index: false, follow: false, nocache: true`
* **Historical Alias**: Next.js issues an HTTP 308 Permanent Redirect directly to the canonical username URL, transferring ranking equity to the active handle.

---

## 7. Scalable Sitemap Strategy ([src/app/sitemap.ts](file:///d:/VibingSites/LINKLE/src/app/sitemap.ts))

* **Route**: `/sitemap.xml`
* **Scaling Limit**: Standard compliant up to 50,000 URLs per sitemap file.
* **Exclusions**:
  * Excludes null or empty usernames.
  * Excludes all reserved system keywords defined in `RESERVED_USERNAMES` (e.g. `dashboard`, `admin`, `api`, `login`, `register`, `verify-email`, `sitemap`, `robots`, `favicon`).
  * Excludes deleted accounts and historical aliases (only active canonical handles are indexed).
* **Ordering**: Ordered by `updatedAt: 'desc'` so search engines prioritize recently active creator profiles.

---

## 8. Favicon & Web Application Manifest

* **Application Manifest** ([src/app/manifest.ts](file:///d:/VibingSites/LINKLE/src/app/manifest.ts)): Serves `/manifest.webmanifest` with PWA standalone configuration, branding, and theme colors.
* **Root Layout Metadata** ([src/app/layout.tsx](file:///d:/VibingSites/LINKLE/src/app/layout.tsx)):
  * Configured with `metadataBase: new URL(...)` to ensure absolute Open Graph and Twitter image resolution.
  * Icons generated in `public/`:
    * `favicon.ico`
    * `favicon.png` (32×32 PNG)
    * `icon-192.png` (192×192 PNG)
    * `logo.png` (512×512 PNG)
    * `apple-icon.png` (180×180 PNG)
    * `apple-touch-icon.png` (180×180 PNG)

---

## 9. Automated Test Results

The automated test suite ([scripts/test-seo-system.js](file:///d:/VibingSites/LINKLE/scripts/test-seo-system.js)) executed 100% successfully with 0 failures:

| Test Target | Verifications | Status |
|---|---|---|
| `/robots.txt` | User-agent rules, Disallows, Allows, Sitemap URL | **PASS** |
| `/sitemap.xml` | XML urlset, public URLs included, private routes excluded, no data leaks | **PASS** |
| `/manifest.webmanifest` | Application name, icons array, theme colors | **PASS** |
| `/p/demo` | Dynamic title, description, canonical link, OpenGraph, Twitter card, JSON-LD ProfilePage + sameAs, privacy | **PASS** |
| `/p/prxtik` | Real profile title, canonical link, og:image, email non-exposure | **PASS** |
| `/p/nonexistent_xyz_999` | HTTP 404 response, Not Found title | **PASS** |
| `/p/seo_no_avatar` | Monogram OG image fallback, dynamic title | **PASS** |
| `/p/seo_long_bio` | Clean meta description truncation (length ≤ 160, ellipsis) | **PASS** |
| `/p/seo_multi_social` | JSON-LD sameAs array filtering (5 visible included, 1 hidden excluded) | **PASS** |
| `/p/seo_studio_corp` | Organization schema detection (`@type: Organization`) | **PASS** |
| `/p/demo/opengraph-image` | HTTP 200, Content-Type: `image/png` | **PASS** |
| `/p/seo_no_avatar/opengraph-image` | HTTP 200, monogram fallback | **PASS** |
| `/api/og?username=demo` | HTTP 200, Content-Type: `image/png` | **PASS** |
| `/p/seo_legacy_alias` | HTTP 308 permanent redirect to canonical `/p/seo_studio_corp` | **PASS** |

---

## 10. Manual Post-Deployment Verification URLs

Once deployed to production (e.g. `https://linkle.site`), verify the following live URLs using external testing tools:

### Direct URLs to Check
1. **Robots Directives**: `https://linkle.site/robots.txt`
2. **Sitemap**: `https://linkle.site/sitemap.xml`
3. **Application Manifest**: `https://linkle.site/manifest.webmanifest`
4. **Official Demo Profile**: `https://linkle.site/p/demo`
5. **Real Profile**: `https://linkle.site/p/prxtik`
6. **Demo OG Image**: `https://linkle.site/p/demo/opengraph-image`
7. **Dynamic OG Endpoint**: `https://linkle.site/api/og?username=demo`

### External Testing Tools & Validators
* **Google Rich Results Test**: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results?url=https%3A%2F%2Flinkle.site%2Fp%2Fdemo)
  * Verify `ProfilePage` structured data resolves with 0 errors and shows `Person` or `Organization` main entity with `sameAs` links.
* **Schema.org Validator**: [https://validator.schema.org/](https://validator.schema.org/)
  * Test `/p/demo` and `/p/prxtik` for JSON-LD compliance.
* **Social Preview & OpenGraph Debuggers**:
  * [OpenGraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Flinkle.site%2Fp%2Fdemo)
  * Twitter / X Card Validator
  * Facebook Sharing Debugger: [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
  * LinkedIn Post Inspector: [https://www.linkedin.com/post-inspector/](https://www.linkedin.com/post-inspector/)
