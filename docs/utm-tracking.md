# Professional UTM Campaign Tracking System

## Overview

Linkle's Professional UTM Campaign Tracking System enables creators, brands, and businesses to track and measure the exact traffic sources, platforms, and campaigns that generate link clicks on their Linkle profiles.

The feature is **optional**, **safe**, and **non-breaking**:
- Existing links remain untouched unless the user explicitly toggles UTM tracking on.
- All existing query parameters and hash fragments on destination URLs are preserved.
- Unsafe protocols (such as `javascript:`, `data:`, `vbscript:`) are rejected.
- Parameters are properly encoded using web standards (`URLSearchParams`).
- Clicks automatically extract UTM parameters and index them on `AnalyticsEvent` records.
- Analytics reporting aggregates performance by **Campaign**, **Source**, and **Medium** across selectable time horizons (7d, 14d, 30d, 90d).

---

## 1. Supported Parameters

Linkle natively supports the 5 standard industry UTM parameters:

| Parameter | Key | Description | Example |
| :--- | :--- | :--- | :--- |
| **Campaign Source** | `utm_source` | The platform, site, or referrer sending traffic | `instagram`, `twitter`, `youtube`, `newsletter` |
| **Campaign Medium** | `utm_medium` | The marketing or distribution channel type | `bio`, `social`, `post`, `email`, `cpc` |
| **Campaign Name** | `utm_campaign` | The specific campaign, promotion, or initiative | `spring_launch_2026`, `blackfriday`, `creator_drop` |
| **Campaign Content** | `utm_content` | A/B testing identifier or link position | `top_card`, `footer_link`, `video_description` |
| **Campaign Term** | `utm_term` | Paid search keywords or content keywords | `sneakers`, `linkinbio`, `merch` |

---

## 2. Security & URL Sanitization Architecture

Security and parameter hygiene are enforced in [`src/lib/utm.ts`](file:///d:/VibingSites/LINKLE/src/lib/utm.ts) before any URL is modified or rendered.

### Forbidden Schemes & XSS Prevention
URLs with the following schemes are rejected and never augmented with parameters:
- `javascript:`
- `data:`
- `vbscript:`
- `file:`
- `blob:`
- `about:`

Only valid absolute URLs with `http:` or `https:` protocols are accepted for UTM injection. If a link does not meet these criteria, it is returned unmodified without error.

### Query Preservation & Safe Parameter Encoding
Standard string concatenation (e.g. `url + "?utm_source=" + source`) is vulnerable to breaking existing query strings (such as `?discount=SAVE20`) and failing to encode special characters (such as spaces or ampersands).

Linkle uses native `URL` and `URLSearchParams` manipulation:
```typescript
const urlObj = new URL(trimmedBase);
if (config.utmSource) urlObj.searchParams.set("utm_source", config.utmSource.trim());
if (config.utmMedium) urlObj.searchParams.set("utm_medium", config.utmMedium.trim());
if (config.utmCampaign) urlObj.searchParams.set("utm_campaign", config.utmCampaign.trim());
if (config.utmTerm) urlObj.searchParams.set("utm_term", config.utmTerm.trim());
if (config.utmContent) urlObj.searchParams.set("utm_content", config.utmContent.trim());
return urlObj.toString();
```

**Example Transformation:**
- Base URL: `https://example.com/shop?code=VIP#reviews`
- UTM Config: `{ utmSource: "instagram", utmMedium: "bio", utmCampaign: "spring sale 2026 & deals" }`
- Final Destination: `https://example.com/shop?code=VIP&utm_source=instagram&utm_medium=bio&utm_campaign=spring+sale+2026+%26+deals#reviews`

---

## 3. Database Schema Updates

The Prisma schema ([`prisma/schema.prisma`](file:///d:/VibingSites/LINKLE/prisma/schema.prisma)) was extended to persist UTM parameters and create composite indexes for high-speed aggregation:

### Links (`SocialLink` & `BusinessLink`)
```prisma
model SocialLink {
  // ... existing fields ...
  utmEnabled   Boolean @default(false)
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmContent   String?
  utmTerm      String?
}

model BusinessLink {
  // ... existing fields ...
  utmEnabled   Boolean @default(false)
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmContent   String?
  utmTerm      String?
}
```

### Analytics (`AnalyticsEvent`)
```prisma
model AnalyticsEvent {
  // ... existing fields ...
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmContent   String?
  utmTerm      String?

  @@index([userId, utmCampaign])
  @@index([userId, utmSource])
  @@index([userId, utmMedium])
}
```

---

## 4. Dashboard Configuration UI

In the dashboard ([`src/components/dashboard/LinkEditModal.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/LinkEditModal.tsx)), users can toggle **"UTM Campaign Tracking"** on any social or business link:

1. **Toggle Switch**: Turns UTM tracking on or off. When off, all original URLs remain unchanged.
2. **Quick Presets**: Single-click setup for common channels:
   - 📸 **Instagram Bio**: `utm_source=instagram`, `utm_medium=bio`
   - 🐦 **Twitter Post**: `utm_source=twitter`, `utm_medium=social`
   - 🎵 **TikTok Bio**: `utm_source=tiktok`, `utm_medium=bio`
   - 📺 **YouTube**: `utm_source=youtube`, `utm_medium=video_description`
   - ✉️ **Newsletter**: `utm_source=newsletter`, `utm_medium=email`
3. **Parameter Inputs**: Clear inputs for `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term`.
4. **Live URL Preview**: Shows the exact generated destination URL in real time with a quick-copy button.
5. **Safety Indicator**: Alerts users if the destination URL is valid or contains an unsupported scheme.
6. **Badge in Link Manager**: Links with active UTM tracking display an indigo `UTM` badge in [`LinksManager.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/LinksManager.tsx).

---

## 5. Analytics Ingestion & Reporting

### Clicks & Tracking Pipeline
When a visitor clicks a link:
1. Public components ([`BusinessSection.tsx`](file:///d:/VibingSites/LINKLE/src/components/profile/BusinessSection.tsx) and [`SocialLinks.tsx`](file:///d:/VibingSites/LINKLE/src/components/profile/SocialLinks.tsx)) build the destination URL with `buildUtmUrl()`.
2. The click handler fires an event to `/api/analytics/click` or `/api/analytics/event`.
3. The API route extracts any UTM parameters present on the target URL via `extractUtmParams()` and stores them directly on the `AnalyticsEvent` record.

### Reporting Breakdown
The analytics API route ([`src/app/api/analytics/route.ts`](file:///d:/VibingSites/LINKLE/src/app/api/analytics/route.ts)) queries `AnalyticsEvent` records filtered by date range and groups them into:
- **Top Campaigns**: Ranked by click count, including the top source contributing to that campaign.
- **Top Sources**: Breakdown of visits by platform (`instagram`, `twitter`, `newsletter`, etc.).
- **Top Mediums**: Breakdown by distribution vehicle (`bio`, `email`, `social`, `cpc`, etc.).

### Dashboard Display
In [`AnalyticsDashboard.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/AnalyticsDashboard.tsx), the **"Campaign Performance (UTM)"** section renders interactive summary cards, horizontal progress bars, and percentage breakdowns. If no UTM clicks exist in the selected timeframe, a clean empty state guides the user on how to enable UTM tracking.

---

## 6. Verification & Automated Tests

Automated testing is maintained in [`scripts/test-utm-system.js`](file:///d:/VibingSites/LINKLE/scripts/test-utm-system.js) and can be executed via:
```bash
node scripts/test-utm-system.js
```

### Test Coverage:
- `buildUtmUrl`: Leaves disabled links unchanged.
- `buildUtmUrl`: Appends standard UTM parameters.
- `buildUtmUrl`: Preserves existing query parameters and hash anchors.
- `buildUtmUrl`: Encodes spaces, ampersands, and special characters.
- Security: Rejects `javascript:` and `data:` schemes.
- Database: Persists UTM parameters on `SocialLink` and `BusinessLink`.
- Ingestion: Extracts and indexes UTM parameters on `AnalyticsEvent`.
- Reporting: Aggregates counts by campaign, source, and medium accurately.
