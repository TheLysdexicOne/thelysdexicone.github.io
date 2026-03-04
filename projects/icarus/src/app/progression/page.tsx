import { Suspense } from "react";
import type { Metadata } from "next";
import TierCheatsheet from "../components/tier-cheatsheet";

export const metadata: Metadata = {
  title: "Tier Progression Guide · Icarus Companion",
  description:
    "The fastest path from Tier 2 to Tier 4 in Icarus — which crafting benches are required and what to unlock first.",
};

export default function ProgressionPage() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-6xl">
        <Suspense>
          <TierCheatsheet />
        </Suspense>
      </div>
    </main>
  );
}
