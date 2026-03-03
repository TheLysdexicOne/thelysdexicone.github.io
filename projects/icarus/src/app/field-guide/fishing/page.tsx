import type { Metadata } from "next";
import FieldGuidePlaceholder from "@/app/components/field-guide-placeholder";

export const metadata: Metadata = {
  title: "Field Guide · Fishing · Icarus Companion",
  description: "Icarus Fishing Guide — coming soon.",
};

export default function FishingPage() {
  return <FieldGuidePlaceholder section="Fishing" />;
}
