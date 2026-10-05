const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillAnalytics() {
    console.log('--- Starting Analytics Historical Data Backfill ---');
    try {
        const [existingEventCount, profileViews, clickEvents] = await Promise.all([
            prisma.analyticsEvent.count(),
            prisma.profileView.findMany(),
            prisma.clickEvent.findMany(),
        ]);

        console.log(`Current AnalyticsEvent count: ${existingEventCount}`);
        console.log(`Found ${profileViews.length} legacy ProfileViews and ${clickEvents.length} legacy ClickEvents.`);

        let viewsBackfilled = 0;
        let clicksBackfilled = 0;

        // Backfill views
        for (const pv of profileViews) {
            const alreadyExists = await prisma.analyticsEvent.findFirst({
                where: {
                    userId: pv.userId,
                    eventType: 'PROFILE_VIEW',
                    createdAt: pv.createdAt,
                },
            });

            if (!alreadyExists) {
                await prisma.analyticsEvent.create({
                    data: {
                        userId: pv.userId,
                        eventType: 'PROFILE_VIEW',
                        visitorId: pv.visitorId,
                        referrer: pv.referrer || 'Direct',
                        device: pv.device || 'Desktop',
                        country: pv.country || 'Unknown',
                        createdAt: pv.createdAt,
                    },
                });
                viewsBackfilled++;
            }
        }

        // Backfill clicks
        for (const ce of clickEvents) {
            const alreadyExists = await prisma.analyticsEvent.findFirst({
                where: {
                    userId: ce.userId,
                    eventType: 'LINK_CLICK',
                    targetId: ce.linkId,
                    createdAt: ce.createdAt,
                },
            });

            if (!alreadyExists) {
                await prisma.analyticsEvent.create({
                    data: {
                        userId: ce.userId,
                        eventType: 'LINK_CLICK',
                        targetId: ce.linkId,
                        targetType: ce.linkType,
                        targetTitle: ce.linkTitle,
                        url: ce.url,
                        referrer: ce.referrer || 'Direct',
                        device: ce.device || 'Desktop',
                        country: ce.country || 'Unknown',
                        createdAt: ce.createdAt,
                    },
                });
                clicksBackfilled++;
            }
        }

        console.log(`✅ Backfilled ${viewsBackfilled} views and ${clicksBackfilled} clicks into AnalyticsEvent.`);
        const finalCount = await prisma.analyticsEvent.count();
        console.log(`Total AnalyticsEvent records in DB now: ${finalCount}`);
    } catch (err) {
        console.error('Backfill error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

backfillAnalytics();
