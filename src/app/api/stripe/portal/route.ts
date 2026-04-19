import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription";
import { headers } from "next/headers";

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getSubscription(session.user.id);
    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/notebook`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal session creation failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
