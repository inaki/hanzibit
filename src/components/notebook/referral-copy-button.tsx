"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ReferralCopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--cn-orange)]/20 bg-[var(--cn-orange)]/10 px-3 py-2 text-xs font-medium text-[var(--cn-orange)] transition-colors hover:bg-[var(--cn-orange)]/15"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
