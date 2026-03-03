import FieldGuideLayout from "./field-guide-layout";

type Props = {
  section: "Bestiary" | "Fishing";
};

export default function FieldGuidePlaceholder({ section }: Props) {
  return (
    <FieldGuideLayout>
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-pixel text-2xl text-primary">{section}</p>
          <p className="mt-3 text-secondary">Coming Soon</p>
          <p className="mt-1 text-sm text-secondary opacity-60">
            This section is planned for a future update.
          </p>
        </div>
      </div>
    </FieldGuideLayout>
  );
}
