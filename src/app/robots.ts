import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/p/*',
                ],
                disallow: [
                    '/dashboard/',
                    '/dashboard/*',
                    '/api/',
                    '/api/*',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/reset-password',
                    '/verify-email',
                    '/_next/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
