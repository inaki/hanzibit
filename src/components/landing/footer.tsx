import Link from "next/link";
import { BookOpen } from "lucide-react";

export function LandingFooter() {
  return (
    <footer data-testid="landing-footer" className="border-t bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div data-testid="landing-footer-logo" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--cn-orange)] text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">Chinese Notebook</span>
          </div>

          <nav data-testid="landing-footer-links" className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" data-testid="landing-footer-privacy-link" className="hover:text-gray-900">
              Privacy
            </Link>
            <Link href="#" data-testid="landing-footer-terms-link" className="hover:text-gray-900">
              Terms
            </Link>
            <Link href="#" data-testid="landing-footer-contact-link" className="hover:text-gray-900">
              Contact
            </Link>
          </nav>

          <p data-testid="landing-footer-copyright" className="text-sm text-gray-400">
            &copy; 2024 Chinese Notebook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
