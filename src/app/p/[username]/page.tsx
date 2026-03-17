import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import ProfileContainer from '@/components/profile/ProfileContainer';
import { notFound } from 'next/navigation';
import type { UserProfile, SocialLink, BusinessLink, LocationInfo, PaymentOption, ContactAction, SocialPlatform, PaymentPlatform } from '@/lib/types';

interface Props {
    params: Promise<{
        username: string;
    }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { username } = await props.params;
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        return { title: 'User Not Found - Linkle' };
    }

    return {
        title: `${user.displayName ?? user.username} (@${user.username}) | Linkle`,
        description: user.bio ?? 'View my Linkle profile',
        openGraph: { images: user.avatarUrl ? [user.avatarUrl] : [] },
    };
}

export default async function ProfilePage(props: Props) {
    const { username } = await props.params;

    const dbUser = await prisma.user.findUnique({
        where: { username },
        include: {
            socialLinks: { where: { isVisible: true }, orderBy: { order: 'asc' } },
            businessLinks: { where: { isVisible: true }, orderBy: { order: 'asc' } },
            paymentLinks: { where: { isVisible: true }, orderBy: { order: 'asc' } },
            contactActions: { where: { isVisible: true }, orderBy: { order: 'asc' } },
        },
    });

    if (!dbUser) {
        notFound();
    }

    // Map DB model to UserProfile type used by components
    const profile: UserProfile = {
        id: dbUser.id,
        username: dbUser.username!,
        displayName: dbUser.displayName ?? dbUser.name ?? dbUser.username ?? '',
        bio: dbUser.bio ?? '',
        avatarUrl: dbUser.avatarUrl ?? dbUser.image ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        bannerUrl: dbUser.bannerUrl ?? undefined,
        theme: {
            primaryColor: dbUser.themePrimaryColor,
            backgroundColor: dbUser.themeBackgroundColor,
            fontFamily: dbUser.themeFontFamily,
            buttonStyle: dbUser.themeButtonStyle as 'rounded' | 'square' | 'pill',
        },
        socialLinks: dbUser.socialLinks.map((l): SocialLink => ({
            id: l.id,
            platform: l.platform as SocialPlatform,
            url: l.url,
            label: l.label ?? undefined,
            isVisible: l.isVisible,
        })),
        businessLinks: dbUser.businessLinks.map((l): BusinessLink => ({
            id: l.id,
            title: l.title,
            url: l.url,
            description: l.description ?? undefined,
            thumbnailUrl: l.thumbnailUrl ?? undefined,
            isVisible: l.isVisible,
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
        })),
        contactActions: dbUser.contactActions.map((l): ContactAction => ({
            id: l.id,
            type: l.type as ContactAction['type'],
            label: l.label,
            url: l.url,
            isVisible: l.isVisible,
        })),
    };

    return <ProfileContainer user={profile} />;
}
