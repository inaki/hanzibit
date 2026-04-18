"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export function LandingNav() {
  const { data: session } = useSession();

  return (
    <header data-testid="landing-nav" className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" data-testid="landing-nav-logo" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">
            HanziBit
          </span>
        </Link>

        <nav data-testid="landing-nav-links" className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            data-testid="landing-nav-features-link"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#demo"
            data-testid="landing-nav-preview-link"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Preview
          </Link>
          <Link
            href="#pricing"
            data-testid="landing-nav-pricing-link"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/teachers"
            data-testid="landing-nav-teachers-link"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Teachers
          </Link>
        </nav>

        <div data-testid="landing-nav-auth-buttons" className="flex items-center gap-3">
          {session ? (
            <Button
              data-testid="landing-nav-go-to-notebook-button"
              nativeButton={false}
              render={<Link href="/notebook" />}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              Go to Notebook
            </Button>
          ) : (
            <>
              <Button data-testid="landing-nav-signin-button" variant="ghost" nativeButton={false} render={<Link href="/auth/signin" />}>
                Sign In
              </Button>
              <Button
                data-testid="landing-nav-get-started-button"
                nativeButton={false}
                render={<Link href="/auth/signup" />}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
