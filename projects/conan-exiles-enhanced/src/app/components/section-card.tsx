import Link from "next/link";

interface SectionCardProps {
  href: string;
  title: string;
  description: string;
  kicker?: string;
}

export default function SectionCard({
  href,
  title,
  description,
  kicker,
}: SectionCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-lg border-2 border-primary bg-card p-5 transition-colors hover:border-highlight hover:bg-nav sm:p-6"
    >
      {kicker && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary opacity-70">
          {kicker}
        </p>
      )}
      <h2 className="mt-2 font-pixel text-lg tracking-wide text-primary sm:text-xl">
        {title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-secondary">
        {description}
      </p>
      <span className="mt-4 text-sm font-semibold text-primary opacity-70 transition-opacity group-hover:opacity-100">
        Open →
      </span>
    </Link>
  );
}
