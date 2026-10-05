import { z } from "zod";

// List of restricted usernames to protect core routes and administrative domains
export const RESERVED_USERNAMES = [
  "admin", "administrator", "login", "register", "signup", "signin",
  "signout", "logout", "dashboard", "settings", "analytics", "monetization",
  "api", "auth", "forgot-password", "reset-password", "verify-email", "p", "demo",
  "linkle", "support", "status", "help", "billing", "pricing", "webhook",
  "webhooks", "oauth", "oauth2", "user", "users", "profile", "profiles",
  "root", "sysadmin", "system", "index", "home", "about", "contact",
  "privacy", "terms", "legal", "config", "setup", "install", "update",
  "upgrade", "download", "static", "assets", "public", "private",
  "sitemap", "robots", "favicon", "mail", "app", "null", "undefined",
];

// Helper for optional URLs that can also be empty strings
const optionalUrlSchema = z.union([z.string().url(), z.string().length(0)]).nullable().optional();

// User Profile PATCH schema (/api/user/profile)
export const UserProfileSchema = z.object({
  displayName: z.string().max(50, "Display name must not exceed 50 characters").nullable().optional(),
  bio: z.string().max(160, "Bio must not exceed 160 characters").nullable().optional(),
  avatarUrl: optionalUrlSchema,
  bannerUrl: optionalUrlSchema,
  themePrimaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Theme primary color must be a valid hex color code").optional(),
  themeButtonStyle: z.enum(["pill", "rounded", "square", "outline"], {
    message: "Button style must be one of: pill, rounded, square, outline",
  }).optional(),
  themeFontFamily: z.string().max(50, "Font family must not exceed 50 characters").optional(),
  locationAddress: z.string().max(200, "Address must not exceed 200 characters").nullable().optional(),
  locationGoogleMapsEmbedUrl: z.union([
    z.string().url("Must be a valid URL starting with http:// or https://").regex(/^https:\/\/(?:[a-zA-Z0-9-]+\.)*google\.[a-z.]+\/maps\/embed\b/, "Must be a valid Google Maps embed URL"),
    z.string().length(0)
  ]).nullable().optional(),
  locationShowDirectionsBtn: z.boolean().optional(),
  locationIsVisible: z.boolean().optional(),
  emailCaptureEnabled: z.boolean().optional(),
  emailCaptureTitle: z.string().max(100, "Email capture title must not exceed 100 characters").optional(),
  emailCapturePlaceholder: z.string().max(50, "Email capture placeholder must not exceed 50 characters").optional(),
});

// User Settings PATCH schema (/api/user/settings)
export const UserSettingsSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores")
    .refine(
      (username) => !RESERVED_USERNAMES.includes(username.toLowerCase()),
      { message: "This username is reserved and cannot be used" }
    ),
  displayName: z.string().max(50, "Display name must not exceed 50 characters").optional(),
});

// Strong Password policy schema (min 8 chars, max 100 chars)
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters");

// User Registration schema (/api/register)
export const UserRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: PasswordSchema,
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, hyphens, and underscores")
    .refine(
      (username) => !RESERVED_USERNAMES.includes(username.toLowerCase()),
      { message: "This username is reserved and cannot be used" }
    ),
});

// Generic Visibility Toggle PATCH schema
export const LinkToggleSchema = z.object({
  isVisible: z.boolean({ message: "isVisible status is required" }),
});

// Generic Reorder POST schema
export const LinkReorderSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().cuid("Invalid ID format"),
      order: z.number().int().nonnegative("Order must be a non-negative integer"),
    })
    , { message: "Links array is required" }),
});

const utmSchemaFields = {
  utmEnabled: z.boolean().optional(),
  utmSource: z.string().max(100, "UTM Source must not exceed 100 characters").nullable().optional(),
  utmMedium: z.string().max(100, "UTM Medium must not exceed 100 characters").nullable().optional(),
  utmCampaign: z.string().max(100, "UTM Campaign must not exceed 100 characters").nullable().optional(),
  utmContent: z.string().max(100, "UTM Content must not exceed 100 characters").nullable().optional(),
  utmTerm: z.string().max(100, "UTM Term must not exceed 100 characters").nullable().optional(),
};

// Social Link schemas
export const SocialLinkCreateSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().min(1, "URL or handle is required"),
  label: z.string().max(50, "Label must not exceed 50 characters").nullable().optional(),
  ...utmSchemaFields,
});

export const SocialLinkUpdateSchema = z.object({
  platform: z.string().min(1, "Platform is required").optional(),
  url: z.string().min(1, "URL or handle is required").optional(),
  label: z.string().max(50, "Label must not exceed 50 characters").nullable().optional(),
  startDate: z.string().datetime({ message: "Invalid startDate format (must be ISO-8601 string)" }).nullable().optional(),
  endDate: z.string().datetime({ message: "Invalid endDate format (must be ISO-8601 string)" }).nullable().optional(),
  featured: z.boolean().optional(),
  ...utmSchemaFields,
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be before endDate",
  path: ["endDate"],
});

// Business Link schemas
export const BusinessLinkCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  url: z.string().url("Must be a valid URL starting with http:// or https://").refine(
    (val) => {
      const lower = val.toLowerCase().trim();
      return !lower.startsWith("javascript:") && !lower.startsWith("data:") && !lower.startsWith("vbscript:");
    },
    { message: "Unsafe URL scheme detected. Only http:// and https:// URLs are allowed." }
  ),
  description: z.string().max(200, "Description must not exceed 200 characters").nullable().optional(),
  thumbnailUrl: optionalUrlSchema,
  ...utmSchemaFields,
});

export const BusinessLinkUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters").optional(),
  url: z.string().url("Must be a valid URL starting with http:// or https://").refine(
    (val) => {
      const lower = val.toLowerCase().trim();
      return !lower.startsWith("javascript:") && !lower.startsWith("data:") && !lower.startsWith("vbscript:");
    },
    { message: "Unsafe URL scheme detected. Only http:// and https:// URLs are allowed." }
  ).optional(),
  description: z.string().max(200, "Description must not exceed 200 characters").nullable().optional(),
  thumbnailUrl: optionalUrlSchema,
  startDate: z.string().datetime({ message: "Invalid startDate format" }).nullable().optional(),
  endDate: z.string().datetime({ message: "Invalid endDate format" }).nullable().optional(),
  featured: z.boolean().optional(),
  ...utmSchemaFields,
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be before endDate",
  path: ["endDate"],
});

// Payment Link schemas
export const PaymentLinkCreateSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  value: z.string().min(1, "Value / handle / URL is required"),
});

export const PaymentLinkUpdateSchema = z.object({
  platform: z.string().min(1, "Platform is required").optional(),
  value: z.string().min(1, "Value / handle / URL is required").optional(),
  startDate: z.string().datetime({ message: "Invalid startDate format" }).nullable().optional(),
  endDate: z.string().datetime({ message: "Invalid endDate format" }).nullable().optional(),
  featured: z.boolean().optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be before endDate",
  path: ["endDate"],
});

// Newsletter subscription schema (/api/subscribe)
export const SubscribeSchema = z.object({
  username: z.string().min(1, "Username is required").trim().toLowerCase(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

// Forgot Password schema (/api/auth/forgot-password)
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

// Reset Password schema (/api/auth/reset-password)
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: PasswordSchema,
});

// Email verification schemas (/api/auth/verify-email)
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

export const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

// Onboarding schemas (/api/onboarding)
export const OnboardingApplySchema = z.object({
  action: z.enum(["apply", "skip"]).default("apply"),
  templateId: z.enum([
    "creator",
    "freelancer",
    "developer",
    "photographer",
    "influencer",
    "business",
    "coach",
    "job_seeker",
    "student",
    "scratch",
  ]),
  displayName: z.string().max(50).optional(),
  bio: z.string().max(200).optional(),
  themePrimaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  themeButtonStyle: z.enum(["pill", "rounded", "square"]).optional(),
  emailCaptureEnabled: z.boolean().optional(),
  emailCaptureTitle: z.string().max(100).optional(),
  emailCapturePlaceholder: z.string().max(50).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    label: z.string().optional(),
  })).optional(),
  businessLinks: z.array(z.object({
    title: z.string().min(1),
    url: z.string(),
    description: z.string().optional(),
  })).optional(),
  contactActions: z.array(z.object({
    type: z.enum(["vcard", "book_appointment", "download_resume", "custom_form"]),
    label: z.string().min(1),
    url: z.string().optional(),
  })).optional(),
  paymentValue: z.string().optional(),
  paymentPlatform: z.string().optional(),
});

// Profile Import schemas (/api/links/import)
export const ImportParseSchema = z.object({
  action: z.literal("parse"),
  rawText: z.string().max(5000, "Input is too long (max 5,000 characters)").optional(),
  urls: z.array(z.string().max(500)).max(50, "Maximum 50 URLs per batch").optional(),
});

export const ImportCommitSchema = z.object({
  action: z.literal("commit"),
  items: z.array(
    z.object({
      entryType: z.enum(["social", "business"]),
      platform: z.string().optional(),
      url: z.string().url("Valid URL required"),
      label: z.string().max(100).optional(),
      title: z.string().max(100).optional(),
      description: z.string().max(200).optional(),
    })
  ).min(1, "At least one item must be confirmed").max(50),
});

// Billing Checkout Schema (/api/billing/checkout)
export const BillingCheckoutSchema = z.object({
  plan: z.enum(["Pro", "Enterprise", "PRO", "ENTERPRISE"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

