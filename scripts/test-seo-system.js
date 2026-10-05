const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSeoTests() {
    console.log('--- Starting Linkle SEO Production Test Suite ---');
    const baseUrl = 'http://localhost:3000';
    let failures = 0;

    function assert(condition, message) {
        if (!condition) {
            console.error(`❌ FAIL: ${message}`);
            failures++;
        } else {
            console.log(`✅ PASS: ${message}`);
        }
    }

    try {
        // Step 1: Ensure test profiles exist
        console.log('\n[1] Preparing test profiles in DB...');

        // 1.1 Demo profile
        let demoUser = await prisma.user.findUnique({ where: { username: 'demo' } });
        if (!demoUser) {
            demoUser = await prisma.user.create({
                data: {
                    username: 'demo',
                    displayName: 'Linkle Demo Creator',
                    name: 'Demo Creator',
                    email: 'demo@linkle.site',
                    bio: 'Digital creator, builder, and open-source enthusiast sharing all links and projects on Linkle.',
                    avatarUrl: 'https://res.cloudinary.com/j9iy9acr/image/upload/v1790520841/linkle/avatars/default_avatar.jpg',
                    themePrimaryColor: '#8b5cf6',
                    socialLinks: {
                        create: [
                            { platform: 'twitter', url: 'https://twitter.com/linkledemo', isVisible: true, order: 0 },
                            { platform: 'instagram', url: 'https://instagram.com/linkledemo', isVisible: true, order: 1 },
                            { platform: 'github', url: 'https://github.com/linkledemo', isVisible: true, order: 2 },
                        ],
                    },
                },
            });
            console.log('Created /p/demo profile.');
        } else {
            console.log('Existing /p/demo profile found.');
        }

        // 1.2 Profile with NO avatar
        let noAvatarUser = await prisma.user.findUnique({ where: { username: 'seo_no_avatar' } });
        if (!noAvatarUser) {
            noAvatarUser = await prisma.user.create({
                data: {
                    username: 'seo_no_avatar',
                    displayName: 'No Avatar User',
                    email: 'noavatar@linkle.site',
                    bio: 'Profile without an avatar image for testing default monogram generation.',
                    avatarUrl: null,
                    image: null,
                    themePrimaryColor: '#ec4899',
                },
            });
            console.log('Created /p/seo_no_avatar profile.');
        }

        // 1.3 Profile with LONG bio
        const longBioText = 'This is an exceptionally detailed and comprehensive biographical description crafted specifically for stress-testing SEO metadata truncation, ensuring that social meta tags and search engine description snippets stay strictly within the recommended character thresholds without cutting words awkwardly or causing layout overflow in Open Graph preview cards.';
        let longBioUser = await prisma.user.findUnique({ where: { username: 'seo_long_bio' } });
        if (!longBioUser) {
            longBioUser = await prisma.user.create({
                data: {
                    username: 'seo_long_bio',
                    displayName: 'Professor LongBio',
                    email: 'longbio@linkle.site',
                    bio: longBioText,
                    avatarUrl: 'https://res.cloudinary.com/j9iy9acr/image/upload/v1790520841/linkle/avatars/default_avatar.jpg',
                    themePrimaryColor: '#10b981',
                },
            });
            console.log('Created /p/seo_long_bio profile.');
        }

        // 1.4 Profile with MULTIPLE social links
        let multiSocialUser = await prisma.user.findUnique({ where: { username: 'seo_multi_social' } });
        if (!multiSocialUser) {
            multiSocialUser = await prisma.user.create({
                data: {
                    username: 'seo_multi_social',
                    displayName: 'Global Media Network',
                    email: 'media@linkle.site',
                    bio: 'Broadcasting across all major platforms with comprehensive sameAs knowledge graph associations.',
                    themePrimaryColor: '#3b82f6',
                    socialLinks: {
                        create: [
                            { platform: 'youtube', url: 'https://youtube.com/@globalnetwork', isVisible: true, order: 0 },
                            { platform: 'linkedin', url: 'https://linkedin.com/company/globalnetwork', isVisible: true, order: 1 },
                            { platform: 'twitch', url: 'https://twitch.tv/globalnetwork', isVisible: true, order: 2 },
                            { platform: 'facebook', url: 'https://facebook.com/globalnetwork', isVisible: true, order: 3 },
                            { platform: 'tiktok', url: 'https://tiktok.com/@globalnetwork', isVisible: true, order: 4 },
                            { platform: 'instagram', url: 'https://instagram.com/hidden_link', isVisible: false, order: 5 }, // hidden
                        ],
                    },
                },
            });
            console.log('Created /p/seo_multi_social profile.');
        }

        // 1.5 Organization profile
        let orgUser = await prisma.user.findUnique({ where: { username: 'seo_studio_corp' } });
        if (!orgUser) {
            orgUser = await prisma.user.create({
                data: {
                    username: 'seo_studio_corp',
                    displayName: 'PixelCraft Studios Ltd',
                    email: 'info@pixelcraftstudios.com',
                    bio: 'Creative design and digital branding studio company.',
                    themePrimaryColor: '#f59e0b',
                },
            });
            console.log('Created /p/seo_studio_corp profile.');
        }

        // Step 2: Test robots.txt
        console.log('\n[2] Testing /robots.txt ...');
        const robotsRes = await fetch(`${baseUrl}/robots.txt`);
        assert(robotsRes.status === 200, `robots.txt returned HTTP ${robotsRes.status}`);
        const robotsBody = await robotsRes.text();
        assert(robotsBody.includes('User-Agent: *') || robotsBody.includes('User-agent: *'), 'robots.txt specifies User-agent: *');
        assert(robotsBody.includes('Disallow: /dashboard'), 'robots.txt disallows /dashboard');
        assert(robotsBody.includes('Disallow: /api'), 'robots.txt disallows /api');
        assert(robotsBody.includes('Disallow: /forgot-password'), 'robots.txt disallows /forgot-password');
        assert(robotsBody.includes('Allow: /p/'), 'robots.txt allows /p/*');
        assert(robotsBody.includes('sitemap.xml'), 'robots.txt references sitemap.xml');

        // Step 3: Test /sitemap.xml
        console.log('\n[3] Testing /sitemap.xml ...');
        const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
        assert(sitemapRes.status === 200, `sitemap.xml returned HTTP ${sitemapRes.status}`);
        const sitemapBody = await sitemapRes.text();
        assert(sitemapBody.includes('urlset') || sitemapBody.includes('sitemapindex'), 'sitemap.xml is valid XML sitemap');
        assert(sitemapBody.includes('/p/'), 'sitemap includes public profile URLs');
        assert(!sitemapBody.includes('/dashboard'), 'sitemap excludes dashboard routes');
        assert(!sitemapBody.includes('/api/'), 'sitemap excludes api routes');
        assert(!sitemapBody.includes('password'), 'sitemap does not leak private info');

        // Step 4: Test /manifest.webmanifest
        console.log('\n[4] Testing /manifest.webmanifest ...');
        const manifestRes = await fetch(`${baseUrl}/manifest.webmanifest`);
        assert(manifestRes.status === 200, `manifest returned HTTP ${manifestRes.status}`);
        const manifestJson = await manifestRes.json();
        assert(manifestJson.name && manifestJson.name.includes('Linkle'), 'manifest contains application name');
        assert(Array.isArray(manifestJson.icons) && manifestJson.icons.length > 0, 'manifest contains icon definitions');

        // Step 5: Test /p/demo
        console.log('\n[5] Testing /p/demo ...');
        const demoRes = await fetch(`${baseUrl}/p/demo`);
        assert(demoRes.status === 200, `/p/demo returned HTTP ${demoRes.status}`);
        const demoHtml = await demoRes.text();

        // 5.1 Title
        assert(demoHtml.includes('Linkle Demo (@demo) | Linkle'), '/p/demo has dynamic title');
        // 5.2 Description
        assert(demoHtml.includes('Welcome to the official Linkle demo profile!'), '/p/demo has dynamic description');
        // 5.3 Canonical
        assert(demoHtml.includes('rel="canonical"') && demoHtml.includes('/p/demo'), '/p/demo has canonical link');
        // 5.4 OpenGraph
        assert(demoHtml.includes('property="og:title"') && demoHtml.includes('Linkle Demo (@demo)'), '/p/demo has og:title');
        assert(demoHtml.includes('property="og:url"') && demoHtml.includes('/p/demo'), '/p/demo has og:url');
        assert(demoHtml.includes('property="og:image"') && demoHtml.includes('/p/demo/opengraph-image'), '/p/demo has og:image');
        // 5.5 Twitter
        assert(demoHtml.includes('name="twitter:card"') && demoHtml.includes('summary_large_image'), '/p/demo has twitter:card');
        assert(demoHtml.includes('name="twitter:title"') && demoHtml.includes('Linkle Demo (@demo)'), '/p/demo has twitter:title');
        // 5.6 Structured Data (JSON-LD)
        const jsonLdMatches = demoHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        assert(jsonLdMatches !== null, '/p/demo contains JSON-LD structured data script');
        if (jsonLdMatches) {
            const parsedLd = JSON.parse(jsonLdMatches[1]);
            assert(parsedLd['@type'] === 'ProfilePage', 'JSON-LD @type is ProfilePage');
            assert(parsedLd.mainEntity['@type'] === 'Person', 'JSON-LD mainEntity is Person');
            assert(parsedLd.mainEntity.identifier === 'demo', 'JSON-LD identifier is demo');
            assert(Array.isArray(parsedLd.mainEntity.sameAs) && parsedLd.mainEntity.sameAs.length >= 5, `JSON-LD sameAs includes demo social links (got ${parsedLd.mainEntity.sameAs.length})`);
            // Security: verify absence of private fields
            assert(!parsedLd.mainEntity.email, 'Security: JSON-LD does not contain email');
            assert(!demoHtml.includes('profileViews'), 'Security: visitor analytics not exposed');
        }

        // Step 6: Test another real profile (/p/prxtik or /p/prxdata)
        console.log('\n[6] Testing another real profile (/p/prxtik) ...');
        const prxtikRes = await fetch(`${baseUrl}/p/prxtik`);
        assert(prxtikRes.status === 200, `/p/prxtik returned HTTP ${prxtikRes.status}`);
        const prxtikHtml = await prxtikRes.text();
        assert(prxtikHtml.includes('Pratik Parmar (@prxtik) | Linkle'), '/p/prxtik has dynamic title');
        assert(prxtikHtml.includes('rel="canonical"') && prxtikHtml.includes('/p/prxtik'), '/p/prxtik has canonical URL');
        assert(prxtikHtml.includes('property="og:image"'), '/p/prxtik has og:image');
        assert(!prxtikHtml.includes('pratikparmar458@gmail.com'), 'Security: prxtik email is not exposed');

        // Step 7: Test nonexistent profile
        console.log('\n[7] Testing nonexistent profile (/p/nonexistent_xyz_999) ...');
        const nonExistentRes = await fetch(`${baseUrl}/p/nonexistent_xyz_999`);
        assert(nonExistentRes.status === 404, `nonexistent profile returned HTTP 404 (got ${nonExistentRes.status})`);
        const nonExistentHtml = await nonExistentRes.text();
        assert(nonExistentHtml.includes('User Not Found') || nonExistentHtml.includes('404'), 'Nonexistent profile shows Not Found');

        // Step 8: Test profile with NO avatar
        console.log('\n[8] Testing profile with no avatar (/p/seo_no_avatar) ...');
        const noAvatarRes = await fetch(`${baseUrl}/p/seo_no_avatar`);
        assert(noAvatarRes.status === 200, `/p/seo_no_avatar returned HTTP ${noAvatarRes.status}`);
        const noAvatarHtml = await noAvatarRes.text();
        assert(noAvatarHtml.includes('No Avatar User (@seo_no_avatar) | Linkle'), 'No avatar profile has dynamic title');
        assert(noAvatarHtml.includes('/p/seo_no_avatar/opengraph-image'), 'No avatar profile references dynamic OG image');

        // Step 9: Test profile with LONG bio
        console.log('\n[9] Testing profile with long bio (/p/seo_long_bio) ...');
        const longBioRes = await fetch(`${baseUrl}/p/seo_long_bio`);
        assert(longBioRes.status === 200, `/p/seo_long_bio returned HTTP ${longBioRes.status}`);
        const longBioHtml = await longBioRes.text();
        // Extract meta description
        const metaDescMatch = longBioHtml.match(/<meta name="description" content="([^"]+)"/);
        assert(metaDescMatch !== null, 'Long bio profile has meta description');
        if (metaDescMatch) {
            const desc = metaDescMatch[1];
            assert(desc.length <= 160, `Meta description is cleanly truncated (length: ${desc.length} <= 160)`);
            assert(desc.endsWith('...'), 'Truncated meta description ends with ellipsis');
        }

        // Step 10: Test profile with MULTIPLE social links and Organization detection
        console.log('\n[10] Testing multiple social links & Organization schema ...');
        const multiSocialRes = await fetch(`${baseUrl}/p/seo_multi_social`);
        assert(multiSocialRes.status === 200, `/p/seo_multi_social returned HTTP 200`);
        const multiSocialHtml = await multiSocialRes.text();
        const multiSocialLdMatch = multiSocialHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        assert(multiSocialLdMatch !== null, 'Found JSON-LD script on multi_social');
        if (multiSocialLdMatch) {
            const parsed = JSON.parse(multiSocialLdMatch[1]);
            assert(Array.isArray(parsed.mainEntity.sameAs), 'sameAs is an array');
            assert(parsed.mainEntity.sameAs.length === 5, `sameAs includes only 5 visible links (got ${parsed.mainEntity.sameAs.length}), excluding hidden link`);
            assert(!parsed.mainEntity.sameAs.includes('https://instagram.com/hidden_link'), 'Hidden social link excluded from sameAs');
        }

        // Test Organization schema detection
        const orgRes = await fetch(`${baseUrl}/p/seo_studio_corp`);
        assert(orgRes.status === 200, `/p/seo_studio_corp returned HTTP 200`);
        const orgHtml = await orgRes.text();
        const orgLdMatch = orgHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        if (orgLdMatch) {
            const parsedOrg = JSON.parse(orgLdMatch[1]);
            assert(parsedOrg.mainEntity['@type'] === 'Organization', `Entity type for PixelCraft Studios Ltd detected as Organization (got ${parsedOrg.mainEntity['@type']})`);
        }

        // Step 11: Test Dynamic OG image generation
        console.log('\n[11] Testing dynamic OG image endpoints ...');
        const ogRes1 = await fetch(`${baseUrl}/p/demo/opengraph-image`);
        assert(ogRes1.status === 200, `/p/demo/opengraph-image returned HTTP ${ogRes1.status}`);
        assert(ogRes1.headers.get('content-type')?.includes('image/png'), `/p/demo/opengraph-image content-type is image/png (got ${ogRes1.headers.get('content-type')})`);

        const ogRes2 = await fetch(`${baseUrl}/p/seo_no_avatar/opengraph-image`);
        assert(ogRes2.status === 200, `/p/seo_no_avatar/opengraph-image returned HTTP ${ogRes2.status} (monogram fallback rendered)`);

        const ogApiRes = await fetch(`${baseUrl}/api/og?username=demo`);
        assert(ogApiRes.status === 200, `/api/og?username=demo returned HTTP ${ogApiRes.status}`);
        assert(ogApiRes.headers.get('content-type')?.includes('image/png'), `/api/og content-type is image/png`);

        // Step 12: Test Historical Username Permanent Redirect (308)
        console.log('\n[12] Testing historical username alias redirect ...');
        await prisma.usernameHistory.upsert({
            where: { username: 'seo_legacy_alias' },
            create: {
                username: 'seo_legacy_alias',
                userId: orgUser.id,
            },
            update: {
                userId: orgUser.id,
            },
        });

        const aliasRes = await fetch(`${baseUrl}/p/seo_legacy_alias`, { redirect: 'manual' });
        assert(aliasRes.status === 308, `Historical username alias returned HTTP 308 permanent redirect (got ${aliasRes.status})`);
        const redirectLocation = aliasRes.headers.get('location');
        assert(redirectLocation === '/p/seo_studio_corp' || redirectLocation?.endsWith('/p/seo_studio_corp'), `Alias redirects to canonical handle (location: ${redirectLocation})`);

        console.log(`\n=============================================`);
        if (failures === 0) {
            console.log(`🎉 ALL SEO SUITE TESTS PASSED WITH 0 FAILURES!`);
        } else {
            console.error(`💥 COMPLETED WITH ${failures} FAILED ASSERTIONS!`);
        }
        console.log(`=============================================\n`);

    } catch (err) {
        console.error('Test execution error:', err);
        failures++;
    } finally {
        await prisma.$disconnect();
        process.exit(failures > 0 ? 1 : 0);
    }
}

runSeoTests();
