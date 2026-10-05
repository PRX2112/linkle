import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { RESERVED_USERNAMES } from '@/lib/validation';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const entries: MetadataRoute.Sitemap = [];

    // Static public landing page
    entries.push({
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
    });

    try {
        // Query up to 50,000 public users (Google sitemap limit) excluding reserved and invalid usernames
        const users = await prisma.user.findMany({
            where: {
                username: {
                    not: null,
                    notIn: Array.from(RESERVED_USERNAMES),
                },
            },
            select: {
                username: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 50000,
        });

        for (const u of users) {
            if (u.username) {
                entries.push({
                    url: `${baseUrl}/p/${u.username}`,
                    lastModified: u.updatedAt,
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            }
        }
    } catch (err) {
        console.error('Error generating sitemap:', err);
    }

    return entries;
}
