export type TemplateId =
  | "creator"
  | "freelancer"
  | "developer"
  | "photographer"
  | "influencer"
  | "business"
  | "coach"
  | "job_seeker"
  | "student"
  | "scratch";

export interface TemplateSocialItem {
  platform: string;
  urlPrefix: string;
  label: string;
  placeholder: string;
}

export interface TemplateBusinessItem {
  title: string;
  defaultUrl: string;
  description: string;
}

export interface TemplateContactItem {
  type: "vcard" | "book_appointment" | "download_resume" | "custom_form";
  label: string;
  url?: string;
}

export interface ProfileTemplate {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  icon: string; // Emoji or Lucide icon key
  badgeColor: string;
  theme: {
    primaryColor: string;
    buttonStyle: "pill" | "rounded" | "square";
    fontFamily: string;
  };
  bioScaffolding: string;
  suggestedSocial: TemplateSocialItem[];
  suggestedBusinessLinks: TemplateBusinessItem[];
  emailCapture: {
    enabled: boolean;
    title: string;
    placeholder: string;
  };
  suggestedContactActions: TemplateContactItem[];
  paymentPrompt?: {
    platform: "upi" | "paypal" | "stripe";
    title: string;
    description: string;
  };
}

export interface OnboardingConfigInput {
  templateId: TemplateId;
  displayName?: string;
  bio?: string;
  themePrimaryColor?: string;
  themeButtonStyle?: "pill" | "rounded" | "square";
  socialLinks?: Array<{
    platform: string;
    url: string;
    label?: string;
  }>;
  businessLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  emailCaptureEnabled?: boolean;
  emailCaptureTitle?: string;
  emailCapturePlaceholder?: string;
  contactActions?: Array<{
    type: string;
    label: string;
    url?: string;
  }>;
  paymentValue?: string;
  paymentPlatform?: string;
}
