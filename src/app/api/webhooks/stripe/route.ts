import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import {
  syncStripeSubscription,
  handleSubscriptionDeleted,
} from "@/lib/billing/subscription";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error(`❌ Webhook signature verification failed: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // 1. Idempotency Check: Prevent duplicate event processing from webhook retries
  try {
    const alreadyProcessed = await prisma.webhookEvent.findUnique({
      where: { id: event.id },
    });

    if (alreadyProcessed) {
      console.log(`ℹ️ Duplicate webhook event ignored: ${event.id} (${event.type})`);
      return NextResponse.json({ received: true, duplicate: true });
    }
  } catch (dbErr) {
    console.error("Error querying webhook idempotency store:", dbErr);
  }

  try {
    // 2. Process Webhook Event Types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (subscriptionId) {
          await syncStripeSubscription(subscriptionId);
        } else if (userId && customerId) {
          // One-off or customer record sync
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncStripeSubscription(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;
        await handleSubscriptionDeleted(subscription.id, customerId);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription;
        if (subId) {
          await syncStripeSubscription(subId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).subscription;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : (invoice.customer as any)?.id;

        if (subId || customerId) {
          // Mark subscription status as past_due
          await prisma.subscription.updateMany({
            where: {
              OR: [
                ...(subId ? [{ stripeSubscriptionId: subId }] : []),
                ...(customerId ? [{ stripeCustomerId: customerId }] : []),
              ],
            },
            data: { status: "past_due" },
          });
          console.warn(`⚠️ Payment failed for invoice ${invoice.id}, subscription ${subId}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Stripe webhook event type: ${event.type}`);
    }

    // 3. Record Event ID for Strict Idempotency
    await prisma.webhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
        payload: event.data.object as any,
      },
    });

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error("❌ Error processing Stripe webhook event:", error);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}
