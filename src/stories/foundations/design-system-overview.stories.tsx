import type { Meta, StoryObj } from "@storybook/react";
import { BookOpen, Layers3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

const meta = {
  title: "Foundations/Design System Overview",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="mx-auto max-w-6xl space-y-8 p-8">
      <div className="space-y-3">
        <Badge variant="outline">HanziBit UI</Badge>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Design system workspace</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Storybook should be the fast place to iterate on the reusable UI layer before changes
            reach notebook screens. Start with primitives, then add composed teaching and learner
            patterns when they become stable.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Core primitives
            </CardTitle>
            <CardDescription>
              Buttons, inputs, badges, cards, tabs, sheets, dialogs, and progress components.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="outline">
                Secondary
              </Button>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Ready</Badge>
              <Badge variant="secondary">Stable</Badge>
              <Badge variant="outline">Neutral</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Product patterns
            </CardTitle>
            <CardDescription>
              Add composed patterns only after they are reused across dashboard, teaching, or study
              surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">Good candidates</p>
              <p className="mt-1 text-sm text-muted-foreground">
                summary cards, action rails, learner state badges, reporting rows
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-sm font-medium">Avoid too early</p>
              <p className="mt-1 text-sm text-muted-foreground">
                one-off page layouts that still change every sprint
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-primary" />
              Theme tokens
            </CardTitle>
            <CardDescription>
              Storybook imports the app globals, so light/dark previews use the same tokens as the
              product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={68}>
              <ProgressLabel>Token coverage</ProgressLabel>
              <ProgressValue>68%</ProgressValue>
            </Progress>
            <p className="text-sm text-muted-foreground">
              Use Storybook to tune spacing, hierarchy, and dark-mode behavior before changing full
              notebook screens.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
