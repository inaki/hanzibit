import { Coins, Link2, Share2, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherReferralDashboard } from "@/lib/referrals";
import {
  createReferralPayoutAction,
} from "@/lib/actions";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";
import { ReferralCopyButton } from "@/components/notebook/referral-copy-button";
import {
  TeachingCollectionSection,
  TeachingEntityCard,
  TeachingExplainerBlock,
  TeachingPageHeader,
  TeachingToneMetricCard,
} from "@/components/patterns/teaching";

export const dynamic = "force-dynamic";

function formatUsdFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function TeacherReferralsPage() {
  const userId = await getAuthUserId();

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  const dashboard = await getTeacherReferralDashboard(userId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = `${appUrl}/r/${dashboard.code.code}`;

  return (
    <div data-testid="teacher-referrals-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <TeachingPageHeader
          title="Referrals"
          description="Share your teacher code, bring students into HanziBit, and track the first referral-driven commission ledger before payouts are automated."
          badge="Referral MVP"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TeachingToneMetricCard title="Referral code" value={dashboard.code.code} tone="muted" icon={Link2} />
          <TeachingToneMetricCard
            title="Referred students"
            value={String(dashboard.referredStudents)}
            tone="sky"
            icon={Users}
          />
          <TeachingToneMetricCard
            title="Converted students"
            value={String(dashboard.convertedStudents)}
            tone="emerald"
            icon={Share2}
          />
          <TeachingToneMetricCard
            title="Pending commissions"
            value={formatUsdFromCents(dashboard.pendingCommissionCents)}
            tone={dashboard.pendingCommissionCents > 0 ? "amber" : "muted"}
            icon={Coins}
          />
        </div>

        <TeachingExplainerBlock
          title="How referral attribution works"
          tone="muted"
          body="Students who visit your referral link keep your code in a first-party cookie. Their first paid upgrade is attributed back to you."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="space-y-6">
            <TeachingCollectionSection icon={Link2} title="Share Link">
              <div className="mt-4 rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Referral link
                </p>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                  <p className="min-w-0 flex-1 break-all font-medium text-foreground">{referralLink}</p>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <ReferralCopyButton value={dashboard.code.code} label="Copy code" />
                    <ReferralCopyButton value={referralLink} label="Copy link" />
                  </div>
                </div>
              </div>
            </TeachingCollectionSection>

            <TeachingCollectionSection
              icon={Users}
              title="Recent Referred Students"
              empty={dashboard.recentAttributions.length === 0}
              emptyMessage="No referred students yet. Share your link with a class or tutoring group to start attribution."
            >
              <div className="mt-4 space-y-3">
                {dashboard.recentAttributions.map((student) => (
                  <TeachingEntityCard
                    key={student.attribution_id}
                    href={`/notebook/teacher/referrals`}
                    badges={
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                          student.converted_at
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {student.converted_at ? "Converted" : "Attributed"}
                      </span>
                    }
                    title={student.student_name}
                    subtitle={student.student_email}
                  >
                    <div className="mt-1 text-xs text-muted-foreground">
                      {student.converted_at
                        ? `Converted ${new Date(student.converted_at).toLocaleDateString("en-US")}`
                        : `Attributed ${new Date(student.attributed_at).toLocaleDateString("en-US")}`}
                    </div>
                  </TeachingEntityCard>
                ))}
              </div>
            </TeachingCollectionSection>
          </section>

          <aside className="space-y-6">
            <TeachingCollectionSection icon={Coins} title="Commission Ledger">
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <TeachingToneMetricCard title="Pending" value={formatUsdFromCents(dashboard.pendingCommissionCents)} tone="amber" />
                <TeachingToneMetricCard title="Approved" value={formatUsdFromCents(dashboard.approvedCommissionCents)} tone="sky" />
                <TeachingToneMetricCard title="Paid" value={formatUsdFromCents(dashboard.paidCommissionCents)} tone="emerald" />
              </div>

              <form action={createReferralPayoutAction} className="mt-4 space-y-3 rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground/80">Payout label</label>
                  <input
                    type="text"
                    name="period_label"
                    placeholder="Apr 2026"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This MVP marks all unpaid referral commissions as paid in one internal payout batch. External payouts are still tracked manually.
                </p>
                <PendingSubmitButton idleLabel="Mark pending commissions as paid" pendingLabel="Creating payout..." />
              </form>

              {dashboard.recentCommissions.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No commission entries yet. A pending commission appears after a referred student completes their first paid checkout.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {dashboard.recentCommissions.map((commission) => (
                    <TeachingEntityCard
                      key={commission.id}
                      href="/notebook/teacher/referrals"
                      badges={
                        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-400">
                          {commission.status}
                        </span>
                      }
                      title={commission.student_name}
                      subtitle={commission.student_email}
                    >
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Gross {formatUsdFromCents(commission.gross_amount_cents)}</span>
                        <span>Commission {formatUsdFromCents(commission.commission_amount_cents)}</span>
                        <span>{new Date(commission.created_at).toLocaleDateString("en-US")}</span>
                      </div>
                    </TeachingEntityCard>
                  ))}
                </div>
              )}
            </TeachingCollectionSection>

            <TeachingCollectionSection
              icon={Coins}
              title="Payout History"
              empty={dashboard.payouts.length === 0}
              emptyMessage="No payouts yet. Once pending commissions are paid, payout batches appear here."
            >
              <div className="mt-4 space-y-3">
                {dashboard.payouts.map((payout) => (
                  <TeachingEntityCard
                    key={payout.id}
                    href="/notebook/teacher/referrals"
                    badges={
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                        {payout.status}
                      </span>
                    }
                    title={payout.period_label}
                    subtitle={
                      payout.paid_at
                        ? `Paid ${new Date(payout.paid_at).toLocaleDateString("en-US")}`
                        : `Created ${new Date(payout.created_at).toLocaleDateString("en-US")}`
                    }
                  >
                    <div className="mt-1 text-xs text-muted-foreground">
                      Total {formatUsdFromCents(payout.total_amount_cents)}
                    </div>
                  </TeachingEntityCard>
                ))}
              </div>
            </TeachingCollectionSection>
          </aside>
        </div>
      </div>
    </div>
  );
}
