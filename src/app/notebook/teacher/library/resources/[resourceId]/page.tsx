import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { getAuthUserId } from "@/lib/auth-utils";
import { updateTeacherResourceAction } from "@/lib/actions";
import { isTeacherUser } from "@/lib/classrooms";
import { canManageTeacherResource } from "@/lib/classroom-permissions";
import { getTeacherResource, listTeacherResourceItems } from "@/lib/teacher-resources";
import { PendingSubmitButton } from "@/components/notebook/pending-submit-button";

export const dynamic = "force-dynamic";

export default async function TeacherResourceDetailPage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const userId = await getAuthUserId();
  const { resourceId } = await params;

  if (!(await isTeacherUser(userId))) {
    redirect("/notebook/classes");
  }

  if (!(await canManageTeacherResource(userId, resourceId))) {
    notFound();
  }

  const [resource, items] = await Promise.all([
    getTeacherResource(resourceId),
    listTeacherResourceItems(resourceId),
  ]);

  if (!resource) {
    notFound();
  }

  async function updateResourceFormAction(formData: FormData) {
    "use server";
    await updateTeacherResourceAction(formData);
  }

  return (
    <div data-testid="teacher-resource-detail-page" className="h-full overflow-auto p-6 pb-20 md:p-10 lg:pb-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Teacher resource</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{resource.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {resource.description || "No description yet."}
            </p>
          </div>
          <Link
            href="/notebook/teacher/library"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Back to library
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--cn-orange)]" />
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Details</h2>
            </div>
            <form action={updateResourceFormAction} className="space-y-3">
              <input type="hidden" name="id" value={resource.id} />
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={resource.title}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={resource.description || ""}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground/80">HSK level</label>
                <input
                  name="hsk_level"
                  type="number"
                  min={1}
                  max={6}
                  defaultValue={resource.hsk_level ?? ""}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--cn-orange)]"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground/80">
                <input type="checkbox" name="archived" defaultChecked={resource.archived === 1} className="h-4 w-4" />
                Archive resource
              </label>
              <PendingSubmitButton pendingLabel="Updating resource..." className="w-full justify-center rounded-lg bg-[var(--cn-orange)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--cn-orange-dark)]">
                Update Resource
              </PendingSubmitButton>
            </form>
          </section>

          <aside className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Metadata</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium text-foreground">{resource.resource_type.replaceAll("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium text-foreground">{items.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium text-foreground">{new Date(resource.updated_at).toLocaleDateString("en-US")}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
