import SectionCard from "./components/section-card";
import { DATA_VERSION } from "@/lib/data-version";

const SECTIONS = [
  {
    href: "/lore",
    title: "Lore Browser",
    kicker: "Live Slice",
    description:
      "Search notes, NPC dialogue, and lorestones with unlock-aware browsing, grouping, favorites, and searchable unlock management.",
  },
  {
    href: "/items",
    title: "Item Browser",
    kicker: "Planned",
    description:
      "Browse craftable and non-craftable items, recipes, drop sources, map exclusivity, and future thrall modifiers.",
  },
  {
    href: "/map",
    title: "Map Tools",
    kicker: "Wish Goal",
    description:
      "Future map layers for lore, NPCs, and resources across Exiled Lands and Isle of Siptah.",
  },
  {
    href: "/settings",
    title: "Settings",
    kicker: "State",
    description:
      "Centralize unlock-all, lore reset, group favorites, and crafting multiplier preferences in one place.",
  },
];

export default function Home() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-5xl">
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
            Conan Exiles Enhanced
          </p>
          <h1 className="mt-3 font-pixel text-2xl leading-snug tracking-wide text-primary sm:text-3xl">
            Static companion for Conan lore now, with items and map tools next.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
            The site already ships a real lore browser backed by staged Conan
            data from the pipeline workspace. The next major milestones are the
            item browser and, later, map-driven exploration tools.
          </p>
          <p className="mt-3 text-xs text-secondary opacity-60">
            Site data version {DATA_VERSION} · Lore browser live · Item browser
            next
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {SECTIONS.map((section) => (
            <SectionCard key={section.href} {...section} />
          ))}
        </section>

        <section className="mt-8 rounded-lg border-2 border-primary bg-card p-6">
          <h2 className="font-pixel text-xl tracking-wide text-primary sm:text-2xl">
            Delivery Focus
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-highlight bg-body p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                Step 1
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Harden the current lore slice and keep the staged dataset in
                sync with the website handoff.
              </p>
            </div>
            <div className="rounded-lg border border-highlight bg-body p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                Step 2
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Build the first real item browser on top of a staged Conan item
                dataset.
              </p>
            </div>
            <div className="rounded-lg border border-highlight bg-body p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                Step 3
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Expand into map layers, cross-linking, and richer discovery
                tools.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
