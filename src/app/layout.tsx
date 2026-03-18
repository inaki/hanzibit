import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "HanziBit - Your Personal Chinese Learning Companion",
  description:
    "HanziBit is a beautiful notebook-style app for learning Chinese. Track your HSK progress, write journal entries, build vocabulary, and master grammar points.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
