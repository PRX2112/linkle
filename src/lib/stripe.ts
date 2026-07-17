import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_mock_placeholder_for_build";

export const stripe = new Stripe(apiKey, {
  apiVersion: "2025-01-27.accredited" as any, // Cast to any to prevent compile-time version mismatch warnings
});
