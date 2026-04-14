import { Coins, Link2, Share2, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth-utils";
import { isTeacherUser } from "@/lib/classrooms";
import { getTeacherReferralDashboard } from "@/lib/referrals";

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
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Phase 3
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Teacher Referrals</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Share your teacher code, bring students into HanziBit, and track the first referral-driven commission ledger before payouts are automated.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-1.5 text-xs font-medium text-[var(--cn-orange)]">
            Referral MVP
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Link2} label="Referral code" value={dashboard.code.code} />
          <SummaryCard icon={Users} label="Referred students" value={String(dashboard.referredStudents)} />
          <SummaryCard icon={Share2} label="Converted students" value={String(dashboard.convertedStudents)} />
          <SummaryCard icon={Coins} label="Pending commissions" value={formatUsdFromCents(dashboard.pendingCommissionCents)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Share Link
              </h2>
              <div className="mt-4 rounded-xl border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Referral link
                </p>
                <p className="mt-2 break-all font-medium text-foreground">{referralLink}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Students who visit this link keep your code in a first-party cookie. Their first paid upgrade is attributed back to you.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Recent Referred Students
              </h2>
              {dashboard.recentAttributions.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No referred students yet. Share your link with a class or tutoring group to start attribution.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {dashboard.recentAttributions.map((student) => (
                    <div key={student.attribution_id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{student.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{student.student_email}</p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                            student.converted_at
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {student.converted_at ? "Converted" : "Attributed"}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {student.converted_at
                          ? `Converted ${new Date(student.converted_at).toLocaleDateString("en-US")}`
                          : `Attributed ${new Date(student.attributed_at).toLocaleDateString("en-US")}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Commission Ledger
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {formatUsdFromCents(dashboard.pendingCommissionCents)}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Paid</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {formatUsdFromCents(dashboard.paidCommissionCents)}
                  </p>
                </div>
              </div>

              {dashboard.recentCommissions.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No commission entries yet. A pending commission appears after a referred student completes their first paid checkout.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {dashboard.recentCommissions.map((commission) => (
                    <div key={commission.id} className="rounded-xl border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{commission.student_name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{commission.student_email}</p>
                        </div>
                        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-400">
                          {commission.status}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Gross {formatUsdFromCents(commission.gross_amount_cents)}</span>
                        <span>Commission {formatUsdFromCents(commission.commission_amount_cents)}</span>
                        <span>{new Date(commission.created_at).toLocaleDateString("en-US")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4 text-[var(--cn-orange)]" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
