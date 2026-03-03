"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faBorderAll,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

type Section = { label: string; href: string };

const SECTIONS: Section[] = [
  { label: "Items", href: "/field-guide/items" },
  { label: "Bestiary", href: "/field-guide/bestiary" },
  { label: "Fishing", href: "/field-guide/fishing" },
];

type Props = {
  /** Content for the left portion of the top bar (e.g. search input). */
  searchSlot?: React.ReactNode;
  /** Callback for the Back (chevron) button. Omit to hide the button. */
  onBack?: () => void;
  /** Callback for the Categories (grid) button. Omit to hide the button. */
  onCategories?: () => void;
  /** Content rendered in the left accordion panel. Omit to render without left panel. */
  leftPanel?: React.ReactNode;
  /** Main panel content. */
  children: React.ReactNode;
};

export default function FieldGuideLayout({
  searchSlot,
  onBack,
  onCategories,
  leftPanel,
  children,
}: Props) {
  const pathname = usePathname();

  return (
    /*
     * Fill the remaining viewport below the site header (pt-20 = 5rem).
     * overflow-hidden on the outer div so inner panels handle their own scroll.
     */
    <div className="flex h-[calc(100vh-5rem)] flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-highlight bg-nav px-3">
        {/* Search slot */}
        <div className="flex min-w-0 flex-1 items-center">{searchSlot}</div>

        {/* Section tabs (center) */}
        <div className="flex shrink-0 gap-1">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              onClick={
                // When already on this section, clicking the tab resets the
                // main panel to CategoryGrid (clears selected category/item).
                pathname === s.href && onCategories ? onCategories : undefined
              }
              className={`rounded px-3 py-1.5 text-sm font-semibold tracking-wide transition-colors ${
                pathname === s.href
                  ? "bg-highlight text-primary"
                  : "text-secondary hover:bg-highlight hover:text-primary"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Right nav buttons */}
        <div className="flex shrink-0 items-center gap-1 border-l-2 border-highlight pl-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded text-secondary transition-colors hover:bg-highlight hover:text-primary"
              title="Back"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}
          {onCategories && (
            <button
              type="button"
              onClick={onCategories}
              className="flex h-8 w-8 items-center justify-center rounded text-secondary transition-colors hover:bg-highlight hover:text-primary"
              title="Browse Categories"
            >
              <FontAwesomeIcon icon={faBorderAll} />
            </button>
          )}
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded text-secondary transition-colors hover:bg-highlight hover:text-primary"
            title="Home"
          >
            <FontAwesomeIcon icon={faHouse} />
          </Link>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left panel */}
        {leftPanel && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-r-2 border-primary bg-nav lg:block">
            {leftPanel}
          </aside>
        )}

        {/* Main panel */}
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
