import type { Metadata } from "next";
import FieldGuideItems from "@/app/components/field-guide-items";

export const metadata: Metadata = {
  title: "Field Guide · Items · Icarus Companion",
  description:
    "Browse every craftable item in Icarus by category. Look up recipes, required stations, ingredient chains, and crafting workflow graphs.",
};

export default function FieldGuideItemsPage() {
  return <FieldGuideItems />;
}
