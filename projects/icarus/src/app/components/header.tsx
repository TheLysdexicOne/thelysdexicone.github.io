"use client";

import { usePathname } from "next/navigation";

const TITLE_MAP: Record<string, string> = {
  "/": "Icarus Companion",
  "/items": "Field Guide | Items",
  "/progression": "Tier Progression",
  "/field-guide/items": "Field Guide | Items",
  "/field-guide/bestiary": "Field Guide | Bestiary",
  "/field-guide/fishing": "Field Guide | Fishing",
};

export default function Header() {
  const pathname = usePathname();
  const raw = TITLE_MAP[pathname] ?? "Icarus Companion";
  const parts = raw.split("|").map((p) => p.trim());
  const multi = parts.length > 1;

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b-2 border-highlight bg-nav lg:left-64">
      <div className="flex min-h-20 items-center px-6 py-2 sm:py-4">
        <h1 className="font-pixel text-2xl tracking-widest text-primary sm:text-4xl">
          {multi ? (
            <>
              <span className="block sm:hidden">
                {parts.map((p, i) => (
                  <span key={i} className="block">
                    {p}
                  </span>
                ))}
              </span>
              <span className="hidden sm:block">{raw}</span>
            </>
          ) : (
            raw
          )}
        </h1>
      </div>
    </header>
  );
}
