import {
  BookOpen,
  PenLine,
  Brain,
  BarChart3,
  Languages,
  Mic,
} from "lucide-react";

const features = [
  {
    icon: PenLine,
    title: "Daily Journal",
    description:
      "Write daily entries in Chinese with guided prompts. Build writing confidence one day at a time.",
  },
  {
    icon: BookOpen,
    title: "Vocabulary Builder",
    description:
      "Organize vocabulary by HSK level, theme, or custom categories. Never lose track of new words.",
  },
  {
    icon: Brain,
    title: "Smart Flashcards",
    description:
      "Spaced repetition flashcards that adapt to your learning pace. Focus on what you need most.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Track your HSK level progress with detailed analytics. See how far you've come.",
  },
  {
    icon: Languages,
    title: "Grammar Points",
    description:
      "Structured grammar lessons with clear explanations, examples, and self-notes.",
  },
  {
    icon: Mic,
    title: "Pronunciation",
    description:
      "Practice pronunciation with pinyin guides and audio support for every character.",
  },
];

export function LandingFeatures() {
  return (
    <section data-testid="landing-features" id="features" className="border-t bg-background px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 data-testid="landing-features-heading" className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to learn Chinese
          </h2>
          <p data-testid="landing-features-description" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A complete toolkit designed around how people actually learn
            languages — structured, personal, and effective.
          </p>
        </div>

        <div data-testid="landing-features-grid" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              data-testid={`landing-feature-card-${feature.title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group rounded-xl bg-card card-ring p-6 transition-all hover:shadow-md"
            >
              <div className="ui-tone-orange-panel ui-tone-orange-text group-hover:bg-primary group-hover:text-primary-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
