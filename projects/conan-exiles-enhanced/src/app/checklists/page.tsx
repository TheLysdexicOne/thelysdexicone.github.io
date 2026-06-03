import SectionCard from "../components/section-card";

const CHECKLISTS = [
  {
    href: "/checklists/journey",
    title: "Journey",
    kicker: "Staged Placeholder",
    description:
      "Track journey steps, future unlock requirements, and completion progress once the first journey dataset is staged.",
  },
  {
    href: "/checklists/sorcery",
    title: "Sorcery",
    kicker: "Staged Placeholder",
    description:
      "Track thaumaturgy bench progression and sorcery-related unlocks with recipe costs that respect the crafting multiplier setting.",
  },
];

export default function ChecklistsPage() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-5xl">
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
            Staged Section
          </p>
          <h1 className="mt-3 font-pixel text-2xl tracking-wide text-primary sm:text-3xl">
            Checklists
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
            This section will hold progression-oriented checklist surfaces that
            are lighter to stage than map tooling. Journey and Sorcery are the
            first planned checklist tracks.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
          {CHECKLISTS.map((section) => (
            <SectionCard key={section.href} {...section} />
          ))}
        </section>
      </div>
    </main>
  );
}
