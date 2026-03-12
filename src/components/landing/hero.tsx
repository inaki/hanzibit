import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function LandingHero() {
  return (
    <section data-testid="landing-hero" className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 text-[200px] font-bold leading-none text-[var(--cn-orange)]/5 select-none">
          学
        </div>
        <div className="absolute right-1/4 top-40 text-[150px] font-bold leading-none text-[var(--cn-orange)]/5 select-none">
          写
        </div>
        <div className="absolute left-1/3 bottom-20 text-[180px] font-bold leading-none text-[var(--cn-orange)]/5 select-none">
          读
        </div>
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div data-testid="landing-hero-badge" className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange-light)] px-4 py-1.5 text-sm text-[var(--cn-orange)]">
          <Sparkles className="h-4 w-4" />
          Your personal Chinese learning companion
        </div>

        <h1 data-testid="landing-hero-heading" className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          Master Chinese,
          <br />
          <span className="text-[var(--cn-orange)]">One Character</span> at a
          Time
        </h1>

        <p data-testid="landing-hero-description" className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
          A beautiful notebook-style app designed for structured Chinese
          learning. Track your HSK progress, write daily journal entries, build
          vocabulary, and master grammar points — all in one place.
        </p>

        <div data-testid="landing-hero-cta-buttons" className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            data-testid="landing-hero-start-button"
            size="lg"
            nativeButton={false}
            render={<Link href="/auth/signup" />}
            className="h-12 bg-[var(--cn-orange)] px-8 text-base hover:bg-[var(--cn-orange-dark)]"
          >
            Start Learning Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            data-testid="landing-hero-demo-button"
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="#demo" />}
            className="h-12 px-8 text-base"
          >
            See How It Works
          </Button>
        </div>

        <p data-testid="landing-hero-subtext" className="mt-4 text-sm text-gray-500">
          Free forever for basic features. No credit card required.
        </p>
      </div>
    </section>
  );
}
