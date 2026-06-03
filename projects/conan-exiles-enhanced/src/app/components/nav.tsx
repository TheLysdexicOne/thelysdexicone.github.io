"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Header from "./header";
import { DATA_VERSION } from "@/lib/data-version";

interface NavLink {
  label: string;
  href?: string;
  isHeader?: boolean;
  children?: NavLink[];
}

const NAV: NavLink[] = [
  { label: "Home", href: "/" },
  {
    label: "Reference",
    isHeader: true,
    children: [
      { label: "Lore Browser", href: "/lore" },
      { label: "Item Browser", href: "/items" },
    ],
  },
  {
    label: "Checklists",
    isHeader: true,
    children: [
      { label: "Overview", href: "/checklists" },
      { label: "Journey", href: "/checklists/journey" },
      { label: "Sorcery", href: "/checklists/sorcery" },
    ],
  },
  {
    label: "Exploration",
    isHeader: true,
    children: [{ label: "Map Tools", href: "/map" }],
  },
  {
    label: "Controls",
    isHeader: true,
    children: [{ label: "Settings", href: "/settings" }],
  },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setIsOpen(false);
  const isActive = (href: string) => pathname === href;

  const renderItem = (item: NavLink, depth = 0) => {
    if (item.isHeader && item.children) {
      return (
        <li key={item.label}>
          <div className="mt-4 border-t border-highlight pt-4">
            <p className="px-2 py-2 text-sm font-bold uppercase tracking-wider text-primary opacity-70">
              {item.label}
            </p>
            <ul className="space-y-1">
              {item.children.map((child) => renderItem(child, 1))}
            </ul>
          </div>
        </li>
      );
    }

    const px = depth === 0 ? "px-2" : "px-6";

    return (
      <li key={item.href ?? item.label}>
        <Link
          href={item.href ?? "#"}
          onClick={close}
          className={`flex items-center rounded ${px} py-2 text-sm tracking-wide transition-colors lg:text-base ${
            item.href && isActive(item.href)
              ? "bg-highlight text-primary"
              : "text-secondary hover:bg-highlight hover:text-primary"
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      <Header />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-4 z-50 rounded bg-highlight px-3 py-2 text-sm font-semibold text-primary lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      {isOpen && (
        <div
          className="no-doc-scroll fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      <nav
        className={`lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-4">
            <Link href="/" onClick={close}>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded border border-highlight bg-body" />
                <h2 className="font-pixel text-lg tracking-widest text-primary">
                  CONAN
                  <br />
                  <span className="text-sm text-secondary">Enhanced</span>
                </h2>
              </div>
            </Link>
          </div>

          <div className="mb-4 border-t border-highlight" />

          <ul className="nav-scroll flex-1 space-y-1 overflow-y-auto pr-2">
            {NAV.map((item) => renderItem(item))}

            <li className="mt-4 border-t border-highlight pt-4">
              <a
                href="/"
                className="flex items-center rounded px-2 py-2 text-sm tracking-wide text-secondary transition-colors hover:bg-highlight hover:text-primary"
              >
                ← All Projects
              </a>
            </li>
          </ul>

          <div className="border-t border-highlight pt-4">
            <p className="px-2 text-xs text-secondary opacity-50">
              v{DATA_VERSION} · Shell bootstrap
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
