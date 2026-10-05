import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ProfileContainer from '@/components/profile/ProfileContainer';
import { notFound, permanentRedirect } from 'next/navigation';
import type { UserProfile, SocialLink, BusinessLink, LocationInfo, PaymentOption, ContactAction, SocialPlatform, PaymentPlatform } from '@/lib/types';
import { unstable_cache } from 'next/cache';

interface Props {
    params: Promise<{
        username: string;
    }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { username } = await props.params;
    const normalized = (username || '').toLowerCase().trim();

    let user = await prisma.user.findUnique({
        where: { username: normalized },
        include: {
            socialLinks: {
                where: { isVisible: true },
                select: { url: true, platform: true },
            },
        },
    });

    // If not found by active username, check if this is an alias in UsernameHistory
    let isAlias = false;
    if (!user) {
        const aliasRecord = await prisma.usernameHistory.findUnique({
            where: { username: normalized },
            include: {
                user: {
                    include: {
                        socialLinks: {
                            where: { isVisible: true },
                            select: { url: true, platform: true },
                        },
                    },
                },
            },
        });
        if (aliasRecord?.user) {
            user = aliasRecord.user;
            isAlias = true;
        }
    }

    if (!user || !user.username) {
        return {
            title: 'User Not Found | Linkle',
            description: 'The requested Linkle profile could not be found.',
            robots: {
                index: false,
                follow: false,
                nocache: true,
                googleBot: {
                    index: false,
                    follow: false,
                },
            },
        };
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const canonicalUsername = user.username;
    const canonicalUrl = `${appUrl}/p/${canonicalUsername}`;
    const displayName = user.displayName || user.name || canonicalUsername;

    // Dynamic meta description without exposing private information
    const rawBio = user.bio?.trim();
    const metaDescription = rawBio && rawBio.length > 0
        ? (rawBio.length > 155 ? `${rawBio.slice(0, 152)}...` : rawBio).replace(/\s+/g, ' ')
        : `Connect with ${displayName} (@${canonicalUsername}) on Linkle. Explore social links, business links, and payment options.`;

    const ogImageUrl = `${canonicalUrl}/opengraph-image`;

    return {
        title: `${displayName} (@${canonicalUsername}) | Linkle`,
        description: metaDescription,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: isAlias
            ? {
                index: false,
                follow: true, // Aliases redirect to canonical, pass link equity
            }
            : {
                index: true,
                follow: true,
                nocache: false,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        openGraph: {
            title: `${displayName} (@${canonicalUsername}) | Linkle`,
            description: metaDescription,
            url: canonicalUrl,
            siteName: 'Linkle',
            locale: 'en_US',
            type: 'profile',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: `${displayName} (@${canonicalUsername}) on Linkle`,
                    type: 'image/png',
                },
                ...(user.avatarUrl ? [{
                    url: user.avatarUrl,
                    alt: `${displayName}'s avatar`,
                }] : []),
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${displayName} (@${canonicalUsername}) | Linkle`,
            description: metaDescription,
            images: [ogImageUrl],
            creator: `@${canonicalUsername}`,
        },
    };
}

// Cached function to load user profiles and active links
const getCachedProfile = (username: string) => {
    const normalized = username.toLowerCase().trim();

    return unstable_cache(
        async () => {
            const now = new Date();
            const dateScheduleFilter = {
                AND: [
                    {
                        OR: [
                            { startDate: null },
                            { startDate: { lte: now } },
                        ],
                    },
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: now } },
                        ],
                    },
                ],
            };

            return prisma.user.findUnique({
                where: { username: normalized },
                include: {
                    socialLinks: {
                        where: {
                            isVisible: true,
                            ...dateScheduleFilter,
                        },
                        orderBy: { order: 'asc' },
                    },
                    businessLinks: {
                        where: {
                            isVisible: true,
                            ...dateScheduleFilter,
                        },
                        orderBy: { order: 'asc' },
                    },
                    paymentLinks: {
                        where: {
                            isVisible: true,
                            ...dateScheduleFilter,
                        },
                        orderBy: { order: 'asc' },
                    },
                    contactActions: {
                        where: {
                            isVisible: true,
                            ...dateScheduleFilter,
                        },
                        orderBy: { order: 'asc' },
                    },
                },
            });
        },
        [`profile-${normalized}`],
        {
            tags: [`user-profile-${normalized}`],
            revalidate: 3600, // revalidate every 1 hour fallback
        }
    )();
};

export default async function ProfilePage(props: Props) {
    const { username } = await props.params;
    const normalized = (username || '').toLowerCase().trim();

    let dbUser = await getCachedProfile(normalized);

    // If active profile not found by this slug, check if it exists in UsernameHistory as an alias
    if (!dbUser) {
        const aliasRecord = await prisma.usernameHistory.findUnique({
            where: { username: normalized },
            include: { user: { select: { username: true } } },
        });

        // Permanent redirect to current canonical username (preventing redirect loops)
        if (aliasRecord?.user?.username) {
            const canonicalUsername = aliasRecord.user.username;
            if (canonicalUsername.toLowerCase() !== normalized) {
                permanentRedirect(`/p/${canonicalUsername}`);
            }
        }

        notFound();
    }

    // Ensure casing matches canonical username exactly (e.g. /p/AlexCreator -> /p/alexcreator)
    if (dbUser.username && dbUser.username !== username) {
        permanentRedirect(`/p/${dbUser.username}`);
    }

    // Map DB model to UserProfile type used by components
    const profile: UserProfile = {
        id: dbUser.id,
        username: dbUser.username!,
        displayName: dbUser.displayName ?? dbUser.name ?? dbUser.username ?? '',
        bio: dbUser.bio ?? '',
        avatarUrl: dbUser.avatarUrl ?? dbUser.image ?? null,
        bannerUrl: dbUser.bannerUrl ?? undefined,
        emailCaptureEnabled: dbUser.emailCaptureEnabled,
        emailCaptureTitle: dbUser.emailCaptureTitle,
        emailCapturePlaceholder: dbUser.emailCapturePlaceholder,
        theme: {
            primaryColor: dbUser.themePrimaryColor,
            backgroundColor: dbUser.themeBackgroundColor,
            fontFamily: dbUser.themeFontFamily,
            buttonStyle: (dbUser.themeButtonStyle as 'rounded' | 'square' | 'pill' | 'outline') || 'pill',
        },
        socialLinks: dbUser.socialLinks.map((l): SocialLink => ({
            id: l.id,
            platform: l.platform as SocialPlatform,
            url: l.url,
            label: l.label ?? undefined,
            isVisible: l.isVisible,
            featured: l.featured,
            utmEnabled: l.utmEnabled,
            utmSource: l.utmSource,
            utmMedium: l.utmMedium,
            utmCampaign: l.utmCampaign,
            utmContent: l.utmContent,
            utmTerm: l.utmTerm,
        })),
        businessLinks: dbUser.businessLinks.map((l): BusinessLink => ({
            id: l.id,
            title: l.title,
            url: l.url,
            description: l.description ?? undefined,
            thumbnailUrl: l.thumbnailUrl ?? undefined,
            isVisible: l.isVisible,
            featured: l.featured,
            utmEnabled: l.utmEnabled,
            utmSource: l.utmSource,
            utmMedium: l.utmMedium,
            utmCampaign: l.utmCampaign,
            utmContent: l.utmContent,
            utmTerm: l.utmTerm,
        })),
        location: dbUser.locationIsVisible && dbUser.locationAddress ? {
            address: dbUser.locationAddress,
            googleMapsEmbedUrl: dbUser.locationGoogleMapsEmbedUrl ?? undefined,
            showDirectionsBtn: dbUser.locationShowDirectionsBtn,
            isVisible: dbUser.locationIsVisible,
        } as LocationInfo : undefined,
        payments: dbUser.paymentLinks.map((l): PaymentOption => ({
            id: l.id,
            platform: l.platform as PaymentPlatform,
            value: l.value,
            isVisible: l.isVisible,
            featured: l.featured,
        })),
        contactActions: dbUser.contactActions.map((l): ContactAction => ({
            id: l.id,
            type: l.type as ContactAction['type'],
            label: l.label,
            url: l.url,
            isVisible: l.isVisible,
            featured: l.featured,
        })),
    };

    // Determine entity type (Organization vs Person)
    const isOrg = /\b(inc|corp|corporation|ltd|llc|agency|studio|team|official|store|shop|brand|company|co\.|foundation|organization|club)\b/i.test(
        `${profile.displayName} ${profile.bio}`
    );
    const entityType = isOrg ? 'Organization' : 'Person';

    // Collect valid sameAs social links (visible and valid HTTP/HTTPS URLs)
    const sameAsUrls = profile.socialLinks
        .filter((l) => l.isVisible && l.url && /^https?:\/\//i.test(l.url))
        .map((l) => l.url);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const canonicalUrl = `${appUrl}/p/${profile.username}`;

    // Schema.org ProfilePage structured data
    const dateCreated = dbUser.createdAt ? (typeof dbUser.createdAt === 'string' ? dbUser.createdAt : dbUser.createdAt.toISOString()) : undefined;
    const dateModified = dbUser.updatedAt ? (typeof dbUser.updatedAt === 'string' ? dbUser.updatedAt : dbUser.updatedAt.toISOString()) : undefined;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        dateCreated,
        dateModified,
        mainEntity: {
            '@type': entityType,
            name: profile.displayName || profile.username,
            alternateName: `@${profile.username}`,
            identifier: profile.username,
            description: profile.bio || `Connect with ${profile.displayName || profile.username} on Linkle.`,
            ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
            url: canonicalUrl,
            ...(sameAsUrls.length > 0 ? { sameAs: sameAsUrls } : {}),
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProfileContainer user={profile} />
        </>
    );
}
