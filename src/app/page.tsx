import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingDemo } from "@/components/landing/demo";
import { LandingCTA } from "@/components/landing/cta";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div data-testid="landing-page" className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingDemo />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
