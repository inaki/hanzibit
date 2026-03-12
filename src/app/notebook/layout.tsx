import { NotebookNav } from "@/components/notebook/nav";
import { NotebookSidebar } from "@/components/notebook/sidebar";

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-testid="notebook-layout" className="flex h-screen flex-col">
      <NotebookNav />
      <div className="flex flex-1 overflow-hidden">
        <NotebookSidebar />
        <main data-testid="notebook-main-content" className="flex-1 overflow-auto bg-[#f5f3f0]">{children}</main>
      </div>
    </div>
  );
}
