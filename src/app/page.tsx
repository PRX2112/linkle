import type { Metadata } from "next";
import { auth } from "@/auth";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustStrip from "@/components/landing/TrustStrip";
import ProblemSolution from "@/components/landing/ProblemSolution";
import AudienceSection from "@/components/landing/AudienceSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import LinklePaySection from "@/components/landing/LinklePaySection";
import AnalyticsShowcase from "@/components/landing/AnalyticsShowcase";
import AppearanceShowcase from "@/components/landing/AppearanceShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaBanner from "@/components/landing/CtaBanner";
import LandingFooter from "@/components/landing/LandingFooter";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Linkle - Your Profile, Links, Contacts and Payments in One Place",
  description: "Create a professional, high-converting Linkle profile page. Share your curated links, accept zero-fee UPI payments, save direct contact cards, and track privacy-first analytics.",
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "Linkle",
    title: "Linkle - Your Profile, Links, Contacts and Payments in One Place",
    description: "Create a professional Linkle profile page. Share your links, accept zero-fee UPI payments, and distribute your contact card in one click.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Linkle Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linkle - Your Profile, Links, Contacts and Payments in One Place",
    description: "Create a professional Linkle profile page. Share your links, accept zero-fee UPI payments, and distribute your contact card in one click.",
    images: ["/logo.png"],
  },
};

export default async function Home() {
  const session = await auth();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        url: appUrl,
        name: "Linkle",
        description: "Your profile, links, contacts and payments in one place.",
        publisher: {
          "@type": "Organization",
          name: "Linkle",
          url: appUrl,
          logo: {
            "@type": "ImageObject",
            url: `${appUrl}/logo.png`,
          },
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Linkle",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: "The digital profile microsite for creators, freelancers, and businesses. Features direct UPI payments, vCard contact downloads, and privacy-preserving analytics.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 flex flex-col selection:bg-brand-500/20 selection:text-brand-700 dark:selection:text-brand-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation */}
      <LandingNavbar session={session} />

      {/* Main Content Narrative */}
      <main className="flex-1">
        <HeroSection session={session} />
        <TrustStrip />
        <ProblemSolution />
        <AudienceSection />
        <FeaturesSection />
        <LinklePaySection />
        <AppearanceShowcase />
        <AnalyticsShowcase />
        <HowItWorks />
        <PricingSection />
        <FaqSection />
        <CtaBanner session={session} />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
