"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Github } from "lucide-react";
import { FormErrorNotice } from "@/components/patterns/forms";
import { GuidanceBanner } from "@/components/patterns/guidance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset, signIn, useSession } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Redirect to notebook if already logged in
  useEffect(() => {
    if (session && !isPending) {
      router.replace("/notebook");
    }
  }, [session, isPending, router]);

  if (session && !isPending) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Sign in failed");
      } else {
        router.push("/notebook");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    setResetLoading(true);

    try {
      const origin = window.location.origin;
      const result = await requestPasswordReset({
        email: resetEmail,
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (result.error) {
        setResetError(result.error.message || "Could not send reset email.");
      } else {
        setResetMessage("If that email exists, a reset link has been sent.");
      }
    } catch {
      setResetError("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div data-testid="signin-page" className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" data-testid="signin-logo-link" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">
              HanziBit
            </span>
          </Link>
        </div>

        <div data-testid="signin-card" className="rounded-xl border bg-card p-8 shadow-sm">
          <h1 data-testid="signin-heading" className="mb-2 text-2xl font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in to continue your learning journey
          </p>

          {error && (
            <FormErrorNotice>{error}</FormErrorNotice>
          )}

          <form data-testid="signin-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/80">
                Email
              </label>
              <Input
                data-testid="signin-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground/80">
                  Password
                </label>
                <button
                  type="button"
                  className="ui-tone-orange-text text-sm font-medium hover:underline"
                  onClick={() => {
                    setShowForgotPassword((value) => !value);
                    setResetError("");
                    setResetMessage("");
                    setResetEmail(email);
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                data-testid="signin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              data-testid="signin-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {showForgotPassword && (
            <GuidanceBanner tone="amber" className="mt-4">
              <h2 className="text-sm font-semibold text-foreground">
                Reset your password
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {resetError && (
                <FormErrorNotice>{resetError}</FormErrorNotice>
              )}

              {resetMessage && (
                <GuidanceBanner tone="emerald" className="mt-3 px-3 py-3 text-sm">
                  {resetMessage}
                </GuidanceBanner>
              )}

              <form onSubmit={handleForgotPassword} className="mt-3 space-y-3">
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <Button
                  type="submit"
                  disabled={resetLoading}
                  variant="outline"
                  className="w-full"
                >
                  {resetLoading ? "Sending reset link..." : "Send reset link"}
                </Button>
              </form>
            </GuidanceBanner>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div data-testid="signin-social-buttons" className="grid grid-cols-2 gap-3">
            <Button
              data-testid="signin-github-button"
              variant="outline"
              onClick={() => signIn.social({ provider: "github" })}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              data-testid="signin-google-button"
              variant="outline"
              onClick={() => signIn.social({ provider: "google" })}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>

          <p data-testid="signin-signup-link" className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="ui-tone-orange-text font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
