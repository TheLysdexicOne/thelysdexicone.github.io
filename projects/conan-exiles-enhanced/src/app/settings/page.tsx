"use client";

import { useConanSettings } from "@/components/conan-settings-provider";

export default function SettingsPage() {
  const { settings, isHydrated, updateSetting, resetLoreState } =
    useConanSettings();

  return (
    <main className="app-shell">
      <div className="app-container max-w-4xl">
        <section className="rounded-lg border-2 border-primary bg-card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary opacity-70">
            Centralized Preferences
          </p>
          <h1 className="mt-3 font-pixel text-2xl tracking-wide text-primary sm:text-3xl">
            Settings
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-secondary sm:text-base">
            These controls establish the initial persistence model for Conan
            Exiles Enhanced. Later sections should read from the same local
            storage-backed settings surface instead of inventing their own
            state.
          </p>
        </section>

        <section className="mt-8 grid gap-4">
          <div className="rounded-lg border border-highlight bg-card p-5">
            <label className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-pixel text-lg tracking-wide text-primary">
                  Unlock All Lore
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-secondary">
                  Separate global override for lore visibility. This should stay
                  independent from hand-selected unlock entries.
                </p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-highlight bg-body text-highlight"
                checked={settings.unlockAllLore}
                onChange={(event) =>
                  updateSetting("unlockAllLore", event.target.checked)
                }
              />
            </label>
          </div>

          <div className="rounded-lg border border-highlight bg-card p-5">
            <label className="block">
              <h2 className="font-pixel text-lg tracking-wide text-primary">
                Crafting Cost Multiplier
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Future item calculations will multiply base component counts by
                this setting and apply flooring rules where the game does the
                same.
              </p>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.craftingCostMultiplier}
                onChange={(event) =>
                  updateSetting(
                    "craftingCostMultiplier",
                    Math.max(1, Math.floor(Number(event.target.value) || 1)),
                  )
                }
                className="mt-4 w-full rounded-lg border border-highlight bg-body px-4 py-3 text-primary focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="rounded-lg border border-highlight bg-card p-5">
            <h2 className="font-pixel text-lg tracking-wide text-primary">
              Lore Reset
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Reset clears lore unlocks and group favorites while leaving the
              global unlock-all toggle unchanged.
            </p>
            <button
              type="button"
              onClick={resetLoreState}
              disabled={!isHydrated}
              className="mt-4 rounded-lg border border-highlight bg-body px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              Reset Lore Unlocks
            </button>
          </div>

          <div className="rounded-lg border border-highlight bg-card p-5">
            <h2 className="font-pixel text-lg tracking-wide text-primary">
              Lore State Snapshot
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-highlight bg-body p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Unlocked Entries
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {settings.unlockedLoreIds.length}
                </p>
              </div>
              <div className="rounded-lg border border-highlight bg-body p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
                  Favorite Groups
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary">
                  {settings.favoriteLoreIds.length}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
