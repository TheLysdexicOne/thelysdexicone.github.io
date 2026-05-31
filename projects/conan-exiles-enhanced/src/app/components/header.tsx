"use client";

import { usePathname } from "next/navigation";

const TITLE_MAP: Record<string, string> = {
  "/": "Conan Exiles Enhanced",
  "/lore": "Lore Browser",
  "/items": "Item Browser",
  "/map": "Map Tools",
  "/settings": "Settings",
};

export default function Header() {
  const pathname = usePathname();
  const title = TITLE_MAP[pathname] ?? "Conan Exiles Enhanced";

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b-2 border-highlight bg-nav lg:left-64">
      <div className="flex min-h-20 items-center px-6 py-2 sm:py-4">
        <h1 className="font-pixel text-2xl tracking-widest text-primary sm:text-4xl">
          {title}
        </h1>
      </div>
    </header>
  );
}
