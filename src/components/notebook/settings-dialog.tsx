"use client";

import { useState, useEffect } from "react";
import { Settings, User, Type, GraduationCap, Lock, CreditCard, Crown, ExternalLink } from "lucide-react";
import { GuidanceBanner } from "@/components/patterns/guidance";
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
import { PLANS, formatUsd } from "@/lib/stripe";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type BillingCycle = "monthly" | "yearly";

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
  const [draftName, setDraftName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");

  // Pre-populate name from session if settings name is empty
  const sessionName = session?.user?.name ?? "";
  const sessionEmail = session?.user?.email ?? "";
  const profileName = settings.profile.name || sessionName;
  const name = isEditingName ? draftName : profileName;

  useEffect(() => {
    if (open) {
      getSubscriptionInfo().then(setSubInfo);
    }
  }, [open]);

  function handleNameBlur() {
    const trimmedName = name.trim();
    updateProfile({ name: trimmedName });
    setDraftName(trimmedName);
    setIsEditingName(false);
  }

  async function handleUpgrade(cycle: BillingCycle) {
    setBillingLoading(true);
    try {
      const priceId =
        cycle === "yearly"
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;
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
            <Settings className="ui-tone-orange-text mr-2 inline h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Customize your learning experience.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* --- Profile --- */}
          <section data-testid="settings-profile">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Profile
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">
                  Display Name
                </label>
                <Input
                  data-testid="settings-profile-name"
                  value={name}
                  onChange={(e) => {
                    setDraftName(e.target.value);
                    setIsEditingName(true);
                  }}
                  onBlur={handleNameBlur}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                  Email
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </label>
                <Input
                  data-testid="settings-profile-email"
                  type="email"
                  value={sessionEmail}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Email is linked to your account and cannot be changed here.
                </p>
              </div>
            </div>
          </section>

          {/* --- Subscription --- */}
          <section data-testid="settings-subscription">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5" />
              Subscription
            </h3>
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {subInfo?.plan === "pro" ? (
                    <Crown className="ui-tone-orange-text h-4 w-4" />
                  ) : null}
                  <span className="text-sm font-semibold text-foreground">
                    {subInfo?.plan === "pro" ? "Pro Plan" : "Free Plan"}
                  </span>
                  {subInfo?.plan === "pro" && (
                    <span className="ui-tone-orange-panel ui-tone-orange-text rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-foreground">
                  {subInfo?.plan === "pro"
                    ? `From $${formatUsd(PLANS.pro.priceYearlyMonthlyEquivalent)}/mo`
                    : "$0"}
                </span>
              </div>

              {subInfo?.cancelAtPeriodEnd && subInfo.currentPeriodEnd && (
                <p className="ui-tone-amber-text mt-2 text-xs">
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
                  <>
                    <div className="mb-3 inline-flex rounded-full border bg-muted p-1">
                      <button
                        type="button"
                        onClick={() => setBillingCycle("monthly")}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
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
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                          billingCycle === "yearly"
                            ? "bg-card font-medium text-foreground shadow-sm"
                            : "text-muted-foreground"
                        }`}
                      >
                        Yearly
                      </button>
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {billingCycle === "monthly"
                        ? `$${formatUsd(PLANS.pro.priceMonthly)}/month billed monthly.`
                        : `$${formatUsd(PLANS.pro.priceYearlyMonthlyEquivalent)}/month billed yearly at $${formatUsd(PLANS.pro.priceYearly)}/year.`}
                    </p>
                    <Button
                      data-testid="settings-upgrade-button"
                      size="sm"
                      onClick={() => handleUpgrade(billingCycle)}
                      disabled={billingLoading}
                      className="w-full bg-primary text-xs hover:opacity-90"
                    >
                      <Crown className="mr-1.5 h-3 w-3" />
                      {billingLoading
                        ? "Loading..."
                        : billingCycle === "monthly"
                          ? `Upgrade to Pro — $${formatUsd(PLANS.pro.priceMonthly)}/mo`
                          : `Upgrade to Pro — $${formatUsd(PLANS.pro.priceYearlyMonthlyEquivalent)}/mo yearly`}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* --- HSK Version --- */}
          <section data-testid="settings-hsk-version">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        ? "ui-tone-orange-panel border-[var(--ui-tone-orange-border)]"
                        : opt.available
                          ? "border-border bg-card hover:border-muted-foreground/30"
                          : "border-border bg-muted opacity-60"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${selected ? "ui-tone-orange-text" : "text-foreground"}`}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{opt.description}</p>
                    {!opt.available && (
                      <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                    {selected && opt.available && (
                      <span className="ui-tone-orange-dot absolute right-2 top-2 h-2 w-2 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* --- HSK Level --- */}
          <section data-testid="settings-hsk-level">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              Target HSK Level
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((level) => {
                const selected = settings.hskLevel === level;
                return (
                  <button
                    key={level}
                    data-testid={`settings-hsk-level-${level}`}
                    onClick={() => update({ hskLevel: level })}
                    className={`flex flex-col items-center gap-0.5 rounded-lg border p-3 transition-colors ${
                      selected
                        ? "ui-tone-orange-panel border-[var(--ui-tone-orange-border)]"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className={`text-lg font-bold ${selected ? "ui-tone-orange-text" : "text-foreground/80"}`}>
                      {level}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Progress is tracked against words at your target level.
            </p>
          </section>

          {/* --- Font Size --- */}
          <section data-testid="settings-font-size">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        ? "ui-tone-orange-panel border-[var(--ui-tone-orange-border)]"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <span className={`font-bold ${FONT_PREVIEW_SIZE[opt.value]} ${selected ? "ui-tone-orange-text" : "text-foreground/80"}`}>
                      {opt.preview}
                    </span>
                    <span className={`text-xs ${selected ? "ui-tone-orange-text font-medium" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Live preview */}
            <GuidanceBanner tone="muted" className="mt-3 border-dashed px-4 py-3">
              <p className="mb-1 text-xs text-muted-foreground">Preview</p>
              <p
                className={`leading-relaxed text-foreground ${
                  settings.fontSize === "normal"
                    ? "text-base"
                    : settings.fontSize === "large"
                      ? "text-lg"
                      : "text-xl"
                }`}
              >
                我喜欢学习中文。
              </p>
            </GuidanceBanner>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
