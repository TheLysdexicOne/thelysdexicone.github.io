import type { Metadata } from "next";
import FieldGuidePlaceholder from "@/app/components/field-guide-placeholder";

export const metadata: Metadata = {
  title: "Field Guide · Bestiary · Icarus Companion",
  description: "Icarus Bestiary — coming soon.",
};

export default function BestiaryPage() {
  return <FieldGuidePlaceholder section="Bestiary" />;
}
