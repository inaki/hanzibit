"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { FormErrorNotice } from "@/components/patterns/forms";
import { GuidanceBanner } from "@/components/patterns/guidance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const tokenError = searchParams.get("error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resolvedError = useMemo(() => {
    if (tokenError === "INVALID_TOKEN") {
      return "This reset link is invalid or has expired.";
    }
    return "";
  }, [tokenError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        token,
        newPassword: password,
      });

      if (result.error) {
        setError(result.error.message || "Could not reset password.");
      } else {
        setSuccess("Your password has been updated. Redirecting to sign in...");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 1200);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">HanziBit</span>
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Reset password</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>

          {(resolvedError || error) && (
            <FormErrorNotice>{resolvedError || error}</FormErrorNotice>
          )}

          {success && (
            <GuidanceBanner tone="emerald" className="mb-4 px-3 py-3 text-sm">
              {success}
            </GuidanceBanner>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/80">
                New password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/80">
                Confirm new password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !token || Boolean(resolvedError)}
              className="w-full bg-primary hover:opacity-90"
            >
              {loading ? "Updating password..." : "Update password"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Back to{" "}
            <Link href="/auth/signin" className="ui-tone-orange-text font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
