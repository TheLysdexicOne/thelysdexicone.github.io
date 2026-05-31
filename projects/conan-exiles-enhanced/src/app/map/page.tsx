export default function MapPage() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-5xl">
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
            Wish Goal
          </p>
          <h1 className="mt-3 font-pixel text-2xl tracking-wide text-primary sm:text-3xl">
            Map Tools
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
            Future work will split map experiences by Exiled Lands and Isle of
            Siptah and tie lore, NPCs, and resources into a richer spatial
            browser.
          </p>
        </section>
      </div>
    </main>
  );
}
