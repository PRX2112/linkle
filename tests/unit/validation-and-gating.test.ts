import { describe, it, expect } from "vitest";
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductToggleSchema,
  ProductReorderSchema,
  ClaimUsernameSchema,
  BillingCheckoutSchema,
} from "@/lib/validation";
import { getMaxActiveProducts } from "@/lib/billing/entitlements";
import { normalizePlanTier } from "@/lib/billing/plans";

describe("Validation Schemas for New Features", () => {
  describe("ProductCreateSchema", () => {
    it("should accept valid product input", () => {
      const valid = {
        title: "Digital Icon Pack",
        description: "100+ SVG icons for your apps",
        priceInCents: 999,
        currency: "USD",
        type: "DIGITAL_FILE",
        fileUrl: "https://res.cloudinary.com/demo/image/upload/sample.zip",
      };
      const result = ProductCreateSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject negative or sub-50-cent price", () => {
      const invalidZero = {
        title: "Freebie",
        priceInCents: 0,
        type: "TIP",
      };
      expect(ProductCreateSchema.safeParse(invalidZero).success).toBe(false);

      const invalidNegative = {
        title: "Negative",
        priceInCents: -500,
        type: "TIP",
      };
      expect(ProductCreateSchema.safeParse(invalidNegative).success).toBe(false);

      const invalidSub50 = {
        title: "Too Cheap",
        priceInCents: 49,
        type: "TIP",
      };
      expect(ProductCreateSchema.safeParse(invalidSub50).success).toBe(false);
    });

    it("should reject empty string title and over-100-char title", () => {
      const emptyTitle = {
        title: "",
        priceInCents: 500,
        type: "TIP",
      };
      expect(ProductCreateSchema.safeParse(emptyTitle).success).toBe(false);

      const tooLongTitle = {
        title: "a".repeat(101),
        priceInCents: 500,
        type: "TIP",
      };
      expect(ProductCreateSchema.safeParse(tooLongTitle).success).toBe(false);
    });

    it("should reject unsupported product type", () => {
      const invalidType = {
        title: "Custom Service",
        priceInCents: 1500,
        type: "SUBSCRIPTION_RECURRING",
      };
      expect(ProductCreateSchema.safeParse(invalidType).success).toBe(false);
    });
  });

  describe("ProductToggleSchema", () => {
    it("should accept valid boolean isActive", () => {
      expect(ProductToggleSchema.safeParse({ isActive: true }).success).toBe(true);
      expect(ProductToggleSchema.safeParse({ isActive: false }).success).toBe(true);
    });

    it("should reject non-boolean types", () => {
      expect(ProductToggleSchema.safeParse({ isActive: "true" }).success).toBe(false);
      expect(ProductToggleSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("ProductReorderSchema", () => {
    it("should accept valid array of cuid and non-negative order", () => {
      const valid = {
        products: [
          { id: "c123456789012345678901234", order: 0 },
          { id: "c123456789012345678901235", order: 1 },
        ],
      };
      expect(ProductReorderSchema.safeParse(valid).success).toBe(true);
    });

    it("should reject non-cuid IDs or negative orders", () => {
      expect(
        ProductReorderSchema.safeParse({
          products: [{ id: "not-a-cuid", order: 0 }],
        }).success
      ).toBe(false);

      expect(
        ProductReorderSchema.safeParse({
          products: [{ id: "c123456789012345678901234", order: -1 }],
        }).success
      ).toBe(false);
    });
  });

  describe("ClaimUsernameSchema", () => {
    it("should accept valid usernames", () => {
      expect(ClaimUsernameSchema.safeParse({ username: "alex-123" }).success).toBe(true);
      expect(ClaimUsernameSchema.safeParse({ username: "jane_doe" }).success).toBe(true);
    });

    it("should reject invalid usernames (symbols, spaces, reserved words, too short/long)", () => {
      expect(ClaimUsernameSchema.safeParse({ username: "a" }).success).toBe(false);
      expect(ClaimUsernameSchema.safeParse({ username: "a".repeat(25) }).success).toBe(false);
      expect(ClaimUsernameSchema.safeParse({ username: "admin" }).success).toBe(false);
      expect(ClaimUsernameSchema.safeParse({ username: "api" }).success).toBe(false);
      expect(ClaimUsernameSchema.safeParse({ username: "dashboard" }).success).toBe(false);
      expect(ClaimUsernameSchema.safeParse({ username: "user@name!" }).success).toBe(false);
    });
  });

  describe("BillingCheckoutSchema", () => {
    it("should accept valid plan and intervals", () => {
      expect(BillingCheckoutSchema.safeParse({ plan: "pro", interval: "month" }).success).toBe(true);
      expect(BillingCheckoutSchema.safeParse({ plan: "business", interval: "year" }).success).toBe(true);
    });

    it("should reject invalid intervals or missing plan", () => {
      expect(BillingCheckoutSchema.safeParse({ plan: "", interval: "month" }).success).toBe(false);
      expect(BillingCheckoutSchema.safeParse({ plan: "pro", interval: "lifetime" }).success).toBe(false);
    });
  });
});

describe("Plan Entitlements and Gating Logic", () => {
  it("enforces product limits strictly per tier", () => {
    expect(getMaxActiveProducts("free")).toBe(1);
    expect(getMaxActiveProducts(null)).toBe(1);
    expect(getMaxActiveProducts("starter")).toBe(1);
    expect(getMaxActiveProducts("pro")).toBe(5);
    expect(getMaxActiveProducts("PRO")).toBe(5);
    expect(getMaxActiveProducts("business")).toBe(Infinity);
    expect(getMaxActiveProducts("enterprise")).toBe(Infinity);
  });

  it("normalizes plan tiers correctly across cases and aliases", () => {
    expect(normalizePlanTier("free")).toBe("STARTER");
    expect(normalizePlanTier("starter")).toBe("STARTER");
    expect(normalizePlanTier("pro")).toBe("PRO");
    expect(normalizePlanTier("PRO")).toBe("PRO");
    expect(normalizePlanTier("business")).toBe("ENTERPRISE");
    expect(normalizePlanTier("enterprise")).toBe("ENTERPRISE");
    expect(normalizePlanTier("unknown_plan")).toBe("STARTER");
  });
});
