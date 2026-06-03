export type SocialPlatform =
    | "instagram"
    | "facebook"
    | "twitter"
    | "linkedin"
    | "youtube"
    | "github"
    | "behance"
    | "dribbble"
    | "whatsapp"
    | "telegram"
    | "email"
    | "phone"
    | "website";

export interface SocialLink {
    id: string;
    platform: SocialPlatform;
    url: string;
    label?: string; // e.g., "My Portfolio"
    isVisible: boolean;
    featured?: boolean;
}

export interface BusinessLink {
    id: string;
    title: string;
    url: string;
    description?: string;
    thumbnailUrl?: string;
    isVisible: boolean;
    featured?: boolean;
}

export interface LocationInfo {
    address: string;
    googleMapsUrl?: string;
    googleMapsEmbedUrl?: string; // For iframe
    showDirectionsBtn: boolean;
    isVisible: boolean;
}

export type PaymentPlatform =
    | "upi"
    | "paytm"
    | "phonepe"
    | "googlepay"
    | "stripe"
    | "paypal"
    | "crypto";

export interface PaymentOption {
    id: string;
    platform: PaymentPlatform;
    value: string; // UPI ID, Payment Link, or Wallet Address
    qrCodeUrl?: string; // Optional custom QR for this payment
    isVisible: boolean;
    featured?: boolean;
}

export interface ContactAction {
    id: string;
    type: "vcard" | "book_appointment" | "download_resume" | "custom_form";
    label: string;
    url?: string; // For external booking/download
    isVisible: boolean;
    featured?: boolean;
}

export interface UserTheme {
    primaryColor: string;
    backgroundColor: string; // "light" | "dark" | hex
    fontFamily: string;
    buttonStyle: "rounded" | "square" | "pill";
}

export interface UserProfile {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string | null;
    bannerUrl?: string;
    theme: UserTheme;
    socialLinks: SocialLink[];
    businessLinks: BusinessLink[];
    location?: LocationInfo;
    payments: PaymentOption[];
    contactActions: ContactAction[];
    emailCaptureEnabled?: boolean;
    emailCaptureTitle?: string;
    emailCapturePlaceholder?: string;
}
