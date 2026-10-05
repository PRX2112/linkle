export const AnalyticsEventTypes = {
    PROFILE_VIEW: 'PROFILE_VIEW',
    LINK_CLICK: 'LINK_CLICK',
    CTA_CLICK: 'CTA_CLICK',
    UPI_OPEN: 'UPI_OPEN',
    UPI_COPY: 'UPI_COPY',
    QR_VIEW: 'QR_VIEW',
    QR_DOWNLOAD: 'QR_DOWNLOAD',
    PROFILE_SHARE: 'PROFILE_SHARE',
    EMAIL_SUBSCRIBE: 'EMAIL_SUBSCRIBE',
    CONTACT_SAVE: 'CONTACT_SAVE',
    PAYMENT_CLICK: 'PAYMENT_CLICK',
    BOOKING_CLICK: 'BOOKING_CLICK',
} as const;

export type AnalyticsEventType = (typeof AnalyticsEventTypes)[keyof typeof AnalyticsEventTypes];

export type AnalyticsDateRange = '7d' | '14d' | '30d' | '90d';

export interface TrackEventInput {
    userId: string;
    eventType: AnalyticsEventType;
    visitorId?: string;
    targetId?: string;
    targetType?: 'social' | 'business' | 'payment' | 'contact' | 'upi' | 'qr' | 'email' | 'profile' | string;
    targetTitle?: string;
    url?: string;
    referrer?: string;
    metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface FunnelStage {
    name: string;
    description: string;
    count: number;
    percentage: number; // percentage of top of funnel
    dropoffPercentage: number;
}

export interface ConversionMetrics {
    profileViews: number;
    totalClicks: number;
    ctr: number; // percentage
    emailConversion: {
        count: number;
        rate: number; // percentage of views
    };
    upiInteractions: {
        total: number;
        opened: number;
        copied: number;
    };
    profileShares: number;
    contactActions: {
        total: number;
        saved: number;
        bookings: number;
    };
    qrInteractions: {
        viewed: number;
        downloaded: number;
    };
}

export interface TrafficSourceItem {
    name: string;
    count: number;
    pct: number;
}

export interface UtmCampaignReportItem {
    campaign: string;
    source?: string | null;
    medium?: string | null;
    clicks: number;
    pct: number;
}

export interface UtmDimensionReportItem {
    name: string;
    clicks: number;
    pct: number;
}

export interface UtmAnalyticsReport {
    campaigns: UtmCampaignReportItem[];
    sources: UtmDimensionReportItem[];
    mediums: UtmDimensionReportItem[];
    totalCampaignClicks: number;
}

export interface PeriodComparison {
    viewsChangePct: number | null;
    clicksChangePct: number | null;
    ctrChangePct: number | null;
    visitorsChangePct: number | null;
    previousPeriod: {
        views: number;
        clicks: number;
        ctr: number;
        visitors: number;
    };
}
