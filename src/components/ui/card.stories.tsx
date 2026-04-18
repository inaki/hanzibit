import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle2 } from "lucide-react";

import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Today&apos;s Practice</CardTitle>
        <CardDescription>Finish your review, study focus, and short writing task.</CardDescription>
        <CardAction>
          <Badge>2/3 done</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-sm font-medium">Review flashcards</p>
          <p className="mt-1 text-sm text-muted-foreground">4 due cards waiting for you.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
          Study focus already completed today
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Daily loop</span>
        <Button size="sm">Open task</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-[280px]">
      <CardHeader>
        <CardTitle>Weak strategy</CardTitle>
        <CardDescription>Needs more outcome evidence before reuse.</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline">Insufficient data</Badge>
      </CardContent>
    </Card>
  ),
};
