"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faBorderAll,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

export type FieldGuideSection = {
  label: string;
  href: string;
};

export type FieldGuideLayoutProps = {
  /** Sections (tabs) displayed in the top bar. */
  sections: FieldGuideSection[];
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

/**
 * Shared field-guide layout shell.
 *
 * Two-pane layout with top control bar, optional left accordion panel, and main content area.
 * Used by Conan, Icarus, and other game field guides.
 */
export default function FieldGuideLayout({
  sections,
  searchSlot,
  onBack,
  onCategories,
  leftPanel,
  children,
}: FieldGuideLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col overflow-hidden">
      {/* Top control bar */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-highlight bg-nav px-3">
        {/* Search slot */}
        <div className="flex min-w-0 flex-1 items-center">{searchSlot}</div>

        {/* Section tabs */}
        <div className="flex shrink-0 gap-1">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={
                // When already on this section, clicking the tab resets to category grid
                pathname === section.href && onCategories
                  ? onCategories
                  : undefined
              }
              className={`rounded px-3 py-1.5 text-sm font-semibold tracking-wide transition-colors ${
                pathname === section.href
                  ? "bg-highlight text-primary"
                  : "text-secondary hover:bg-highlight hover:text-primary"
              }`}
            >
              {section.label}
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

      {/* Content area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left accordion panel */}
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
