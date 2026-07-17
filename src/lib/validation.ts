import { z } from "zod";

// List of restricted usernames to protect core routes and administrative domains
export const RESERVED_USERNAMES = [
  "admin", "administrator", "login", "register", "signup", "signin",
  "signout", "logout", "dashboard", "settings", "analytics", "monetization",
  "api", "auth", "forgot-password", "reset-password", "p", "demo",
  "linkle", "support", "status", "help", "billing", "pricing", "webhook",
  "webhooks", "oauth", "oauth2", "user", "users", "profile", "profiles",
  "root", "sysadmin", "system", "index", "home", "about", "contact",
  "privacy", "terms", "legal", "config", "setup", "install", "update",
  "upgrade", "download", "static", "assets", "public", "private",
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
  locationAddress: z.string().max(200, "Address must not exceed 200 characters").nullable().optional(),
  locationGoogleMapsEmbedUrl: z.union([
    z.string().url("Must be a valid URL starting with http:// or https://").regex(/^https:\/\/(?:[a-zA-Z0-9-]+\.)*google\.[a-z.]+\/maps\/embed\b/, "Must be a valid Google Maps embed URL"),
    z.string().length(0)
  ]).nullable().optional(),
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

// User Registration schema (/api/register)
export const UserRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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

// Social Link schemas
export const SocialLinkCreateSchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().min(1, "URL or handle is required"),
  label: z.string().max(50, "Label must not exceed 50 characters").nullable().optional(),
});

export const SocialLinkUpdateSchema = z.object({
  platform: z.string().min(1, "Platform is required").optional(),
  url: z.string().min(1, "URL or handle is required").optional(),
  label: z.string().max(50, "Label must not exceed 50 characters").nullable().optional(),
  startDate: z.string().datetime({ message: "Invalid startDate format (must be ISO-8601 string)" }).nullable().optional(),
  endDate: z.string().datetime({ message: "Invalid endDate format (must be ISO-8601 string)" }).nullable().optional(),
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

// Business Link schemas
export const BusinessLinkCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters"),
  url: z.string().url("Must be a valid URL starting with http:// or https://"),
  description: z.string().max(200, "Description must not exceed 200 characters").nullable().optional(),
  thumbnailUrl: optionalUrlSchema,
});

export const BusinessLinkUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must not exceed 100 characters").optional(),
  url: z.string().url("Must be a valid URL starting with http:// or https://").optional(),
  description: z.string().max(200, "Description must not exceed 200 characters").nullable().optional(),
  thumbnailUrl: optionalUrlSchema,
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
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

