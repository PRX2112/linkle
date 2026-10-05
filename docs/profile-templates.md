# Guided Onboarding & Profile Templates System

## Overview

Linkle's Profile Templates & Guided Onboarding System streamlines the first-time user experience for new creators, developers, freelancers, and businesses. Instead of confronting an empty configuration screen with multiple complex settings, users are presented with a guided, skippable onboarding wizard that initializes sensible defaults for their craft.

### Key Principles

1. **Non-Intrusive & Skippable**: Users can dismiss onboarding at any step ("Skip for now" or "Start from scratch"). Once completed or skipped, the system records `onboardingCompleted = true` and will never repeatedly show onboarding.
2. **Zero Fake Production Data**: Linkle never fabricates user data. Templates do not invent fake names, fictitious emails, fake payment addresses, or dummy testimonials. Instead, they provide structured scaffolding: bio starters, suggested channel prefixes, pre-configured CTA cards with descriptive labels, and thematic color palettes.
3. **Full User Editability**: Every suggested link, bio headline, social channel, and CTA button can be edited or removed directly during onboarding or at any point in the Linkle dashboard.
4. **Permanent State Persistence**: Onboarding completion and template selection are stored in the PostgreSQL database and synced across devices.
5. **Re-accessible Gallery**: Existing users can browse and apply templates at any time via the **"Templates"** button on the dashboard toolbar.

---

## 1. The 9 Template Categories

Linkle provides 9 targeted profiles plus an unconfigured "Start from scratch" option:

| Template | Icon | Primary Accent | Button Style | Target Audience | Primary Focus |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Creator** | 🎬 | `#8b5cf6` (Purple) | Pill | Video creators, podcasters, digital artists | Video drops, gear kit, brand deals |
| **Freelancer** | 💼 | `#10b981` (Emerald) | Rounded | Consultants, designers, independent pros | Case studies, pricing guide, discovery call |
| **Developer** | 💻 | `#06b6d4` (Cyan) | Rounded | Software engineers, OSS builders, tech leads | GitHub repos, tech blog, live web demos |
| **Photographer** | 📷 | `#f59e0b` (Amber) | Pill | Visual artists, portrait & commercial photographers | Photo gallery, shoot booking, preset shop |
| **Influencer** | ✨ | `#ec4899` (Rose) | Pill | Lifestyle, fashion, beauty & brand ambassadors | Shop outfits, promo codes, media kit |
| **Business** | 🏢 | `#3b82f6` (Blue) | Rounded | Startups, agencies, brands, local businesses | Product suite, enterprise demo, case studies |
| **Coach** | 🎯 | `#7c3aed` (Violet) | Pill | Mindset, executive, fitness & career coaches | Mentorship application, strategy call |
| **Job Seeker** | 📄 | `#0284c7` (Sky) | Rounded | Professionals seeking their next high-impact role | Resume PDF, selected work, recommendations |
| **Student** | 🎓 | `#14b8a6` (Teal) | Pill | University students, researchers, campus leaders | Academic projects, student resume, clubs |
| **Start from scratch** | ⚡ | `#6366f1` (Indigo) | Pill | Users wanting a blank slate | Completely blank profile canvas |

---

## 2. Sensible Defaults & Scaffolding Breakdown

Each template pre-configures sensible defaults across six key profile dimensions:

### 1. Profile Bio Scaffolding
- **Creator**: *"Content creator & digital storyteller 🎬 Sharing weekly videos, projects & behind-the-scenes."*
- **Freelancer**: *"Independent specialist helping clients scale, design & launch high-impact digital projects."*
- **Developer**: *"Full-stack engineer & open-source builder 💻 Turning ideas into fast, resilient software."*
- **Photographer**: *"Commercial & editorial photographer capturing natural light, raw emotion & timeless stories 📸"*
- **Influencer**: *"Daily lifestyle, travel & wellness ✨ Inspiring intentional everyday living and joyful discovery."*
- **Business**: *"Delivering modern software solutions and premium products built for ambitious teams 🚀"*
- **Coach**: *"Certified mindset & performance coach 🎯 Empowering leaders to reach clarity, habits & peak potential."*
- **Job Seeker**: *"Product-minded professional actively seeking new opportunities in high-growth tech & design 🔍"*
- **Student**: *"Undergraduate student & aspiring researcher 🎓 Exploring technology, design & collaborative problem solving."*

### 2. Suggested Social Channels
Pre-populates the platforms most relevant to the role with official link prefixes:
- **Developer**: GitHub (`github.com/`), Twitter / X (`x.com/`), LinkedIn (`linkedin.com/in/`)
- **Photographer**: Instagram (`instagram.com/`), Behance (`behance.net/`), Portfolio Website
- **Creator**: YouTube (`youtube.com/@`), Instagram (`instagram.com/`), Twitter / X (`x.com/`)
- **Freelancer**: LinkedIn (`linkedin.com/in/`), Twitter / X (`x.com/`), Portfolio Website
- **Business**: LinkedIn (`linkedin.com/company/`), Twitter / X (`x.com/`), Company Website

### 3. Suggested CTAs & Business Links
Pre-creates high-converting action links with starter titles and descriptions:
- **Developer**: *"Open Source Repositories"*, *"Technical Blog & Architecture Notes"*, *"Live Product Demos"*
- **Freelancer**: *"Client Case Studies & Work"*, *"Services & Engagement Pricing"*, *"Schedule a Discovery Call"*
- **Coach**: *"Apply for 1-on-1 Mentorship"*, *"Free 15-Minute Strategy Alignment Call"*, *"Client Testimonials & Transformations"*
- **Job Seeker**: *"Download Full Resume / CV (PDF)"*, *"Selected Case Studies & Impact"*, *"Peer Recommendations & References"*

### 4. Email Capture Scaffolding
- Enables Linkle's built-in newsletter capture module with tailored messaging:
  - *Developer*: "Developer Newsletter — Get notified when I ship new tools"
  - *Freelancer*: "Get My Client Playbook — Enter your work email address"
  - *Creator*: "Join my VIP Creator Community — Enter your email for weekly drops"

### 5. Contact Actions
- Pre-configures contact actions based on user needs:
  - `book_appointment` for Coaches, Freelancers, Photographers, and Businesses.
  - `download_resume` for Job Seekers, Students, and Freelancers.
  - `vcard` for Developers and Businesses.

---

## 3. Database Schema

The `User` model in [`prisma/schema.prisma`](file:///d:/VibingSites/LINKLE/prisma/schema.prisma) was extended with two non-breaking fields:

```prisma
model User {
  // ... existing fields ...
  
  // Onboarding & Template Settings
  onboardingCompleted Boolean @default(false)
  selectedTemplate    String?

  // ... relations ...
}
```

- When a new user registers, `onboardingCompleted` defaults to `false`.
- When a user finishes onboarding or clicks "Skip for now", `onboardingCompleted` is updated to `true`.
- Subsequent visits to `/dashboard` inspect this flag to ensure the wizard is not re-displayed.

---

## 4. Architecture & Reusable Component System

Instead of hardcoding separate pages for each template, Linkle uses a modular, data-driven architecture:

1. **Definitions Registry** ([`src/lib/templates/definitions.ts`](file:///d:/VibingSites/LINKLE/src/lib/templates/definitions.ts)):
   - Single source of truth containing definitions and configuration objects for all 9 templates.
2. **Template Application Service** ([`src/lib/templates/apply.ts`](file:///d:/VibingSites/LINKLE/src/lib/templates/apply.ts)):
   - Transactional database applicator (`applyTemplate` and `skipOnboarding`).
   - Verifies URL safety (rejecting `javascript:` and unsafe protocols) before creating links.
   - Synchronizes profile revalidation cache.
3. **API Route** ([`src/app/api/onboarding/route.ts`](file:///d:/VibingSites/LINKLE/src/app/api/onboarding/route.ts)):
   - `GET`: Returns the user's onboarding status and available template definitions.
   - `POST`: Validates inputs with `OnboardingApplySchema` and applies the template or executes skip.
4. **Interactive Wizard** ([`src/components/dashboard/OnboardingWizard.tsx`](file:///d:/VibingSites/LINKLE/src/components/dashboard/OnboardingWizard.tsx)):
   - Step 1: Visual category grid with icons, descriptions, and taglines.
   - Step 2: Customization panel where users can modify the bio, change theme colors, enter social handles, and adjust CTAs.
   - Step 3: Success state with instant dashboard launch.
   - Real-time synchronization with `<MobilePreview />` via `usePreview()`.

---

## 5. API Reference

### `GET /api/onboarding`
Retrieves current user onboarding state and available templates.

**Response:**
```json
{
  "onboardingCompleted": false,
  "selectedTemplate": null,
  "templates": [
    {
      "id": "creator",
      "name": "Creator",
      "tagline": "Video creators, writers, podcasters & digital artists",
      "badgeColor": "#8b5cf6",
      "theme": { "primaryColor": "#8b5cf6", "buttonStyle": "pill", "fontFamily": "Inter" },
      "bioScaffolding": "...",
      "suggestedSocial": [...],
      "suggestedBusinessLinks": [...]
    }
  ]
}
```

### `POST /api/onboarding`
Applies a template configuration or skips onboarding.

**Payload (Apply Template):**
```json
{
  "action": "apply",
  "templateId": "developer",
  "bio": "Full-stack engineer & open-source builder 💻",
  "themePrimaryColor": "#06b6d4",
  "themeButtonStyle": "rounded",
  "emailCaptureEnabled": true,
  "emailCaptureTitle": "Developer Newsletter",
  "socialLinks": [
    { "platform": "github", "url": "https://github.com/myusername", "label": "GitHub" }
  ],
  "businessLinks": [
    { "title": "Open Source Repos", "url": "https://github.com/myusername", "description": "My projects" }
  ]
}
```

**Payload (Skip / Start from scratch):**
```json
{
  "action": "skip",
  "templateId": "scratch"
}
```

---

## 6. Automated Testing & Verification

Automated test suite is maintained in [`scripts/test-templates-onboarding.js`](file:///d:/VibingSites/LINKLE/scripts/test-templates-onboarding.js):
```bash
node scripts/test-templates-onboarding.js
```

### Verified Test Cases:
- All 9 templates + scratch defined with required properties.
- Database migration of `onboardingCompleted` and `selectedTemplate` columns.
- Starting from scratch sets `onboardingCompleted = true` without injecting unwanted links.
- Applying templates (`developer`, `photographer`, `freelancer`, etc.) persists bios, themes, social channels, and CTAs.
- No fake personal data (no dummy names, fake emails, or fake payments) is introduced.
- Users can remove any suggested item before or after applying.
- Skipping onboarding persists `onboardingCompleted = true` and avoids re-triggering.
