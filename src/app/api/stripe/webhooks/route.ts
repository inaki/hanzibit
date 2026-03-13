import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { upsertSubscription, getSubscriptionByCustomerId } from "@/lib/subscription";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getSubscriptionPeriodEnd(sub: Stripe.Subscription): string | null {
  // In newer Stripe API versions, current_period_end moved to subscription items
  const item = sub.items?.data?.[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemAny = item as any;
  if (itemAny?.current_period_end && typeof itemAny.current_period_end === "number") {
    return new Date(itemAny.current_period_end * 1000).toISOString();
  }
  // Fallback: use cancel_at
  if (sub.cancel_at) {
    return new Date(sub.cancel_at * 1000).toISOString();
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.customer || !session.subscription) break;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        upsertSubscription({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          plan: "pro",
          status: sub.status,
          currentPeriodEnd: getSubscriptionPeriodEnd(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const existing = getSubscriptionByCustomerId(customerId);
        if (!existing) break;

        const isCanceled =
          sub.status === "canceled" || sub.status === "unpaid";

        upsertSubscription({
          userId: existing.user_id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          plan: isCanceled ? "free" : "pro",
          status: sub.status,
          currentPeriodEnd: getSubscriptionPeriodEnd(sub),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const existing = getSubscriptionByCustomerId(customerId);
        if (!existing) break;

        upsertSubscription({
          userId: existing.user_id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: sub.id,
          plan: "free",
          status: "canceled",
          cancelAtPeriodEnd: false,
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
