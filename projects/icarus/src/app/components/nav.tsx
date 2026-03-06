"use client";

import { DATA_VERSION } from "@/lib/data-version";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faCompass,
  faFlask,
  faChartLine,
  faHouse,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import Header from "./header";

interface NavLink {
  label: string;
  href?: string;
  icon?: typeof faHouse;
  isHeader?: boolean;
  children?: NavLink[];
}

const NAV: NavLink[] = [
  { label: "Home", href: "/", icon: faHouse },
  {
    label: "Tools",
    isHeader: true,
    children: [
      { label: "Field Guide", href: "/field-guide/items", icon: faFlask },
      { label: "Tier Progression", href: "/progression", icon: faChartLine },
      { label: "Workshop", href: "/workshop", icon: faStore },
    ],
  },
];

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;
  const close = () => setIsOpen(false);

  const renderItem = (item: NavLink, depth = 0) => {
    if (item.isHeader && item.children) {
      return (
        <li key={item.label}>
          <div className="mt-4 border-t border-highlight pt-4">
            <p className="px-2 py-2 text-sm font-bold uppercase tracking-wider text-primary opacity-70">
              {item.label}
            </p>
            <ul className="space-y-1">
              {item.children.map((c) => renderItem(c, 1))}
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
          className={`flex items-center gap-2 rounded ${px} py-2 text-sm tracking-wide transition-colors lg:text-base ${
            item.href && isActive(item.href)
              ? "bg-highlight text-primary"
              : "text-secondary hover:bg-highlight hover:text-primary"
          }`}
        >
          {item.icon && (
            <FontAwesomeIcon icon={item.icon} className="w-4 shrink-0" />
          )}
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      <Header />

      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded bg-highlight text-xl text-primary lg:hidden"
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="no-doc-scroll fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-4">
            <Link href="/" onClick={close}>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCompass}
                  className="text-primary opacity-80"
                />
                <h2 className="font-pixel text-lg tracking-widest text-primary">
                  ICARUS
                  <br />
                  <span className="text-sm text-secondary">Companion</span>
                </h2>
              </div>
            </Link>
          </div>

          <div className="mb-4 border-t border-highlight" />

          <ul className="nav-scroll flex-1 space-y-1 overflow-y-auto pr-2">
            {NAV.map((item) => renderItem(item))}

            {/* External back link */}
            <li className="mt-4 border-t border-highlight pt-4">
              <a
                href="/"
                className="flex items-center gap-2 rounded px-2 py-2 text-sm tracking-wide text-secondary transition-colors hover:bg-highlight hover:text-primary"
              >
                ← All Projects
              </a>
            </li>
          </ul>

          <div className="border-t border-highlight pt-4">
            <p className="px-2 text-xs text-secondary opacity-50">
              v{DATA_VERSION} · Game data
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}
