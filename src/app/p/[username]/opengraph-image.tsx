import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const alt = 'Linkle Profile Card';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

interface Props {
    params: Promise<{
        username: string;
    }>;
}

export default async function Image(props: Props) {
    const { username } = await props.params;
    const normalized = (username || '').toLowerCase().trim();

    let user = await prisma.user.findUnique({
        where: { username: normalized },
        select: {
            username: true,
            displayName: true,
            name: true,
            bio: true,
            avatarUrl: true,
            image: true,
            themePrimaryColor: true,
        },
    });

    if (!user) {
        const aliasRecord = await prisma.usernameHistory.findUnique({
            where: { username: normalized },
            include: {
                user: {
                    select: {
                        username: true,
                        displayName: true,
                        name: true,
                        bio: true,
                        avatarUrl: true,
                        image: true,
                        themePrimaryColor: true,
                    },
                },
            },
        });
        if (aliasRecord?.user) {
            user = aliasRecord.user;
        }
    }

    const canonicalUsername = user?.username || normalized;
    const displayName = user?.displayName || user?.name || canonicalUsername || 'Creator';
    const handle = `@${canonicalUsername}`;
    const rawBio = user?.bio?.trim();
    const bioText = rawBio && rawBio.length > 0
        ? (rawBio.length > 130 ? `${rawBio.slice(0, 127)}...` : rawBio).replace(/\s+/g, ' ')
        : 'Connect with me on Linkle. One link for all social profiles, projects, and payments.';

    const initial = (displayName.charAt(0) || 'L').toUpperCase();
    const rawAvatarUrl = user?.avatarUrl || user?.image || null;

    // Verify avatar URL is reachable without hanging
    let validAvatarUrl: string | null = null;
    if (rawAvatarUrl && rawAvatarUrl.startsWith('http')) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1800);
            const res = await fetch(rawAvatarUrl, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                validAvatarUrl = rawAvatarUrl;
            }
        } catch {
            validAvatarUrl = null;
        }
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px 80px',
                    backgroundColor: '#09090b',
                    backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(139, 92, 246, 0.35) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.3) 0%, transparent 55%)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                        }}
                    >
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '24px',
                                fontWeight: 800,
                            }}
                        >
                            L
                        </div>
                        <span
                            style={{
                                color: '#ffffff',
                                fontSize: '32px',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                            }}
                        >
                            LINKLE
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'rgba(139, 92, 246, 0.18)',
                            border: '1px solid rgba(139, 92, 246, 0.45)',
                            borderRadius: '9999px',
                            padding: '8px 20px',
                            color: '#c4b5fd',
                            fontSize: '18px',
                            fontWeight: 600,
                        }}
                    >
                        Verified Profile
                    </div>
                </div>

                {/* Profile Information Block */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '40px',
                        width: '100%',
                    }}
                >
                    {validAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={validAvatarUrl}
                            alt={displayName}
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '9999px',
                                objectFit: 'cover',
                                border: '4px solid #8b5cf6',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: '#ffffff',
                                fontSize: '64px',
                                fontWeight: 800,
                                border: '4px solid #8b5cf6',
                            }}
                        >
                            {initial}
                        </div>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                color: '#ffffff',
                                fontSize: '46px',
                                fontWeight: 800,
                                lineHeight: 1.15,
                            }}
                        >
                            {displayName}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                color: '#a78bfa',
                                fontSize: '28px',
                                fontWeight: 600,
                            }}
                        >
                            {handle}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                color: '#94a3b8',
                                fontSize: '22px',
                                lineHeight: 1.45,
                                marginTop: '6px',
                            }}
                        >
                            {bioText}
                        </div>
                    </div>
                </div>

                {/* Footer Bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        paddingTop: '24px',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            color: '#64748b',
                            fontSize: '20px',
                            alignItems: 'center',
                        }}
                    >
                        One Link For Everything
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            color: '#c4b5fd',
                            fontSize: '20px',
                            fontWeight: 600,
                        }}
                    >
                        linkle.site/p/{canonicalUsername}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
