import type { Meta, StoryObj } from "@storybook/react";

import { Card, CardContent } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reporting">Reporting</TabsTrigger>
        <TabsTrigger value="library">Library</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Card>
          <CardContent className="pt-4">Teaching overview content</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reporting">
        <Card>
          <CardContent className="pt-4">Reporting content</CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="library">
        <Card>
          <CardContent className="pt-4">Library content</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-[420px]">
      <TabsList variant="line">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="known">Known</TabsTrigger>
        <TabsTrigger value="cards">Cards</TabsTrigger>
      </TabsList>
      <TabsContent value="all">All words content</TabsContent>
      <TabsContent value="known">Known words content</TabsContent>
      <TabsContent value="cards">Cards content</TabsContent>
    </Tabs>
  ),
};
