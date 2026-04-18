"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { PLANS, formatUsd } from "@/lib/stripe";

type BillingCycle = "monthly" | "yearly";

export function LandingCTA() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  async function handleProClick(cycle: BillingCycle) {
    if (!session) return; // will fall through to Link
    setLoading(true);
    try {
      const priceId =
        cycle === "yearly"
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
      if (!priceId) return;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }
  return (
    <section data-testid="landing-cta" id="pricing" className="border-t bg-background px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-block text-6xl">📖</div>
        <h2 data-testid="landing-cta-heading" className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
          Ready to start your Chinese journey?
        </h2>
        <p data-testid="landing-cta-description" className="mb-10 text-lg text-muted-foreground">
          Join thousands of learners who are mastering Chinese with a structured,
          notebook-style approach. Start free and upgrade when you&apos;re ready.
        </p>

        <div className="mb-8 inline-flex rounded-full border bg-muted p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              billingCycle === "monthly"
                ? "bg-card font-medium text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              billingCycle === "yearly"
                ? "bg-card font-medium text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Yearly
          </button>
        </div>

        <div data-testid="landing-pricing-cards" className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          <div data-testid="landing-pricing-free" className="rounded-xl border p-6 text-left">
            <h3 className="mb-1 text-lg font-semibold">Free</h3>
            <p data-testid="landing-pricing-free-price" className="mb-4 text-3xl font-bold">
              $0<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <ul data-testid="landing-pricing-free-features" className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li>Daily journal entries</li>
              <li>Basic vocabulary list</li>
              <li>HSK 1 content</li>
              <li>5 flashcard reviews/day</li>
            </ul>
            <Button data-testid="landing-pricing-free-button" variant="outline" nativeButton={false} render={<Link href="/auth/signup" />} className="w-full">
              Get Started
            </Button>
          </div>

          <div data-testid="landing-pricing-pro" className="ui-tone-orange-panel rounded-xl border-2 p-6 text-left">
            <h3 className="mb-1 text-lg font-semibold">Pro</h3>
            <p data-testid="landing-pricing-pro-price" className="mb-4 text-3xl font-bold">
              {billingCycle === "monthly" ? (
                <>
                  ${formatUsd(PLANS.pro.priceMonthly)}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </>
              ) : (
                <>
                  ${formatUsd(PLANS.pro.priceYearlyMonthlyEquivalent)}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </>
              )}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              {billingCycle === "monthly"
                ? "Flexible monthly billing."
                : `$${formatUsd(PLANS.pro.priceYearly)}/year billed annually.`}
            </p>
            <ul data-testid="landing-pricing-pro-features" className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li>Unlimited journal entries</li>
              <li>All HSK levels (1-6)</li>
              <li>Unlimited flashcards</li>
              <li>Grammar deep-dives</li>
              <li>Pronunciation practice</li>
              <li>Export &amp; print</li>
            </ul>
            {session ? (
              <Button
                data-testid="landing-pricing-pro-button"
                onClick={() => handleProClick(billingCycle)}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
              >
                {loading
                  ? "Loading..."
                  : billingCycle === "monthly"
                    ? "Upgrade to Pro Monthly"
                    : "Upgrade to Pro Yearly"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            ) : (
              <Button
                data-testid="landing-pricing-pro-button"
                nativeButton={false}
                render={<Link href="/auth/signup" />}
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
              >
                {billingCycle === "monthly" ? "Start Monthly Plan" : "Start Yearly Plan"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
