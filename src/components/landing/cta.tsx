"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function LandingCTA() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleProClick() {
    if (!session) return; // will fall through to Link
    setLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
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
    <section data-testid="landing-cta" id="pricing" className="border-t bg-white px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-block text-6xl">📖</div>
        <h2 data-testid="landing-cta-heading" className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Ready to start your Chinese journey?
        </h2>
        <p data-testid="landing-cta-description" className="mb-10 text-lg text-gray-600">
          Join thousands of learners who are mastering Chinese with a structured,
          notebook-style approach. Start free and upgrade when you&apos;re ready.
        </p>

        <div data-testid="landing-pricing-cards" className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          <div data-testid="landing-pricing-free" className="rounded-xl border p-6 text-left">
            <h3 className="mb-1 text-lg font-semibold">Free</h3>
            <p data-testid="landing-pricing-free-price" className="mb-4 text-3xl font-bold">
              $0<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <ul data-testid="landing-pricing-free-features" className="mb-6 space-y-2 text-sm text-gray-600">
              <li>Daily journal entries</li>
              <li>Basic vocabulary list</li>
              <li>HSK 1 content</li>
              <li>5 flashcard reviews/day</li>
            </ul>
            <Button data-testid="landing-pricing-free-button" variant="outline" nativeButton={false} render={<Link href="/auth/signup" />} className="w-full">
              Get Started
            </Button>
          </div>

          <div data-testid="landing-pricing-pro" className="rounded-xl border-2 border-[var(--cn-orange)] p-6 text-left">
            <h3 className="mb-1 text-lg font-semibold">Pro</h3>
            <p data-testid="landing-pricing-pro-price" className="mb-4 text-3xl font-bold">
              $9<span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <ul data-testid="landing-pricing-pro-features" className="mb-6 space-y-2 text-sm text-gray-600">
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
                onClick={handleProClick}
                disabled={loading}
                className="w-full bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
              >
                {loading ? "Loading..." : "Upgrade to Pro"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            ) : (
              <Button
                data-testid="landing-pricing-pro-button"
                nativeButton={false}
                render={<Link href="/auth/signup" />}
                className="w-full bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
