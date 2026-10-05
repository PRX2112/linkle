# Linkle UI/UX Reform — Step UI-04: Appearance & Profile Customization

## Overview

Step **UI-04** transforms the Appearance experience from a lengthy, undifferentiated form into a visual profile editor. The redesigned workspace aligns with the **UI-01 Design System** (neutral elevated surfaces, clear typography, restrained brand accents) and integrates with the **UI-02 Dashboard Shell** and live preview architecture.

---

## 1. Page Structure & Information Hierarchy

The Appearance workspace is structured to prioritize immediate comprehension: *"What does my profile look like?"* and *"How do I change it?"*

### Layout Architecture
```
┌────────────────────────────────────────────────────────┬──────────────────────┐
│  Appearance                                            │                      │
│  Customize how your Linkle profile looks and feels.    │     LIVE PREVIEW     │
│  [ View live ↗ ] [ Save changes ]                      │                      │
│                                                        │       (PHONE)        │
│  ┌──────────────────────────────────────────────────┐  │                      │
│  │ [ Profile ]  [ Design ] [ Typography ] [Sections]│  │   • Instant preview  │
│  └──────────────────────────────────────────────────┘  │   • Live themes      │
│                                                        │   • Fonts & shapes   │
│  [ Active Category Editing Workspace ]                 │   • Mobile/desktop   │
│                                                        │                      │
│  ┌──────────────────────────────────────────────────┐  │                      │
│  │ ● Unsaved changes          [ Discard ] [ Save ]  │  │                      │
│  └──────────────────────────────────────────────────┘  │                      │
└────────────────────────────────────────────────────────┴──────────────────────┘
```

### Hierarchy of Controls
1. **Profile Identity**: Display name, bio/subtitle, circular avatar upload, wide banner cover upload.
2. **Design & Theming**: 8 curated color presets, custom accent hex picker with validation, and 4 geometric button style options.
3. **Typography**: 7 distinctive font families rendered in their real typeface with editorial previews and category badges.
4. **Profile Sections**: Location map settings (address, embed URL, directions button) and Email capture newsletter configuration.
5. **State & Persistence**: Real-time unsaved changes detection, keyboard shortcuts (`Cmd/Ctrl+S`), discard safety, and responsive floating action bar.

---

## 2. Editor Navigation & Segmented Tabs

Instead of displaying every field at once, the editor is organized into 4 focused tabs with clean segmented navigation:

| Tab | Icon | Scope & Controls |
| :--- | :--- | :--- |
| **Profile** | `User` | Display name (50 chars), Bio (160 chars), Avatar photo, Header banner. |
| **Design** | `Palette` | 8 Theme presets, custom accent hex color picker, button style selector. |
| **Typography** | `Type` | 7 Font choices rendered dynamically with sample typography. |
| **Sections** | `Layers` | Location (address, Google Maps embed, directions toggle) and Email capture. |

---

## 3. Profile Identity & Media Uploads

- **Character Counters**: Real-time tabular numbers indicate length for Display Name (`/50`) and Bio (`/160`), turning red if exceeded.
- **Avatar Photo**: Circular preview with existing image or fallback initials. Automatically compresses client-side before Cloudinary upload.
- **Header Banner**: 16:9 banner preview with dimension guidance (*Recommended: 1920 × 480 px*).
- **Upload States**: Informative, non-intrusive status messages (*Preparing...*, *Uploading...*, *Saved*).

---

## 4. Design & Theme Experience

### Theme Presets
8 curated themes provide instant color harmony across public profiles:
1. **Indigo** (`#6366f1`) — Modern purple-blue
2. **Rose** (`#f43f5e`) — Vibrant crimson rose
3. **Amber** (`#f59e0b`) — Warm golden sunlight
4. **Emerald** (`#10b981`) — Fresh natural green
5. **Sky** (`#0ea5e9`) — Clean electric azure
6. **Fuchsia** (`#d946ef`) — Bold luminous magenta
7. **Cyan** (`#06b6d4`) — Crisp tropical teal
8. **Minimal** (`#737373`) — Monochromatic slate

Each swatch displays a circular color swatch, preset title, hex value, checkmark indicator when selected, and accessible `aria-checked` state.

### Custom Accent Color
- Native color picker input overlay paired with an uppercase `#RRGGBB` text input.
- Real-time regex validation (`^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`).
- "Reset to default" button restores brand default `#6366f1`.
- Live preview updates synchronously on each color change.

### Button Style Selector
4 distinct shapes rendered as interactive mini-buttons in the user's chosen primary color:
- **Pill**: Fully rounded capsule shape (`rounded-full`)
- **Rounded**: Softly curved modern corners (`rounded-xl`)
- **Square**: Sharp architectural corners (`rounded-none`)
- **Outline**: Transparent fill with primary color border

---

## 5. Typography

Profiles support 7 font families, each loaded and rendered in its own typeface within the selection interface:
- **Inter**: Modern, neutral sans-serif
- **Poppins**: Friendly geometric sans
- **DM Sans**: Balanced editorial sans
- **Space Grotesk**: Monospace-inspired tech sans
- **Syne**: Avant-garde bold display
- **Playfair Display**: Sophisticated modern serif
- **Roboto Mono**: Technical monospace aesthetic

Selected typeface is applied instantly to `PreviewContext` and rendered in the live mobile preview frame.

---

## 6. Profile Sections

### Location & Google Maps
- **Visibility Toggle**: Controls whether location appears on the public profile.
- **Address Field**: Text input with `MapPin` icon for studio/office/city.
- **Embed URL Guidance**: Accordion guide explaining step-by-step how to extract the embed URL from Google Maps (`https://www.google.com/maps/embed?pb=...`).
- **Directions Button**: Toggle to enable/disable the 1-click Google Maps directions button.
- **Preview Integration**: `LocationSection` renders in the preview phone only when an address or embed URL is configured and visibility is enabled.

### Email Capture Newsletter
- **Enable Toggle**: Turns subscriber email collection on or off.
- **Title & Placeholder**: Customizable card header and field placeholder.
- **Interactive Mini-Preview**: Visual demonstration in the editor showing how the newsletter signup card appears with the active button style and theme color.

---

## 7. Save Behavior & Optimistic Synchronization

- **Unsaved Changes Tracking**: Deep comparison between working `form` state and `savedSnapshot`.
- **Floating Action Bar**: Displays an amber pulse indicator with *Discard* and *Save* buttons whenever changes exist.
- **Page Unload Protection**: `beforeunload` event handler prevents accidental navigation loss.
- **Keyboard Shortcut**: `Cmd+S` / `Ctrl+S` triggers immediate save.
- **Instant Preview**: All edits dispatch to `PreviewContext.updatePreviewUser()`, giving sub-millisecond visual feedback without network lag.

---

## 8. Accessibility & Responsiveness

- **Semantic HTML**: Form inputs with associated `<label htmlFor>`, `<button type="button">`, and proper ARIA roles (`role="radiogroup"`, `role="radio"`, `role="tab"`).
- **Visual & Non-Visual State**: Selected themes and fonts utilize both checkmark icons and `aria-checked` attributes so state is never communicated through color alone.
- **Responsive Layout**:
  - **Desktop (1280px+)**: Side-by-side editing workspace and docked live preview phone.
  - **Tablet (768px - 1024px)**: Full-width comfortable form with floating save bar and header preview trigger.
  - **Mobile (360px - 430px)**: Compact segmented tabs, touch targets (minimum 44px), and bottom floating bar formatted cleanly above mobile viewports.
