# Linkle Authentication Experience Redesign (UI-09)

## 1. Overview & Architecture

The authentication experience spans four core visitor routes:
- `/login`: User sign-in via credentials or Google OAuth
- `/register`: New account creation with immediate auto-login and onboarding redirect
- `/forgot-password`: Account recovery with timing-attack and user-enumeration defense
- `/reset-password`: Token-verified password modification with expiration/consumption handling

All authentication flows share a unified, quiet, and trustworthy layout conforming to the UI-01 design system, rejecting distracting SaaS marketing graphics and floating background gradients.

---

## 2. Shared Components Architecture

All auth screens are built from reusable components in `src/components/auth/`:

| Component | Role | Description |
| :--- | :--- | :--- |
| `AuthLayout.tsx` | Page Shell | Centered column (`max-w-[420px]`), brand logo, responsive card, legal/help footer. |
| `PasswordField.tsx` | Form Control | Standardized password input with keyboard-accessible show/hide visibility toggle. |
| `AuthError.tsx` | Error Presentation | Accessible `role="alert"` alert box with concise, non-technical guidance. |
| `OAuthButtons.tsx` | Social Auth | Official Google OAuth sign-in button using Linkle UI-01 button tokens. |
| `LoginForm.tsx` | Client Interaction | Credential submission, client error handling, and redirection. |
| `RegisterForm.tsx` | Client Interaction | Name, handle prefix, password matching checklist, and automatic login. |
| `ForgotPasswordForm.tsx` | Client Interaction | Privacy-preserving password reset email request. |
| `ResetPasswordForm.tsx` | Client Interaction | Token validation, Suspense integration, and password update. |

---

## 3. Route Specifications & UX Behavior

### 3.1 Login (`/login`)
- **Server-Side Session Check**: An asynchronous Next.js Server Component checks `await auth()`. Authenticated sessions are immediately redirected to `/dashboard`, preventing screen flashing or client-side redirect loops.
- **Form Controls**:
  - Email: `autoComplete="email"`, required.
  - Password: `autoComplete="current-password"`, `PasswordField` with toggle.
  - Submitting state: `[ Signing in... ]` with disabled inputs.
- **Error Handling**: Displays safe, non-revealing error message: *"Invalid email or password."*

### 3.2 Register (`/register`)
- **Server-Side Session Check**: Authenticated users visiting `/register` are redirected directly to `/dashboard`.
- **Form Controls**:
  - Full Name: `autoComplete="name"`, max 50 chars.
  - Username: Auto-lowercases and filters special characters; includes visual `linklez.vercel.app/p/` prefix.
  - Email: `autoComplete="email"`.
  - Password & Confirm Password: `autoComplete="new-password"` with dynamic length check (min 8 chars) and real-time matching indicator.
- **Onboarding Transition**: Upon successful registration, the client invokes `signIn("credentials", ...)` and forwards the new user directly to `/dashboard?onboarding=true` to enter the guided template setup.

### 3.3 Forgot Password (`/forgot-password`)
- **Form Controls**: Email input with clear helper text.
- **Privacy Assurance**: The post-submission confirmation screen states:
  > *"If an account exists for {email}, a secure password reset link has been sent. Check your inbox and spam folder."*
  This preserves the backend's strict anti-enumeration security architecture.

### 3.4 Reset Password (`/reset-password`)
- **Suspense Integration**: The form is wrapped in a `<Suspense>` boundary to safely read the query string `?token=...` during SSR.
- **Missing Token State**: If no token is provided in the URL, renders a clear warning: *"Missing Reset Token. Please request a new link."*
- **Expired/Consumed Token State**: If the backend reports an expired or already consumed token (HTTP 400), gracefully displays: *"This reset link is no longer valid. It may have expired or already been used."* with a direct CTA to request a new link.
- **Success State**: Displays confirmation message and automatically redirects to `/login` after 2.5 seconds.

---

## 4. Security & Privacy Guarantees

1. **No Account Enumeration**: The UI never confirms or denies account existence during password reset requests.
2. **Timing Attack Protection**: Preserves server-side pseudo-hashing for non-existent users.
3. **Session Invalidation**: All sessions bound to a user's previous password signature (`pwdSig`) are automatically invalidated when a password is reset.
4. **Token Security**: Raw tokens are never stored in localStorage, cookies, or client logs. Only encrypted/hashed tokens are checked on the server.
5. **No Secret Exposure**: Zero Prisma, database, or environment variables are leaked to client bundles.

---

## 5. SEO & Indexing Rules

All auth endpoints have explicit `robots` headers configured:
- `/login`: `index: false, follow: false`
- `/register`: `index: false, follow: false`
- `/forgot-password`: `index: false, follow: false`
- `/reset-password`: `index: false, follow: false`

This prevents search engine crawlers from indexing authentication forms or crawling sensitive reset tokens.

---

## 6. Accessibility & Responsiveness

- **Keyboard Focus**: Visible focus rings (`focus:ring-2 focus:ring-brand-500/20`) on all inputs and buttons.
- **Password Visibility**: The toggle button has dynamic `aria-label` attributes ("Show password" / "Hide password") and does not intercept standard Enter-key form submission.
- **Screen Reader Announcements**: Error alerts utilize `role="alert"` for immediate screen-reader notification.
- **Mobile Comfort**: Tested on 360px, 390px, and 430px viewports with generous 44px+ touch targets and zero horizontal overflow.
