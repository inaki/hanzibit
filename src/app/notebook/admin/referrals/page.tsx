import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import { overrideReferralAttributionAction } from "@/lib/actions";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

export const dynamic = "force-dynamic";

export default async function ReferralAdminPage() {
  const userId = await getAuthUserId();

  if (userId !== "dev-user-001") {
    redirect("/notebook");
  }

  return (
    <div data-testid="referral-admin-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Internal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Referral Support Tools</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manual override tools for support and QA. This page is intentionally dev-only in the current MVP.
          </p>
        </div>

        <section className="rounded-2xl bg-card card-ring p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Override Student Attribution
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reassign an existing or future student referral to a different teacher code. Existing commission rows move with the updated attribution.
          </p>

          <form action={overrideReferralAttributionAction} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/80">Student email</label>
              <input
                type="email"
                name="student_email"
                placeholder="student@example.com"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground/80">Referral code</label>
              <input
                type="text"
                name="referral_code"
                placeholder="TEACHR1"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            <PendingSubmitButton idleLabel="Apply override" pendingLabel="Applying override..." />
          </form>
        </section>
      </div>
    </div>
  );
}
