export default function JourneyChecklistPage() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-5xl">
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
            Staged Placeholder
          </p>
          <h1 className="mt-3 font-pixel text-2xl tracking-wide text-primary sm:text-3xl">
            Journey
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
            The Journey checklist will stage chapter and step data first, then
            expand into unlock requirements and completion-aware browsing when
            those source fields are available from the pipeline.
          </p>
        </section>
      </div>
    </main>
  );
}
