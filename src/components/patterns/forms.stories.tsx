import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogFormActions, FormErrorNotice } from "./forms";

const meta = {
  title: "Patterns/Forms",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorNotice: Story = {
  render: () => (
    <div className="w-96 p-4">
      <FormErrorNotice>There was a problem saving this entry. Please try again.</FormErrorNotice>
    </div>
  ),
};

export const DialogActions: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>Write a new journal entry in Mandarin.</DialogDescription>
        </DialogHeader>
        <div className="py-6 text-sm text-muted-foreground">
          This story shows the extracted dialog footer actions inside a real dialog context.
        </div>
        <DialogFooter>
          <DialogFormActions
            submitLabel="Create Entry"
            submitPendingLabel="Creating..."
            submitTestId="storybook-submit"
            leading={<Button variant="ghost">Optional leading action</Button>}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
