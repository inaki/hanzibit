import Stripe from "stripe";

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env.local to enable payments."
    );
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });
}

// Lazy-initialized — only throws when actually used, not at import time
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) _stripe = getStripeClient();
  return _stripe;
}

// Keep a convenience export for direct use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  free: {
    name: "Free",
    priceMonthly: 0,
    features: [
      "Daily journal entries",
      "Basic vocabulary list",
      "HSK 1 content",
      "5 flashcard reviews/day",
    ],
  },
  pro: {
    name: "Pro",
    priceMonthly: 9,
    features: [
      "Unlimited journal entries",
      "All HSK levels (1-6)",
      "Unlimited flashcards",
      "Grammar deep-dives",
      "Pronunciation practice",
      "Export & print",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
