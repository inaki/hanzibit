import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

export function FormErrorNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
      {children}
    </p>
  );
}

export function DialogFormActions({
  cancelLabel = "Cancel",
  submitLabel,
  submitPendingLabel,
  submitDisabled,
  isPending,
  submitTestId,
  leading,
  destructiveConfirm,
}: {
  cancelLabel?: string;
  submitLabel: string;
  submitPendingLabel: string;
  submitDisabled?: boolean;
  isPending?: boolean;
  submitTestId?: string;
  leading?: ReactNode;
  destructiveConfirm?: ReactNode;
}) {
  return (
    <>
      {leading}
      <DialogClose render={<Button variant="outline" />}>{cancelLabel}</DialogClose>
      {destructiveConfirm ?? (
        <Button
          data-testid={submitTestId}
          type="submit"
          disabled={submitDisabled || isPending}
          className="bg-[var(--cn-orange)] hover:bg-[var(--cn-orange-dark)]"
        >
          {isPending ? submitPendingLabel : submitLabel}
        </Button>
      )}
    </>
  );
}
