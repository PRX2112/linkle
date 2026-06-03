import type { Metadata } from 'next';
import ProfileContainer from '@/components/profile/ProfileContainer';
import type { UserProfile, SocialLink, BusinessLink, LocationInfo, PaymentOption, ContactAction, SocialPlatform, PaymentPlatform } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Linkle Demo Profile | Linkle',
  description: 'View the official Linkle demo profile showcasing all custom links, social platforms, support payments, newsletter email capture, and location widgets.',
};

export default function DemoProfilePage() {
  const demoUser: UserProfile = {
    id: "demo-user-id",
    username: "demo",
    displayName: "Linkle Demo",
    bio: "Welcome to the official Linkle demo profile! Here you can preview all custom link blocks, social links, payments, email capture, and map locations.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=400&q=80",
    emailCaptureEnabled: true,
    emailCaptureTitle: "Subscribe to our Weekly Creator Newsletter",
    emailCapturePlaceholder: "Enter your email address",
    theme: {
      primaryColor: "#a855f7",
      backgroundColor: "var(--background)",
      fontFamily: "Inter",
      buttonStyle: "pill",
    },
    socialLinks: [
      { id: "social-1", platform: "instagram" as SocialPlatform, url: "https://instagram.com/linkle_demo", isVisible: true },
      { id: "social-2", platform: "twitter" as SocialPlatform, url: "https://x.com/linkle_demo", isVisible: true },
      { id: "social-3", platform: "linkedin" as SocialPlatform, url: "https://linkedin.com/in/linkle_demo", isVisible: true },
      { id: "social-4", platform: "youtube" as SocialPlatform, url: "https://youtube.com/@linkle_demo", isVisible: true },
      { id: "social-5", platform: "github" as SocialPlatform, url: "https://github.com/linkle_demo", isVisible: true },
      { id: "social-6", platform: "whatsapp" as SocialPlatform, url: "https://wa.me/1234567890", isVisible: true },
      { id: "social-7", platform: "email" as SocialPlatform, url: "mailto:demo@linkle.app", isVisible: true },
    ],
    businessLinks: [
      { 
        id: "link-1", 
        title: "🚀 Get Started with Linkle", 
        url: "https://linklez.vercel.app", 
        description: "Create your own premium link-in-bio page for free in less than 2 minutes.",
        isVisible: true,
        featured: true 
      },
      { 
        id: "link-2", 
        title: "✍️ Read our Medium Blog", 
        url: "https://medium.com", 
        description: "Tips, tutorials, and success stories from the creator economy.",
        isVisible: true 
      },
      { 
        id: "link-3", 
        title: "🛍 Shop Creator Merchandise", 
        url: "https://shopify.com", 
        description: "Browse premium apparel, overlays, and digital assets.",
        isVisible: true 
      }
    ],
    payments: [
      { id: "pay-1", platform: "upi" as PaymentPlatform, value: "linkle@okaxis", isVisible: true },
      { id: "pay-2", platform: "paypal" as PaymentPlatform, value: "https://paypal.me/linkle_demo", isVisible: true },
      { id: "pay-3", platform: "stripe" as PaymentPlatform, value: "https://buy.stripe.com/demo_link", isVisible: true },
      { id: "pay-4", platform: "paytm" as PaymentPlatform, value: "9876543210@paytm", isVisible: true },
      { id: "pay-5", platform: "crypto" as PaymentPlatform, value: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", isVisible: true },
    ],
    contactActions: [
      { id: "contact-1", type: "book_appointment", label: "🗓 Book a Consultation", url: "https://calendly.com", isVisible: true },
      { id: "contact-2", type: "download_resume", label: "Media Kit", url: "https://linklez.vercel.app", isVisible: true },
    ],
    location: {
      address: "Times Square, New York, NY 10036",
      googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617540194473!2d-73.9868512!3d40.7579747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25859a1c545e3%3A0xe53c687b47e748f7!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus",
      showDirectionsBtn: true,
      isVisible: true,
    }
  };

  return <ProfileContainer user={demoUser} />;
}
