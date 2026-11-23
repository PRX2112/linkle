import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock next/headers
const mockHeadersGet = vi.fn();
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: mockHeadersGet,
  })),
}));

// Mock next-auth
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    paymentEvent: {
      create: vi.fn(),
    },
    capturedEmail: {
      findMany: vi.fn(),
    },
    passwordResetToken: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock ratelimit
vi.mock("@/lib/ratelimit", () => ({
  checkRateLimit: vi.fn(),
}));

// Mock stripe
vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/ratelimit";
import { stripe } from "@/lib/stripe";

// Route handlers under test
import { POST as checkoutPost } from "@/app/api/billing/checkout/route";
import { POST as portalPost } from "@/app/api/billing/portal/route";
import { POST as webhookPost } from "@/app/api/billing/webhook/route";
import { GET as productsGet, POST as productsPost } from "@/app/api/products/route";
import { POST as productCheckoutPost } from "@/app/api/products/checkout/route";
import { GET as exportSubscribersGet } from "@/app/api/subscribers/export/route";
import { POST as logIntentPost } from "@/app/api/payments/log-intent/route";
import { POST as claimUsernamePost } from "@/app/api/user/claim-username/route";
import { POST as forgotPasswordPost } from "@/app/api/auth/forgot-password/route";

describe("Protected Routes Auth Verification (401 Handling)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue(null); // Unauthenticated session
    (checkRateLimit as any).mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 1000 });
  });

  it("POST /api/billing/checkout returns 401 when unauthenticated", async () => {
    const req = new NextRequest("http://localhost:3000/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ plan: "pro" }),
    });
    const res = await checkoutPost(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("POST /api/billing/portal returns 401 when unauthenticated", async () => {
    const res = await portalPost();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("GET & POST /api/products returns 401 when unauthenticated", async () => {
    const getRes = await productsGet();
    expect(getRes.status).toBe(401);

    const postReq = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({ title: "My Pack", priceInCents: 500 }),
    });
    const postRes = await productsPost(postReq);
    expect(postRes.status).toBe(401);
  });

  it("GET /api/subscribers/export returns 401 when unauthenticated", async () => {
    const res = await exportSubscribersGet();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("POST /api/user/claim-username returns 401 when unauthenticated", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/claim-username", {
      method: "POST",
      body: JSON.stringify({ username: "alex123" }),
    });
    const res = await claimUsernamePost(req);
    expect(res.status).toBe(401);
  });
});

describe("Stripe Webhook Signature Verification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test123";
  });

  it("POST /api/billing/webhook rejects missing stripe-signature header with 400", async () => {
    mockHeadersGet.mockReturnValue(null);
    const req = new NextRequest("http://localhost:3000/api/billing/webhook", {
      method: "POST",
      body: JSON.stringify({ type: "checkout.session.completed" }),
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing signature/i);
  });

  it("POST /api/billing/webhook rejects invalid signature with 400, never raw 500 crash", async () => {
    mockHeadersGet.mockReturnValue("t=12345,v1=invalidsignaturehash");
    (stripe.webhooks.constructEvent as any).mockImplementation(() => {
      throw new Error("Invalid signature verification failed");
    });

    const req = new NextRequest("http://localhost:3000/api/billing/webhook", {
      method: "POST",
      body: JSON.stringify({ type: "checkout.session.completed" }),
    });
    const res = await webhookPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/webhook error/i);
    expect(body.stack).toBeUndefined();
  });
});

describe("Plan Gating and Quotas", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (checkRateLimit as any).mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 1000 });
  });

  it("GET /api/subscribers/export returns 403 when user is on Free tier", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_free" } });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user_free",
      username: "freeuser",
      plan: "free",
      subscription: null,
    });

    const res = await exportSubscribersGet();
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/pro and business plans only/i);
    expect(body.upgradeUrl).toBe("/dashboard/monetization");
  });

  it("POST /api/products enforces active product limit on Free tier (cap = 1)", async () => {
    (auth as any).mockResolvedValue({ user: { id: "user_free" } });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user_free",
      plan: "free",
      subscription: null,
    });
    (prisma.product.count as any).mockResolvedValue(1);

    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({
        title: "Second Product",
        priceInCents: 1000,
        type: "DIGITAL_FILE",
        isActive: true,
      }),
    });

    const res = await productsPost(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/limit reached/i);
  });
});

describe("Input Validation & User-Readable Error Messages", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (auth as any).mockResolvedValue({ user: { id: "user_pro" } });
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user_pro",
      plan: "pro",
      subscription: { status: "active", plan: "PRO" },
    });
    (prisma.product.count as any).mockResolvedValue(0);
    (checkRateLimit as any).mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 1000 });
  });

  it("POST /api/products returns 400 with descriptive error when title is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({
        priceInCents: 1000,
      }),
    });

    const res = await productsPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.stack).toBeUndefined();
  });

  it("POST /api/products/checkout returns 400 when productId is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/checkout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await productCheckoutPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/product id is required/i);
  });

  it("POST /api/payments/log-intent returns 400 when userId is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/payments/log-intent", {
      method: "POST",
      body: JSON.stringify({ amount: 50 }),
    });
    const res = await logIntentPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing or invalid userid/i);
  });
});

describe("Rate Limiting Handling (429)", () => {
  it("POST /api/payments/log-intent returns 429 when rate limit is exceeded", async () => {
    (checkRateLimit as any).mockResolvedValue({
      success: false,
      limit: 10,
      remaining: 0,
      reset: 60,
    });

    const req = new NextRequest("http://localhost:3000/api/payments/log-intent", {
      method: "POST",
      body: JSON.stringify({ userId: "u123", amount: 100 }),
    });

    const res = await logIntentPost(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/too many.*attempts/i);
  });
});

describe("Pending Features Graceful Verification (Prompts 3 & 7)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("POST /api/auth/forgot-password returns 200 generic success without sending real email", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "unknown@example.com" }),
    });

    const res = await forgotPasswordPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("POST /api/auth/forgot-password returns 400 for invalid email format", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
    });

    const res = await forgotPasswordPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid email/i);
  });
});
