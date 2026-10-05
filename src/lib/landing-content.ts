import { PLANS, PlanConfig } from "@/lib/billing/plans";

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Linkle Pay", href: "#payments" },
  { label: "Customization", href: "#customization" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export interface TrustItem {
  iconName: "ShieldCheck" | "Zap" | "QrCode" | "CreditCard" | "BarChart3" | "Palette";
  title: string;
  description: string;
}

export const TRUST_ITEMS: TrustItem[] = [
  {
    iconName: "CreditCard",
    title: "Linkle Pay UPI",
    description: "Direct bank-to-bank UPI payments with 0% platform fee.",
  },
  {
    iconName: "QrCode",
    title: "Dynamic Profile QR",
    description: "High-resolution vector QR code ready for cards and events.",
  },
  {
    iconName: "BarChart3",
    title: "Real-Time Analytics",
    description: "Privacy-first metrics for views, clicks, CTR, and referrers.",
  },
  {
    iconName: "Palette",
    title: "Custom Visual Identity",
    description: "Themes, typography, custom colors, and 4 button styles.",
  },
  {
    iconName: "Zap",
    title: "1-Tap Contact vCard",
    description: "Visitors can download and save your contact directly to their phone.",
  },
];

export interface AudienceItem {
  id: string;
  title: string;
  role: string;
  description: string;
  keyFeature: string;
  badge: string;
}

export const AUDIENCE_ITEMS: AudienceItem[] = [
  {
    id: "creators",
    title: "Creators & Influencers",
    role: "Content & Community",
    description: "Consolidate YouTube, Instagram, podcasts, and digital merchandise into a branded mobile page.",
    keyFeature: "Email subscriber capture & featured content highlights",
    badge: "Audience Growth",
  },
  {
    id: "freelancers",
    title: "Freelancers & Consultants",
    role: "Services & Bookings",
    description: "Allow clients to review your portfolio, book a consultation call, and pay upfront retainers.",
    keyFeature: "Direct Calendly integration & UPI advance payments",
    badge: "Client Conversion",
  },
  {
    id: "developers",
    title: "Developers & Designers",
    role: "Tech & Projects",
    description: "Showcase live web apps, GitHub repositories, and tech stacks with custom thumbnails.",
    keyFeature: "Custom code font support & rich project links",
    badge: "Portfolio Showcase",
  },
  {
    id: "photographers",
    title: "Photographers & Artists",
    role: "Visual Galleries",
    description: "Direct prospective clients to client galleries, print shops, and booking inquiries.",
    keyFeature: "High-res media kit & direct location map embed",
    badge: "Visual Identity",
  },
  {
    id: "businesses",
    title: "Local & Online Businesses",
    role: "Commerce & Footfall",
    description: "Share store hours, Google Maps directions, and contact numbers on physical menus and flyers.",
    keyFeature: "Interactive Google Maps & instant WhatsApp link",
    badge: "Omnichannel",
  },
  {
    id: "professionals",
    title: "Job Seekers & Executives",
    role: "Networking & Careers",
    description: "Turn networking conversations into connections with one-tap digital business cards.",
    keyFeature: "RFC 2426 standard vCard download & hosted CV",
    badge: "Digital Business Card",
  },
];

export interface FeatureItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  bulletPoints: string[];
  iconName: "Globe" | "Share2" | "QrCode" | "CreditCard" | "BarChart2" | "Mail";
}

export const CORE_FEATURES: FeatureItem[] = [
  {
    id: "profile",
    title: "One Polished Microsite",
    badge: "Identity",
    description: "An expressive mobile-first profile that showcases your work, biography, and professional links without clutter.",
    bulletPoints: [
      "Custom cover banners and high-resolution avatars",
      "Tailored button shapes (Rounded, Pill, Square, Outline)",
      "Curated typography and custom brand color injection",
    ],
    iconName: "Globe",
  },
  {
    id: "links",
    title: "Smart Link Management",
    badge: "Conversion",
    description: "Organize, schedule, and elevate your most important links with rich thumbnails and campaign parameters.",
    bulletPoints: [
      "Pinned 'Featured' links for primary calls-to-action",
      "Built-in UTM campaign tagging for marketing channels",
      "Server-side link scheduling with start and end dates",
    ],
    iconName: "Share2",
  },
  {
    id: "payments",
    title: "Linkle Pay (UPI Ready)",
    badge: "Monetization",
    description: "Receive peer-to-peer UPI payments directly to your bank account with zero platform fees.",
    bulletPoints: [
      "One-tap UPI mobile deep link (Google Pay, PhonePe, Paytm)",
      "High-contrast dynamic QR code for desktop visitors",
      "Support for PayPal, Stripe, and Crypto wallet addresses",
    ],
    iconName: "CreditCard",
  },
  {
    id: "contact",
    title: "Save Contact (vCard 3.0)",
    badge: "Networking",
    description: "Allow visitors and clients to save your phone, email, and social links straight into their smartphone contacts.",
    bulletPoints: [
      "Generates valid standard RFC 2426 .vcf contact files",
      "Integrated booking links (Calendly, Cal.com)",
      "Downloadable resume or media kit distribution",
    ],
    iconName: "QrCode",
  },
  {
    id: "analytics",
    title: "Privacy-First Analytics",
    badge: "Intelligence",
    description: "Understand where your visitors arrive from and what content drives clicks without intrusive tracking cookies.",
    bulletPoints: [
      "Total views, unique visitors, total clicks, and click-through rate (CTR)",
      "Referrer channel breakdown (Instagram, X, LinkedIn, Direct)",
      "Device and operating system distribution metrics",
    ],
    iconName: "BarChart2",
  },
  {
    id: "newsletter",
    title: "Email Subscriber Capture",
    badge: "Audience",
    description: "Convert profile visitors into loyal subscribers directly from your link page into your dashboard.",
    bulletPoints: [
      "Configurable callout headline and custom placeholder",
      "Client and server-side duplicate email protection",
      "Native button styling that respects your profile theme",
    ],
    iconName: "Mail",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Linkle and how is it different from basic link tools?",
    answer: "Linkle is a complete personal microsite platform. Unlike standard link-in-bio tools that only offer simple lists of buttons, Linkle integrates direct peer-to-peer UPI payments (0% commission), one-tap vCard phone contact saving, interactive Google Maps directions, scheduled link visibility, and built-in UTM analytics.",
  },
  {
    question: "How does Linkle Pay (UPI) work? Are there any fees?",
    answer: "Linkle Pay generates standard UPI payment URIs and scannable QR codes using your existing UPI ID (e.g. yourname@upi). When a mobile visitor taps 'Pay via UPI App', their native payment app (Google Pay, PhonePe, Paytm, or BHIM) opens directly. Linkle charges 0% transaction fee because payments transfer peer-to-peer directly into your own bank account.",
  },
  {
    question: "Can I customize the design, colors, and typography of my profile?",
    answer: "Yes. Linkle provides 8 curated theme presets, custom hex color injection (--user-primary), multiple professional font families (including Inter, Plus Jakarta Sans, Outfit, DM Sans, and Playfair Display), and 4 distinct button geometries (Rounded, Pill, Square, and Outline).",
  },
  {
    question: "What does the 'Save Contact' button do?",
    answer: "The Save Contact button generates a standard RFC 2426 vCard (.vcf) file on the fly containing your name, telephone numbers, email address, and profile link. When a visitor taps it on iOS or Android, their phone prompts them to save you as a contact in their address book.",
  },
  {
    question: "What features are included in the Free Starter plan?",
    answer: "The Starter plan is free forever. It includes up to 5 social and link blocks, full theme customization, your personal Linkle URL, dynamic QR code generation, and 7-day analytics.",
  },
  {
    question: "What do I get with Linkle Pro?",
    answer: "Linkle Pro unlocks unlimited links, extended analytics (7, 14, 30, and 90 days), outbound UTM campaign parameters, the ability to remove Linkle branding, the email subscriber capture widget, and priority support.",
  },
  {
    question: "Can I change my username after creating my account?",
    answer: "Yes. You can update your username in Settings at any time. Linkle preserves your previous username as an alias to prevent broken links, redirecting previous visitors automatically to your new profile.",
  },
];
