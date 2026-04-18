import Link from "next/link";
import { BookOpen } from "lucide-react";

export function LandingFooter() {
  return (
    <footer data-testid="landing-footer" className="border-t bg-muted/40 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div data-testid="landing-footer-logo" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">HanziBit</span>
          </div>

          <nav data-testid="landing-footer-links" className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" data-testid="landing-footer-privacy-link" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" data-testid="landing-footer-terms-link" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="#" data-testid="landing-footer-contact-link" className="hover:text-foreground">
              Contact
            </Link>
          </nav>

          <p data-testid="landing-footer-copyright" className="text-sm text-muted-foreground">
            &copy; 2024 HanziBit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
