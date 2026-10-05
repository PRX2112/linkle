import { AnalyticsEventType, AnalyticsEventTypes, TrackEventInput } from './events';

function getVisitorId(): string {
    if (typeof window === 'undefined') return '';
    try {
        let visitorId = localStorage.getItem('linkle_visitor_id');
        if (!visitorId) {
            visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('linkle_visitor_id', visitorId);
        }
        return visitorId;
    } catch {
        return 'vis_fallback';
    }
}

function getReferrer(): string {
    if (typeof document === 'undefined') return 'Direct';
    return document.referrer || 'Direct';
}

export async function trackEvent(input: TrackEventInput): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        const payload = {
            ...input,
            visitorId: input.visitorId || getVisitorId(),
            referrer: input.referrer || getReferrer(),
        };

        const body = JSON.stringify(payload);

        // Attempt navigator.sendBeacon first for fast non-blocking transmission on unload
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            const blob = new Blob([body], { type: 'application/json' });
            const sent = navigator.sendBeacon('/api/analytics/event', blob);
            if (sent) return;
        }

        // Fallback to fetch with keepalive
        await fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        });
    } catch (err) {
        // Silently catch to prevent analytics from ever blocking user interactions
        console.warn('Analytics event tracking error:', err);
    }
}

// Convenience tracker helpers
export const tracker = {
    event: trackEvent,

    profileView: (userId: string, username?: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.PROFILE_VIEW,
            targetType: 'profile',
            targetTitle: username,
        }),

    linkClick: (userId: string, linkId: string, linkType: string, linkTitle: string, url: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.LINK_CLICK,
            targetId: linkId,
            targetType: linkType,
            targetTitle: linkTitle || linkType,
            url,
        }),

    ctaClick: (userId: string, targetId: string, label: string, url: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.CTA_CLICK,
            targetId,
            targetType: 'cta',
            targetTitle: label,
            url,
        }),

    upiOpen: (userId: string, upiId: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.UPI_OPEN,
            targetType: 'upi',
            targetTitle: 'UPI Pay Modal Open',
            metadata: { upiId },
        }),

    upiCopy: (userId: string, upiId: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.UPI_COPY,
            targetType: 'upi',
            targetTitle: 'UPI ID Copied',
            metadata: { upiId },
        }),

    qrView: (userId: string, context: string = 'profile') =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.QR_VIEW,
            targetType: 'qr',
            targetTitle: `QR Viewed (${context})`,
        }),

    qrDownload: (userId: string, filename?: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.QR_DOWNLOAD,
            targetType: 'qr',
            targetTitle: filename || 'QR Code Download',
        }),

    profileShare: (userId: string, method: string = 'native') =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.PROFILE_SHARE,
            targetType: 'profile',
            targetTitle: `Profile Share (${method})`,
        }),

    emailSubscribe: (userId: string, title?: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.EMAIL_SUBSCRIBE,
            targetType: 'email',
            targetTitle: title || 'Newsletter Subscription',
        }),

    contactSave: (userId: string, contactId: string, label: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.CONTACT_SAVE,
            targetId: contactId,
            targetType: 'contact',
            targetTitle: label,
        }),

    paymentClick: (userId: string, paymentId: string, platform: string, value: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.PAYMENT_CLICK,
            targetId: paymentId,
            targetType: 'payment',
            targetTitle: platform,
            metadata: { platform, value },
        }),

    bookingClick: (userId: string, contactId: string, label: string, url: string) =>
        trackEvent({
            userId,
            eventType: AnalyticsEventTypes.BOOKING_CLICK,
            targetId: contactId,
            targetType: 'contact_booking',
            targetTitle: label,
            url,
        }),
};
