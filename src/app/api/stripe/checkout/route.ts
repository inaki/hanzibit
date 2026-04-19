import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getSubscription } from "@/lib/subscription";
import { cookies, headers } from "next/headers";
import {
  REFERRAL_COOKIE_NAME,
  ensureReferralAttribution,
  getReferralAttributionForStudent,
} from "@/lib/referrals";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();
    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    const allowedPriceIds = new Set(
      [
        process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
        process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      ].filter(Boolean)
    );
    if (!allowedPriceIds.has(priceId)) {
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
    }

    const userId = session.user.id;
    const existing = await getSubscription(userId);
    const cookieStore = await cookies();
    const referralCode = cookieStore.get(REFERRAL_COOKIE_NAME)?.value || "";
    const existingAttribution = await getReferralAttributionForStudent(userId);
    const attribution =
      existingAttribution ||
      (referralCode
        ? await ensureReferralAttribution({
            studentUserId: userId,
            code: referralCode,
            attributionSource: "checkout_cookie",
          })
        : null);

    // Reuse existing Stripe customer if we have one
    let customerId = existing?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { userId },
      });
      customerId = customer.id;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const metadata: Record<string, string> = { userId };
    if (attribution) {
      metadata.referralAttributionId = attribution.id;
      metadata.referralTeacherUserId = attribution.teacher_user_id;
      metadata.referralCode = attribution.referral_code;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/notebook?upgraded=true`,
      cancel_url: `${appUrl}/notebook?canceled=true`,
      metadata,
      subscription_data: {
        metadata,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout session creation failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
