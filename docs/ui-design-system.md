# Linkle UI/UX Design System Foundation (UI-01)

This document outlines the foundation of Linkle's visual design system. The application has transitioned away from generic, high-noise "AI SaaS" tropes (oversized neon glow shadows, harsh gradient washes everywhere, excessive rounded cards, and nested card-in-card layouts) toward a calm, professional, human-designed, and trustworthy product experience.

---

## 1. Core Design Principles

1. **Use Fewer Visual Containers**: Prefer whitespace, typography, alignment, and subtle borders over decorative cards-within-cards and glowing containers.
2. **Restrained Elevation**: Avoid oversized neon glow effects. Use natural, ambient, multi-stop shadows (`shadow-subtle`, `shadow-card`, `shadow-raised`, `shadow-overlay`, `shadow-modal`).
3. **Intentional Accent**: The Linkle purple/indigo accent is used purposefully for primary interactive triggers, active navigation indicators, and focused inputs, rather than covering every button and panel in a neon gradient.
4. **Accessible by Default**: Keyboard focus rings (`:focus-visible`), WCAG AA contrast compliance, semantic elements, and reduced-motion overrides are built into every component.

---

## 2. Application UI vs. User Profile Themes

> [!IMPORTANT]
> **Crucial Distinction**: There are two distinct visual systems in Linkle:

### A. Linkle Application UI
- **Scope**: Dashboard, settings, analytics, billing, authentication, and marketing pages.
- **Visual Style**: Clean neutral surfaces, refined indigo brand accents, high-contrast dark neutral typography, and calm borders. Governed entirely by Tailwind design tokens and CSS custom properties defined in `src/app/globals.css`.

### B. User Profile Themes
- **Scope**: Public profile pages (`/p/[username]`, `/p/demo`) and live mobile previews.
- **Visual Style**: Completely customized by each individual creator or business (custom primary colors, custom Google Fonts, user button shapes, custom background colors).
- **Rule**: The application design system **never** flattens or removes the user's custom profile styling. Public profiles utilize `--user-primary` and dynamic fonts configured in `AppearanceForm`.

---

## 3. Design Tokens

### A. Color Tokens

#### Application Surfaces & Backgrounds
| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--app-bg` | `#f8fafc` | `#09090b` | Application canvas background |
| `--app-surface` | `#ffffff` | `#121215` | Default card and dialog surface |
| `--app-surface-subdued` | `#f1f5f9` | `#18181b` | Subdued surface (headers, tables, input bg) |
| `--app-surface-hover` | `#f1f5f9` | `#27272a` | Hover state on neutral interactive elements |
| `--app-border` | `#e2e8f0` | `#27272a` | Default structural borders |
| `--app-border-subtle` | `#f1f5f9` | `#18181b` | Dividers and faint section separators |
| `--app-border-strong` | `#cbd5e1` | `#3f3f46` | Emphasized or active boundaries |

#### Typography & Text
| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--text-primary` | `#0f172a` | `#f8fafc` | Primary titles, headlines, form values |
| `--text-secondary` | `#475569` | `#94a3b8` | Subtitles, descriptions, secondary copy |
| `--text-muted` | `#94a3b8` | `#64748b` | Captions, placeholders, metadata |
| `--text-inverted` | `#ffffff` | `#09090b` | High contrast text against solid fills |

#### Brand Accent (Linkle Indigo)
| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--brand-primary` | `#4f46e5` (`brand-600`) | `#6366f1` (`brand-500`) | Primary buttons, active indicators |
| `--brand-hover` | `#4338ca` (`brand-700`) | `#818cf8` (`brand-400`) | Interactive hover state |
| `--brand-subtle` | `#eef2ff` (`brand-50`) | `rgba(99, 102, 241, 0.12)` | Active tab pills, badge backgrounds |
| `--brand-ring` | `rgba(79, 70, 229, 0.25)` | `rgba(99, 102, 241, 0.35)` | Keyboard focus rings |

#### Status & Semantic Tints
| Status | Solid Value | Subtle Background Tint |
|---|---|---|
| **Success** | `#10b981` | Light: `#ecfdf5` / Dark: `rgba(16, 185, 129, 0.15)` |
| **Warning** | `#f59e0b` | Light: `#fffbeb` / Dark: `rgba(245, 158, 11, 0.15)` |
| **Error** | `#ef4444` | Light: `#fef2f2` / Dark: `rgba(239, 68, 68, 0.15)` |
| **Info** | `#3b82f6` | Light: `#eff6ff` / Dark: `rgba(59, 130, 246, 0.15)` |

---

### B. Typography Hierarchy

Font Family: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display** | 36px - 48px (`text-4xl` - `text-5xl`) | 800 (Bold) | 1.1 | Marketing hero headlines |
| **H1** | 28px - 32px (`text-2xl` - `text-3xl`) | 700 (Bold) | 1.2 | Page titles (Dashboard, Auth) |
| **H2** | 20px - 24px (`text-xl` - `text-2xl`) | 600 (Semibold) | 1.25 | Major section headings |
| **H3** | 16px - 18px (`text-base` - `text-lg`) | 600 (Semibold) | 1.3 | Card headers, modal titles |
| **Body Large** | 16px (`text-base`) | 400 - 500 | 1.5 | Featured descriptions |
| **Body Default**| 14px (`text-sm`) | 400 - 500 | 1.5 | Standard form inputs, buttons, body copy |
| **Body Small** | 12px (`text-xs`) | 400 - 500 | 1.4 | Helper text, badges, secondary metadata |
| **Caption/Micro**| 11px (`text-[11px]`) | 500 - 600 | 1.3 | Small badges, timestamp indicators |

---

### C. Spacing Scale

Linkle utilizes a 4px baseline grid:
- `1`: 4px (`gap-1`, `p-1`)
- `1.5`: 6px
- `2`: 8px (`gap-2`, `p-2`)
- `3`: 12px (`gap-3`, `p-3`)
- `4`: 16px (`gap-4`, `p-4`)
- `5`: 20px (`gap-5`, `p-5`)
- `6`: 24px (`gap-6`, `p-6`)
- `8`: 32px (`gap-8`, `p-8`)
- `10`: 40px (`gap-10`, `p-10`)
- `12`: 48px (`gap-12`, `p-12`)
- `16`: 64px (`gap-16`, `p-16`)

---

### D. Border Radius Scale

- `rounded-xs`: `4px` — Micro chips, sub-tags
- `rounded-sm`: `6px` — Small badges, inline tags
- `rounded-md`: `8px` — Buttons, inputs, dropdown items
- `rounded-lg`: `12px` — Standard buttons, tabs, input containers
- `rounded-xl`: `16px` — Cards, modals, feature sections
- `rounded-2xl`: `20px` — Prominent cards, standalone preview shells
- `rounded-full`: `9999px` — Avatars, pill badges, toggle switches

---

### E. Shadow Scale

Subtle, multi-layered natural ambient lighting replacing harsh neon glows:
- `shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` — Buttons, active tabs
- `shadow-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)` — Dashboard cards, containers
- `shadow-raised`: `0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)` — Hover elevations
- `shadow-overlay`: `0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)` — Dropdowns, popovers, tooltips
- `shadow-modal`: `0 24px 48px -12px rgba(0, 0, 0, 0.18)` — Modals and dialog overlays

---

## 4. Reusable UI Components Suite (`src/components/ui/`)

All reusable components are located in `src/components/ui/` and exported via `src/components/ui/index.ts`:

1. **`Button`**:
   - Variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`, `link`.
   - Sizes: `xs`, `sm`, `md`, `lg`.
   - Features: Built-in `isLoading` spinner with `aria-busy`, `leftIcon`, `rightIcon`, keyboard focus rings, and accessible disabled states.
2. **`Input`**:
   - Standard text, number, email, and password fields.
   - Supports `leftAddon` and `rightAddon` (e.g. prefix `linkle.me/p/`).
   - Supports `error` state with `aria-invalid` and red accent ring.
3. **`Textarea`**:
   - Multi-line input with error handling and consistent typography and focus styling.
4. **`Select`**:
   - Native and styled dropdown with custom chevron, accessibility states, and sizing.
5. **`Card`**:
   - Composable suite: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.
6. **`Badge`**:
   - Semantic variants: `default`, `brand`, `success`, `warning`, `error`, `outline`.
   - Sizes: `sm`, `md`.
7. **`Modal`**:
   - Accessible dialog with backdrop blur, `Escape` key dismissal, backdrop click closing, and `aria-modal="true"`.
8. **`Tabs`**:
   - WAI-ARIA compliant: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` with keyboard selection and pill or underline variants.
9. **`Toggle`**:
   - Accessible switch component (`role="switch"`, `aria-checked`) with integrated label and description.
10. **`FormField`**:
    - Composable form control wrapper with `FormLabel`, `FormHelperText`, and `FormErrorMessage`.
11. **`LoadingState`**:
    - `Skeleton` (pulse placeholder with rectangle, text, and circle shapes) and `Spinner` (accessible SVG loader).
12. **`EmptyState`**:
    - Calm, clean layout featuring icon, title, description, and primary CTA.
13. **`Alert` / `ErrorState`**:
    - Status banners (`info`, `success`, `warning`, `error`) with dismissal triggers and accessible roles.
14. **`Dropdown`**:
    - Click-outside and keyboard dismissal menu with items, icons, and dividers.
15. **`Tooltip`**:
    - Lightweight, accessible tooltip with keyboard focus activation.

---

## 5. Accessibility (A11y) Rules

1. **Focus Rings**:
   All interactive elements must exhibit visible keyboard focus indicators via `:focus-visible`. Default is:
   `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2`
2. **Color Contrast**:
   All text and icons satisfy minimum WCAG 2.1 AA standards (4.5:1 for body copy, 3:1 for large text and UI boundaries).
3. **Reduced Motion**:
   Users with `prefers-reduced-motion: reduce` configured in their OS have animations and transitions scaled to zero duration automatically via `@media (prefers-reduced-motion: reduce)` in `globals.css`.
4. **Screen Readers & ARIA**:
   - Modals use `role="dialog"` and `aria-modal="true"`.
   - Alerts use `role="alert"` (for errors/warnings) or `role="status"` (for info/success).
   - Toggles use `role="switch"` and `aria-checked`.
   - Tabs use `role="tablist"`, `role="tab"`, and `role="tabpanel"`.

---

## 6. Visual QA & Verification Results

- **Production Build (`npm run build`)**: 0 errors, 28/28 routes compiled cleanly.
- **Billing Test Suite**: 22/22 passed.
- **Profile Import Test Suite**: 17/17 passed.
- **Templates & Onboarding Test Suite**: 19/19 passed.
- **UTM Tracking Suite**: 12/12 passed.
- **Public Profile Compatibility**: Verified that `/p/[username]` and `/p/demo` render with full user-customized profile theme fidelity.
