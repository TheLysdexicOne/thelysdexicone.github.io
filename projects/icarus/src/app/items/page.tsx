import type { Metadata } from "next";
import RecipeExplorer from "../components/recipe-explorer";

export const metadata: Metadata = {
  title: "Item Database · Icarus Companion",
  description:
    "Browse every craftable item in Icarus. Look up recipes, required stations, ingredient chains, and interactive crafting workflow graphs.",
};

export default function ItemsPage() {
  return (
    <main className="app-shell">
      <div className="app-container max-w-6xl">
        <RecipeExplorer />
      </div>
    </main>
  );
}
