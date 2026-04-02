import { DashboardView } from "@/components/notebook/dashboard-view";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div data-testid="dashboard-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <DashboardView />
    </div>
  );
}
