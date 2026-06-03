import type { GameHomeHero } from "@shared/config/types";

type HeroSectionProps = {
  hero: GameHomeHero;
  /** Resolved stats string (with variables replaced) */
  resolvedStats?: string;
};

/**
 * Hero section for game home pages.
 *
 * Displays optional kicker, title, description, and stats footer.
 */
export default function HeroSection({ hero, resolvedStats }: HeroSectionProps) {
  return (
    <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
      {hero.kicker && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
          {hero.kicker}
        </p>
      )}
      <h1
        className={`font-pixel text-2xl leading-snug tracking-wide text-primary sm:text-3xl ${hero.kicker ? "mt-3" : ""}`}
      >
        {hero.title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
        {hero.description}
      </p>
      {(hero.stats || resolvedStats) && (
        <p className="mt-3 text-xs text-secondary opacity-60">
          {resolvedStats || hero.stats}
        </p>
      )}
    </section>
  );
}
