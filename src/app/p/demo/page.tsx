import type { Metadata } from 'next';
import ProfileContainer from '@/components/profile/ProfileContainer';
import type { UserProfile, SocialPlatform, PaymentPlatform } from '@/lib/types';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const canonicalUrl = `${appUrl}/p/demo`;
const ogImageUrl = `${canonicalUrl}/opengraph-image`;

export const metadata: Metadata = {
    title: 'Linkle Demo (@demo) | Linkle',
    description: 'Welcome to the official Linkle demo profile! Here you can preview all custom link blocks, social links, payments, email capture, and map locations.',
    alternates: {
        canonical: canonicalUrl,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Linkle Demo (@demo) | Linkle',
        description: 'Welcome to the official Linkle demo profile! Here you can preview all custom link blocks, social links, payments, email capture, and map locations.',
        url: canonicalUrl,
        siteName: 'Linkle',
        locale: 'en_US',
        type: 'profile',
        images: [
            {
                url: ogImageUrl,
                width: 1200,
                height: 630,
                alt: 'Linkle Demo (@demo) on Linkle',
                type: 'image/png',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Linkle Demo (@demo) | Linkle',
        description: 'Welcome to the official Linkle demo profile! Here you can preview all custom link blocks, social links, payments, email capture, and map locations.',
        images: [ogImageUrl],
        creator: '@demo',
    },
};

export default function DemoProfilePage() {
    const demoUser: UserProfile = {
        id: 'demo-user-id',
        username: 'demo',
        displayName: 'Linkle Demo',
        bio: 'Welcome to the official Linkle demo profile! Here you can preview all custom link blocks, social links, payments, email capture, and map locations.',
        avatarUrl: 'https://res.cloudinary.com/j9iy9acr/image/upload/v1790520841/linkle/avatars/default_avatar.jpg',
        bannerUrl: 'https://res.cloudinary.com/j9iy9acr/image/upload/v1790520841/linkle/banners/default_banner.jpg',
        emailCaptureEnabled: true,
        emailCaptureTitle: 'Subscribe to our Weekly Creator Newsletter',
        emailCapturePlaceholder: 'Enter your email address',
        theme: {
            primaryColor: '#a855f7',
            backgroundColor: 'var(--background)',
            fontFamily: 'Inter',
            buttonStyle: 'pill',
        },
        socialLinks: [
            { id: 'social-1', platform: 'instagram' as SocialPlatform, url: 'https://instagram.com/linkle_demo', isVisible: true },
            { id: 'social-2', platform: 'twitter' as SocialPlatform, url: 'https://x.com/linkle_demo', isVisible: true },
            { id: 'social-3', platform: 'linkedin' as SocialPlatform, url: 'https://linkedin.com/in/linkle_demo', isVisible: true },
            { id: 'social-4', platform: 'youtube' as SocialPlatform, url: 'https://youtube.com/@linkle_demo', isVisible: true },
            { id: 'social-5', platform: 'github' as SocialPlatform, url: 'https://github.com/linkle_demo', isVisible: true },
            { id: 'social-6', platform: 'whatsapp' as SocialPlatform, url: 'https://wa.me/1234567890', isVisible: true },
            { id: 'social-7', platform: 'email' as SocialPlatform, url: 'mailto:demo@linkle.app', isVisible: true },
        ],
        businessLinks: [
            {
                id: 'link-1',
                title: '🚀 Get Started with Linkle',
                url: 'https://linklez.vercel.app',
                description: 'Create your own premium link-in-bio page for free in less than 2 minutes.',
                isVisible: true,
                featured: true,
            },
            {
                id: 'link-2',
                title: '✍️ Read our Medium Blog',
                url: 'https://medium.com',
                description: 'Tips, tutorials, and success stories from the creator economy.',
                isVisible: true,
            },
            {
                id: 'link-3',
                title: '🛍 Shop Creator Merchandise',
                url: 'https://shopify.com',
                description: 'Browse premium apparel, overlays, and digital assets.',
                isVisible: true,
            },
        ],
        payments: [
            { id: 'pay-1', platform: 'upi' as PaymentPlatform, value: 'linkle@okaxis', isVisible: true },
            { id: 'pay-2', platform: 'paypal' as PaymentPlatform, value: 'https://paypal.me/linkle_demo', isVisible: true },
            { id: 'pay-3', platform: 'stripe' as PaymentPlatform, value: 'https://buy.stripe.com/demo_link', isVisible: true },
            { id: 'pay-4', platform: 'paytm' as PaymentPlatform, value: '9876543210@paytm', isVisible: true },
            { id: 'pay-5', platform: 'crypto' as PaymentPlatform, value: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', isVisible: true },
        ],
        contactActions: [
            { id: 'contact-1', type: 'book_appointment', label: '🗓 Book a Consultation', url: 'https://calendly.com', isVisible: true },
            { id: 'contact-2', type: 'download_resume', label: 'Media Kit', url: 'https://linklez.vercel.app', isVisible: true },
        ],
        location: {
            address: 'Times Square, New York, NY 10036',
            googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617540194473!2d-73.9868512!3d40.7579747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25859a1c545e3%3A0xe53c687b47e748f7!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
            showDirectionsBtn: true,
            isVisible: true,
        },
    };

    const sameAsUrls = demoUser.socialLinks
        .filter((l) => l.isVisible && l.url && /^https?:\/\//i.test(l.url))
        .map((l) => l.url);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': 'Person',
            name: demoUser.displayName,
            alternateName: `@${demoUser.username}`,
            identifier: demoUser.username,
            description: demoUser.bio,
            image: demoUser.avatarUrl,
            url: canonicalUrl,
            sameAs: sameAsUrls,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProfileContainer user={demoUser} />
        </>
    );
}
