import Link from "next/link";
import { DATA_VERSION } from "@/lib/data-version";

const TOOLS = [
  {
    href: "/field-guide/items",
    title: "Field Guide",
    description:
      "Browse 1,600+ craftable items by category. Look up recipes, ingredients, required stations, and interactive crafting workflow graphs.",
    cta: "Open Field Guide →",
  },
  {
    href: "/progression",
    title: "Tier Progression Guide",
    description:
      "Find the fastest path to Tier 2, 3, and 4. See which crafting benches unlock each tier and what to prioritise first.",
    cta: "View Guide →",
  },
];

export default function Home() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-4xl">
        {/* Hero */}
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <h1 className="font-pixel text-2xl leading-snug tracking-wide text-primary sm:text-3xl">
            Icarus Companion
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
            An offline-friendly companion built from ripped game data. Look up
            how to craft any item, trace ingredient chains, or plan the fastest
            path through the tech tiers.
          </p>
          <p className="mt-2 text-xs text-secondary opacity-60">
            Data version {DATA_VERSION} · 1,845 craftable items
          </p>
        </section>

        {/* Tool cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-lg border-2 border-primary bg-card p-5 transition-colors hover:border-highlight hover:bg-nav sm:p-6"
            >
              <h2 className="font-pixel text-lg tracking-wide text-primary sm:text-xl">
                {tool.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-secondary">
                {tool.description}
              </p>
              <span className="mt-4 text-sm font-semibold text-primary opacity-70 transition-opacity group-hover:opacity-100">
                {tool.cta}
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
