"use client";

import { BookOpen, Search, Settings, Pencil, Mic, Plus, Bookmark, Printer, Layers } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export function LandingDemo() {
  return (
    <section data-testid="landing-demo" id="demo" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 data-testid="landing-demo-heading" className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            See it in action
          </h2>
          <p data-testid="landing-demo-description" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A notebook-style interface that makes Chinese learning feel natural
            and organized.
          </p>
        </div>

        {/* App Preview */}
        <div data-testid="landing-demo-preview" className="mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background shadow-2xl">
          {/* Top Nav Preview */}
          <div data-testid="landing-demo-nav" className="flex items-center justify-between border-b bg-card px-6 py-3">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">HanziBit</span>
              </div>
              <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
                <span className="cursor-pointer hover:text-foreground">Lessons</span>
                <span className="cursor-pointer hover:text-foreground">Flashcards</span>
                <span className="ui-tone-orange-text cursor-pointer border-b-2 border-primary pb-1 font-medium text-foreground">
                  My Notebook
                </span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search characters...</span>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  HB
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Main Content Preview */}
          <div className="flex">
            {/* Sidebar */}
            <div data-testid="landing-demo-sidebar" className="hidden w-56 shrink-0 border-r bg-card p-5 lg:block">
              <div data-testid="landing-demo-progress" className="mb-6">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Progress
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">HSK 2 Level</span>
                  <span className="ui-tone-orange-text font-semibold">65%</span>
                </div>
                <Progress value={65} className="mt-2 h-2 [&>div]:bg-primary" />
              </div>

              <div data-testid="landing-demo-sections" className="mb-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Notebook Sections
                </p>
                <div className="space-y-1">
                  {[
                    { label: "Daily Journal", active: true },
                    { label: "Vocabulary List", active: false },
                    { label: "Grammar Points", active: false },
                    { label: "Recent Reviews", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-lg px-3 py-2 text-sm ${
                        item.active
                          ? "bg-primary font-medium text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <div data-testid="landing-demo-character-of-day" className="rounded-xl border bg-muted/50 p-4">
                <p className="mb-1 text-[10px] text-muted-foreground">Character of the day</p>
                <div className="flex items-center gap-3">
                  <span className="ui-tone-orange-text text-3xl font-bold">学</span>
                  <div>
                    <p className="text-sm font-medium">xu&eacute;</p>
                    <p className="text-xs text-muted-foreground">To study / learn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notebook Page */}
            <div className="flex-1 p-6 md:p-10">
              <div data-testid="landing-demo-journal-entry" className="mx-auto max-w-2xl rounded-xl bg-card p-8 shadow-sm">
                {/* Entry Header */}
                <div data-testid="landing-demo-entry-header" className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="ui-tone-orange-text text-xs font-semibold uppercase tracking-wider">
                      Unit 4: Daily Life{" "}
                      <span className="text-muted-foreground">&middot; Intermediate HSK 2</span>
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="ui-tone-orange-text">October 24, 2023</p>
                    <p>Entry #142</p>
                  </div>
                </div>

                <h2 data-testid="landing-demo-entry-title" className="mb-8 text-3xl font-bold text-foreground">
                  我的一天 <span className="text-lg font-normal text-muted-foreground">(My Day)</span>
                </h2>

                {/* Chinese Text */}
                <div data-testid="landing-demo-chinese-text" className="mb-6 space-y-4 text-xl leading-loose text-foreground">
                  <p>
                    今天 我 早上 七点 起床。 我很{" "}
                    <span className="ui-tone-orange-text font-bold">累</span>，
                    但是我也 很{" "}
                    <span className="ui-tone-orange-text font-bold">高兴</span>。
                  </p>
                  <p>
                    八点的时候，我吃{" "}
                    <span className="ui-tone-orange-text font-bold">早餐</span>。
                    我喜欢喝{" "}
                    <span className="ui-tone-orange-text font-bold">咖啡</span>。
                    九点我开始{" "}
                    <span className="ui-tone-orange-text font-bold">学习</span>。
                    我想练习{" "}
                    <span className="ui-tone-orange-text font-bold">写字</span>。
                  </p>
                </div>

                {/* Self-Notes */}
                <div data-testid="landing-demo-annotations" className="ui-tone-orange-panel mt-10 rounded-xl border-l-4 p-5">
                  <p className="ui-tone-orange-text mb-4 text-sm font-semibold">
                    Self-Notes &amp; Annotations
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div data-testid="landing-demo-grammar-tip" className="rounded-lg border border-border bg-card p-4">
                      <p className="mb-1 text-xs font-semibold text-foreground">
                        Grammar Tip
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        The particle &ldquo;也&rdquo; (y&#x11B;) always comes after
                        the subject and before the adjective/verb.
                      </p>
                    </div>
                    <div data-testid="landing-demo-mnemonic" className="rounded-lg border border-border bg-card p-4">
                      <p className="mb-1 text-xs font-semibold text-foreground">
                        Mnemonic
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        &ldquo;累&rdquo; (l&egrave;i) looks like a person working in a
                        field (田) with a burden above. No wonder they are tired!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action Bar */}
            <div data-testid="landing-demo-action-bar" className="hidden w-12 flex-col items-center gap-3 py-6 lg:flex">
              <button data-testid="landing-demo-edit-button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                <Pencil className="h-4 w-4" />
              </button>
              <button data-testid="landing-demo-mic-button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                <Mic className="h-4 w-4" />
              </button>
              <button data-testid="landing-demo-flashcard-button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                <Layers className="h-4 w-4" />
              </button>
              <div className="flex-1" />
              <button data-testid="landing-demo-new-entry-button" className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg hover:opacity-90">
                <Plus className="h-4 w-4" />
              </button>
              <button data-testid="landing-demo-bookmark-button" className="ui-tone-rose-panel ui-tone-rose-text rounded-lg p-2">
                <Bookmark className="h-4 w-4" />
              </button>
              <button data-testid="landing-demo-print-button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                <Printer className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
