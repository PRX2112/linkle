import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Linkle - One Link for Everything',
        short_name: 'Linkle',
        description: 'Connect all your social links, business links, and payment methods in one beautiful personalized link-in-bio page.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#6366f1',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/favicon.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
