import { NotebookNav } from "@/components/notebook/nav";
import { NotebookSidebar } from "@/components/notebook/sidebar";
import { MobileNav } from "@/components/notebook/mobile-nav";
import { SettingsProvider } from "@/components/notebook/settings-context";

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <div data-testid="notebook-layout" className="flex h-screen flex-col">
        <NotebookNav />
        <div className="flex flex-1 overflow-hidden">
          <NotebookSidebar />
          <main data-testid="notebook-main-content" className="flex-1 overflow-auto bg-background">{children}</main>
        </div>
        <MobileNav />
      </div>
    </SettingsProvider>
  );
}
