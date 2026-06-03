"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBorderAll,
  faChevronLeft,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  searchSlot?: React.ReactNode;
  onBack?: () => void;
  onCategories?: () => void;
  leftPanel?: React.ReactNode;
  children: React.ReactNode;
};

const SECTIONS = [{ label: "Items", href: "/items" }];

export default function ConanFieldGuideLayout({
  searchSlot,
  onBack,
  onCategories,
  leftPanel,
  children,
}: Props) {
  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b-2 border-highlight bg-nav px-3">
        <div className="flex min-w-0 flex-1 items-center">{searchSlot}</div>

        <div className="flex shrink-0 gap-1">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              onClick={onCategories}
              className="rounded bg-highlight px-3 py-1.5 text-sm font-semibold tracking-wide text-primary transition-colors"
            >
              {section.label}
            </Link>
          ))}
        </div>

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

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {leftPanel && (
          <aside className="hidden w-64 shrink-0 overflow-y-auto border-r-2 border-primary bg-nav lg:block">
            {leftPanel}
          </aside>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
