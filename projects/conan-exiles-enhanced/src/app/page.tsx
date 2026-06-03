import { GameHomePage } from "@shared/components/game-home";
import { conanConfig } from "@shared/config/games/conan";

export default function Home() {
  return (
    <GameHomePage config={conanConfig}>
      {/* Delivery Focus section (Conan-specific) */}
      <section className="mt-8 rounded-lg border-2 border-primary bg-card p-6">
        <h2 className="font-pixel text-xl tracking-wide text-primary sm:text-2xl">
          Delivery Focus
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-highlight bg-body p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
              Step 1
            </p>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Harden the current lore slice and keep the staged dataset in sync
              with the website handoff.
            </p>
          </div>
          <div className="rounded-lg border border-highlight bg-body p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
              Step 2
            </p>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Stage checklist surfaces for Journey and Sorcery on top of simple
              extracted progression data.
            </p>
          </div>
          <div className="rounded-lg border border-highlight bg-body p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
              Step 3
            </p>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Build the first real item browser on top of a staged Conan item
              dataset.
            </p>
          </div>
          <div className="rounded-lg border border-highlight bg-body p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
              Step 4
            </p>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Expand into map layers, cross-linking, and richer discovery tools.
            </p>
          </div>
        </div>
      </section>
    </GameHomePage>
  );
}
