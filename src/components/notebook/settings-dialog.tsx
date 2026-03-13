"use client";

import { useState, useEffect } from "react";
import { Settings, User, Type, GraduationCap, Lock, CreditCard, Crown, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import {
  useSettings,
  type FontSize,
  type HskVersion,
} from "./settings-context";
import { getSubscriptionInfo, type SubscriptionInfo } from "@/lib/subscription-action";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const FONT_OPTIONS: { value: FontSize; label: string; preview: string }[] = [
  { value: "normal", label: "Normal", preview: "Aa" },
  { value: "large", label: "Large", preview: "Aa" },
  { value: "extra-large", label: "Extra Large", preview: "Aa" },
];

const FONT_PREVIEW_SIZE: Record<FontSize, string> = {
  normal: "text-sm",
  large: "text-base",
  "extra-large": "text-lg",
};

const HSK_OPTIONS: { value: HskVersion; label: string; description: string; available: boolean }[] = [
  { value: "2.0", label: "HSK 2.0", description: "Classic 6 levels, ~5,000 words", available: true },
  { value: "3.0", label: "HSK 3.0", description: "New standard, 9 levels, ~11,000 words", available: false },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, update, updateProfile } = useSettings();
  const { data: session } = useSession();
  const [name, setName] = useState(settings.profile.name);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  // Pre-populate name from session if settings name is empty
  const sessionName = session?.user?.name ?? "";
  const sessionEmail = session?.user?.email ?? "";

  useEffect(() => {
    if (open) {
      setName(settings.profile.name || sessionName);
      getSubscriptionInfo().then(setSubInfo);
    }
  }, [open, settings.profile.name, sessionName]);

  function handleNameBlur() {
    updateProfile({ name: name.trim() });
  }

  async function handleUpgrade() {
    setBillingLoading(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
      if (!priceId) {
        console.error("Stripe price ID not configured");
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setBillingLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="settings-dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Settings className="mr-2 inline h-5 w-5 text-[var(--cn-orange)]" />
            Settings
          </DialogTitle>
          <DialogDescription>Customize your learning experience.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* --- Profile --- */}
          <section data-testid="settings-profile">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <User className="h-3.5 w-3.5" />
              Profile
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <Input
                  data-testid="settings-profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameBlur}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  Email
                  <Lock className="h-3 w-3 text-gray-400" />
                </label>
                <Input
                  data-testid="settings-profile-email"
                  type="email"
                  value={sessionEmail}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Email is linked to your account and cannot be changed here.
                </p>
              </div>
            </div>
          </section>

          {/* --- Subscription --- */}
          <section data-testid="settings-subscription">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <CreditCard className="h-3.5 w-3.5" />
              Subscription
            </h3>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {subInfo?.plan === "pro" ? (
                    <Crown className="h-4 w-4 text-[var(--cn-orange)]" />
                  ) : null}
                  <span className="text-sm font-semibold text-gray-900">
                    {subInfo?.plan === "pro" ? "Pro Plan" : "Free Plan"}
                  </span>
                  {subInfo?.plan === "pro" && (
                    <span className="rounded-full bg-[var(--cn-orange-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--cn-orange)]">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {subInfo?.plan === "pro" ? "$9/mo" : "$0"}
                </span>
              </div>

              {subInfo?.cancelAtPeriodEnd && subInfo.currentPeriodEnd && (
                <p className="mt-2 text-xs text-amber-600">
                  Cancels on{" "}
                  {new Date(subInfo.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}

              <div className="mt-3">
                {subInfo?.plan === "pro" ? (
                  <Button
                    data-testid="settings-manage-billing"
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    disabled={billingLoading}
                    className="w-full text-xs"
                  >
                    <ExternalLink className="mr-1.5 h-3 w-3" />
                    {billingLoading ? "Opening..." : "Manage Billing"}
                  </Button>
                ) : (
                  <Button
                    data-testid="settings-upgrade-button"
                    size="sm"
                    onClick={handleUpgrade}
                    disabled={billingLoading}
                    className="w-full bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)] text-xs"
                  >
                    <Crown className="mr-1.5 h-3 w-3" />
                    {billingLoading ? "Loading..." : "Upgrade to Pro — $9/mo"}
                  </Button>
                )}
              </div>
            </div>
          </section>

          {/* --- HSK Version --- */}
          <section data-testid="settings-hsk-version">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <GraduationCap className="h-3.5 w-3.5" />
              HSK Standard
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {HSK_OPTIONS.map((opt) => {
                const selected = settings.hskVersion === opt.value;
                return (
                  <button
                    key={opt.value}
                    data-testid={`settings-hsk-${opt.value}`}
                    disabled={!opt.available}
                    onClick={() => update({ hskVersion: opt.value })}
                    className={`relative rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? "border-[var(--cn-orange)] bg-[var(--cn-orange-light)]"
                        : opt.available
                          ? "border-gray-200 bg-white hover:border-gray-300"
                          : "border-gray-100 bg-gray-50 opacity-60"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${selected ? "text-[var(--cn-orange)]" : "text-gray-900"}`}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                    {!opt.available && (
                      <span className="mt-1.5 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        Coming soon
                      </span>
                    )}
                    {selected && opt.available && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--cn-orange)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* --- Font Size --- */}
          <section data-testid="settings-font-size">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Type className="h-3.5 w-3.5" />
              Font Size
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {FONT_OPTIONS.map((opt) => {
                const selected = settings.fontSize === opt.value;
                return (
                  <button
                    key={opt.value}
                    data-testid={`settings-font-${opt.value}`}
                    onClick={() => update({ fontSize: opt.value })}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                      selected
                        ? "border-[var(--cn-orange)] bg-[var(--cn-orange-light)]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className={`font-bold ${FONT_PREVIEW_SIZE[opt.value]} ${selected ? "text-[var(--cn-orange)]" : "text-gray-700"}`}>
                      {opt.preview}
                    </span>
                    <span className={`text-xs ${selected ? "text-[var(--cn-orange)] font-medium" : "text-gray-500"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Live preview */}
            <div className="mt-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Preview</p>
              <p
                className={`text-gray-800 leading-relaxed ${
                  settings.fontSize === "normal"
                    ? "text-base"
                    : settings.fontSize === "large"
                      ? "text-lg"
                      : "text-xl"
                }`}
              >
                我喜欢学习中文。
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
