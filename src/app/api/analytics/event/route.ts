import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { after } from 'next/server';
import { auth } from '@/auth';
import { AnalyticsEventType, AnalyticsEventTypes } from '@/lib/analytics/events';
import { extractUtmParams } from '@/lib/utm';

export async function POST(request: Request) {
    try {
        const userAgent = request.headers.get('user-agent') || '';
        const isBot = /bot|crawl|spider|slurp|tracker|lighthouse|inspect/i.test(userAgent);
        if (isBot) {
            return NextResponse.json({ success: true, message: 'Bot filtered' });
        }

        const body = await request.json();
        const {
            userId,
            eventType,
            visitorId,
            targetId,
            targetType,
            targetTitle,
            url,
            referrer,
            metadata,
        } = body;

        if (!userId || !eventType) {
            return NextResponse.json({ error: 'Missing userId or eventType' }, { status: 400 });
        }

        // Validate eventType
        if (!Object.values(AnalyticsEventTypes).includes(eventType as AnalyticsEventType)) {
            return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 });
        }

        // Exclude owner's own actions
        const session = await auth();
        const isOwner = session?.user?.id === userId;

        let device = 'Desktop';
        if (/mobile/i.test(userAgent)) {
            device = 'Mobile';
        } else if (/tablet|ipad/i.test(userAgent)) {
            device = 'Tablet';
        }

        const country =
            request.headers.get('x-vercel-ip-country') ||
            request.headers.get('cf-ipcountry') ||
            'Unknown';

        const utm = extractUtmParams(url);
        const utmSource = (metadata?.utm_source || metadata?.utmSource || utm.utmSource || null) as string | null;
        const utmMedium = (metadata?.utm_medium || metadata?.utmMedium || utm.utmMedium || null) as string | null;
        const utmCampaign = (metadata?.utm_campaign || metadata?.utmCampaign || utm.utmCampaign || null) as string | null;
        const utmContent = (metadata?.utm_content || metadata?.utmContent || utm.utmContent || null) as string | null;
        const utmTerm = (metadata?.utm_term || metadata?.utmTerm || utm.utmTerm || null) as string | null;

        after(async () => {
            if (isOwner) return;
            try {
                // 1. Create unified AnalyticsEvent with UTM campaign data
                await prisma.analyticsEvent.create({
                    data: {
                        userId,
                        eventType,
                        visitorId: visitorId || null,
                        targetId: targetId || null,
                        targetType: targetType || null,
                        targetTitle: targetTitle || null,
                        url: url || null,
                        referrer: referrer || 'Direct',
                        device,
                        country,
                        utmSource,
                        utmMedium,
                        utmCampaign,
                        utmContent,
                        utmTerm,
                        metadata: {
                            ...(metadata ? JSON.parse(JSON.stringify(metadata)) : {}),
                            ...(utmSource ? { utm_source: utmSource } : {}),
                            ...(utmMedium ? { utm_medium: utmMedium } : {}),
                            ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
                            ...(utmContent ? { utm_content: utmContent } : {}),
                            ...(utmTerm ? { utm_term: utmTerm } : {}),
                        },
                    },
                });

                // 2. Dual-write to legacy tables for backwards compatibility with existing queries
                if (eventType === AnalyticsEventTypes.PROFILE_VIEW) {
                    await prisma.profileView.create({
                        data: {
                            userId,
                            visitorId: visitorId || null,
                            referrer: referrer || 'Direct',
                            device,
                            country,
                        },
                    });
                } else if (
                    eventType === AnalyticsEventTypes.LINK_CLICK ||
                    eventType === AnalyticsEventTypes.CTA_CLICK ||
                    eventType === AnalyticsEventTypes.PAYMENT_CLICK
                ) {
                    await prisma.clickEvent.create({
                        data: {
                            userId,
                            linkId: targetId || 'external',
                            linkType: targetType || 'link',
                            linkTitle: targetTitle || targetType || 'Link',
                            url: url || '',
                            referrer: referrer || 'Direct',
                            device,
                            country,
                        },
                    });
                }
            } catch (err) {
                console.error('Asynchronous analytics event insertion failed:', err);
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics event API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
