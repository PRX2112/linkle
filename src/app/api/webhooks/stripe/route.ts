import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`❌ Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId) {
          console.warn("⚠️ Checkout session completed but missing userId/client_reference_id.");
          break;
        }

        if (subscriptionId) {
          // Retrieve subscription details to get the priceId and period end timestamp
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          const priceId = subscription.items.data[0]?.price.id;
          const periodEnd = new Date(subscription.current_period_end * 1000);
          const plan = session.metadata?.plan || "Pro";

          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId,
              stripeCurrentPeriodEnd: periodEnd,
            },
          });

          console.log(`✅ User ${userId} upgraded to ${plan} subscription (${subscriptionId})`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const periodEnd = new Date(subscription.current_period_end * 1000);

        // Map status. If canceled, incomplete_expired, etc., downgrade
        const isInactive = ["canceled", "unpaid", "incomplete_expired"].includes(subscription.status);
        const plan = isInactive ? "Starter" : (subscription.metadata?.plan || "Pro");

        // Find user by subscription ID or customer ID
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              { stripeCustomerId: customerId },
            ],
          },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              stripePriceId: isInactive ? null : priceId,
              stripeCurrentPeriodEnd: isInactive ? null : periodEnd,
              // If fully canceled/deleted, null out subscription field
              stripeSubscriptionId: isInactive ? null : subscriptionId,
            },
          });
          console.log(`✅ Subscription updated for user ${user.id}: Status is ${subscription.status}, plan is ${plan}`);
        } else {
          console.warn(`⚠️ Subscription updated but no matching user found (subId: ${subscriptionId}, customerId: ${customerId})`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;

        // Find user by subscription ID or customer ID
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              { stripeCustomerId: customerId },
            ],
          },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "Starter",
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          });
          console.log(`✅ Subscription deleted: user ${user.id} downgraded back to Starter tier`);
        } else {
          console.warn(`⚠️ Subscription deleted but no matching user found (subId: ${subscriptionId}, customerId: ${customerId})`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing Stripe webhook event:", error);
    return NextResponse.json({ error: "Internal server error processing webhook" }, { status: 500 });
  }
}
