# Linkle Public Profile Experience Redesign (UI-07)

## Overview

The public profile route (`/p/[username]`) is the visitor-facing touchpoint of Linkle. Unlike the internal dashboard—which is utilitarian, neutral, and productivity-focused—the public profile is built to embody the user's personal brand, creator identity, and conversion objectives.

This redesign implements a mobile-first, high-performance personal microsite experience that honors user customization while upholding strict visual hierarchy, readability, contrast safety, and speed.

---

## 1. Visual Hierarchy & 3-Second Rule

Within 3 seconds, a visitor can clearly answer:
1. **Who is this?** (Avatar, high-contrast Display Name, verified professional title)
2. **What do they do?** (Concise supporting bio and handle)
3. **What is the most important action?** (Prominent Featured Link or primary action card)
4. **Where should I click?** (Clear distinction between primary featured, secondary business, and utility links)
5. **How can I contact, pay, or follow them?** (Social icon strip, Linkle Pay UPI card, Contact actions, Location)

### Vertical Layout Sequence
```
[ Optional Edge-to-Edge Banner ]
           Avatar (natural overlap if banner present)
     Display Name
     Professional Title / Bio
      @username
 [ Primary / Featured Links ]
 [ Social Links Strip ]
 [ Custom / Business Links ]
 [ Linkle Pay & Payment Cards ]
 [ Contact Actions (vCard, Bookings, Resume) ]
 [ Email Capture Newsletter ]
 [ Location & Google Maps Navigation ]
 [ Linkle Attribution Footer ]
```

---

## 2. Header & Identity Presentation

### Avatar
- **Size & Aspect**: Rendered at `w-24 h-24` (mobile) to `w-28 h-28` (tablet/desktop) in a 1:1 circle.
- **Overlap Logic**: If a custom banner is present, avatar overlaps with negative top margin (`-mt-14 sm:-mt-16`), encircled with a 4px background-colored ring. If no banner is present, cleanly padded (`pt-8 sm:pt-12`) without awkward blank gaps.
- **Fallback**: Clean, themed monogram initial (`displayName[0]`) when no image is uploaded.

### Banner
- **Aspect Ratio**: 3:1 (`aspect-[3/1]`) or `h-36 sm:h-48`.
- **Zero Blank Space**: If the user has not uploaded a banner image, no empty container or generic placeholder box is rendered.
- **Image Optimization**: Cloudinary / Next.js Image with `object-fit: cover` and lazy loading.

### Typography & Name
- Prominent `<h1>` for the display name (`text-2xl sm:text-3xl font-bold tracking-tight`).
- Supporting bio rendered with comfortable reading line height (`text-sm leading-relaxed max-w-md mx-auto`).
- Username `@handle` rendered in subtle tertiary text (`text-xs font-mono font-medium`).
- **No Fake Verification**: Hardcoded fake verification badges have been eliminated. Only verified system badges will render if authenticated by backend trust services.

---

## 3. Call-to-Action & Link Architecture

### Featured Links vs. Standard Links
- **Featured Links**: Elevated with a subtle user-primary accent indicator (`border-l-4 border-[var(--user-primary)]`), slightly larger typography, badge tag (`Featured`), and high visual contrast.
- **Standard Links**: Clean, scannable cards with 44px+ touch targets, thumbnail previews, short descriptions, and directional indicators (`ArrowUpRight`).
- **Button Styles**: Automatically renders in the user's selected style (`rounded`, `square`, `pill`, or `outline`).
- **Scheduling**: Filtered strictly on the server—expired or future-scheduled links never leak to public HTML or client bundles.

---

## 4. Payment Experience & Linkle Pay UPI

Payments are one of Linkle's core differentiators. The payment experience is elevated without turning the profile into a generic checkout page.

### Linkle Pay (UPI)
- **Payee Identity**: Explicitly presents "Pay [Display Name]" and payee VPA (`vpa@bank`) to prevent spoofing or recipient confusion.
- **Platform-Aware Interaction**:
  - **Mobile Visitors**: Prominent primary button: **"Pay via UPI App"** deep-linking via `upi://pay?pa=...&pn=...&cu=INR`.
  - **Desktop Visitors**: Prominent primary button: **"Scan QR"** opening the high-contrast `UpiPayModal`.
- **UPI Modal**:
  - Crisp, scannable QR code (`QRCodeSVG`, level `H`, 200px) with white background border for guaranteed scan reliability.
  - Secondary actions: **"Copy UPI ID"** (with instant clipboard feedback) and **"Download QR"** (generates high-res PNG canvas download).
  - Native Web Share API integration to easily forward payment instructions.
  - **Zero Fake Claims**: Never claims "Payment Successful" or "Verified" without server confirmation; messaging remains transparent ("Payment initiated in your UPI app").

### Global Payments (PayPal, Stripe, Crypto)
- Expandable payment cards for non-UPI channels.
- One-click copy for crypto wallet addresses.
- Direct redirection for Stripe/PayPal payment checkout links.

---

## 5. Contact Actions & vCard Generation

- **Save Contact (vCard 3.0)**: Client-side generation of standard `.vcf` contact cards (`BEGIN:VCARD ... END:VCARD`) including Display Name, phone numbers, email, and Linkle profile URL. Triggered directly without server latency or data leakage.
- **Appointments & Bookings**: Integrated calendar links (Calendly, Cal.com) opening securely in external tabs.
- **Resume Download**: Secure download action for hosted resumes.
- **Suppression**: Contact actions section is completely suppressed if no actions are configured.

---

## 6. Email Capture

- **Native Styling**: Inherits the profile container's font, background tone, and button curvature.
- **UX States**: Comprehensive handling for `loading` ("Subscribing..."), `success` ("You're subscribed!"), `duplicate` ("You're already subscribed"), and `invalid` ("Enter a valid email address").
- **Privacy & Rate Limiting**: Preserves backend rate limiting and validation without exposing database or API internals.

---

## 7. Location & Navigation

- **Compact Presentation**: Address rendered with `MapPin` icon and clear text hierarchy.
- **Actions**:
  - **"Get Directions"**: Direct link to Google Maps navigation (`maps.google.com/?q=...`).
  - **"View Map" / "Hide Map"**: Lazy-expanded Google Maps iframe embed, preventing initial page weight inflation on slow mobile connections.
- **Suppression**: Section is omitted if location data is not configured.

---

## 8. Theme System & Visual Safety

The public profile supports full creator expression through user-defined themes while guaranteeing legibility.

### Theme Variables Injected
- `--user-primary`: User's brand color applied to accent borders, QR highlights, and primary buttons.
- `theme.backgroundColor`: Hex, subtle gradient, or dark mode background.
- `theme.fontFamily`: Curated typography (Inter, Outfit, Plus Jakarta Sans, DM Sans, Playfair Display, Fira Code).
- `theme.buttonStyle`: `rounded` (rounded-xl), `pill` (rounded-full), `square` (rounded-none), or `outline` (border-2 with transparent fill).

### Accessibility & Contrast Safeguards
- Dynamic text luminance calculations (`getContrastingColor`) guarantee that button text is `#FFFFFF` on dark colors and `#111827` on light colors.
- Subtle ambient background blobs honor `prefers-reduced-motion` media queries.

---

## 9. Performance & SEO

### Server-Side Rendering & Caching
- Fully server-rendered in Next.js App Router (`/src/app/p/[username]/page.tsx`).
- Leverages Next.js tag-based cache revalidation (`profile-${username}`).
- Zero duplicate API calls or unnecessary client-side fetch waterfalls.

### Image Optimization
- Next.js Image optimization for avatars and banners.
- Cloudinary auto-format (`f_auto`, `q_auto`) where URLs originate from Cloudinary.
- Strict aspect ratio sizing preventing Cumulative Layout Shift (CLS).

### Structured Data (JSON-LD)
- Generates dynamic Schema.org `Person` or `Organization` metadata with name, description, URL, and `sameAs` social links.
- Generates Open Graph (`og:title`, `og:description`, `og:image`) and Twitter Card tags.

---

## 10. Analytics Preservation

All visitor interactions continue to flow through the centralized `handleContainerClick` event delegation system:
- `data-track-type="link"` (Business links)
- `data-track-type="social"` (Social profile clicks)
- `data-track-type="payment"` (UPI / payment button triggers)
- `data-track-type="contact"` (vCard and contact actions)

UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`) are dynamically appended to outbound links when configured by the profile owner.
