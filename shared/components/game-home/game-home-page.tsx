import type { GameConfig } from "@shared/config/types";
import HeroSection from "./hero-section";
import SectionCard from "./section-card";

type GameHomePageProps = {
  config: GameConfig;
  /** Optional additional sections to render after main content */
  children?: React.ReactNode;
};

/**
 * Shared game home page component.
 *
 * Renders hero section, section cards grid, and optional additional content.
 * Content comes from game config files (shared/config/games/).
 */
export default function GameHomePage({ config, children }: GameHomePageProps) {
  // Resolve template variables in stats string
  const resolvedStats = config.homePage.hero.stats?.replace(
    /{(\w+)}/g,
    (_, key) => {
      if (key === "dataVersion") return config.dataVersion;
      if (key === "itemCount")
        return config.stats?.itemCount?.toLocaleString() || "";
      if (key === "label") return config.stats?.label || "";
      return "";
    },
  );

  return (
    <main className="app-shell">
      <div
        className={`app-container ${config.homePage.sections.length > 3 ? "max-w-5xl" : "max-w-4xl"}`}
      >
        <HeroSection
          hero={config.homePage.hero}
          resolvedStats={resolvedStats}
        />

        <section className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {config.homePage.sections.map((section) => (
            <SectionCard key={section.id} {...section} />
          ))}
        </section>

        {children}
      </div>
    </main>
  );
}
