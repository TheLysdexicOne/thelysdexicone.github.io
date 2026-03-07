"use client";

import { useEffect, useRef, useState } from "react";
import ItemDetailPanel from "./item-detail-panel";
import type {
  IcarusItemDetail,
  IcarusItemLookupMap,
  IcarusQueryTag,
  IcarusStation,
  WorkshopCurrencyDef,
} from "@/types/icarus";

// ── ItemModal ────────────────────────────────────────────────────────────────

export type ItemModalProps = {
  itemId: string;
  detail: IcarusItemDetail | null;
  anchorRect: DOMRect;
  stationById: Map<string, IcarusStation>;
  queryTagById: Map<string, IcarusQueryTag>;
  itemLookup: IcarusItemLookupMap;
  workshopCurrencies: Record<string, WorkshopCurrencyDef>;
  onClose: () => void;
  /** Optional link to the item's dedicated page (shown as "View full page →"). */
  viewPageHref?: string;
};

export default function ItemModal({
  detail,
  anchorRect,
  stationById,
  queryTagById,
  itemLookup,
  workshopCurrencies,
  onClose,
  viewPageHref,
}: ItemModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [recipeIndex, setRecipeIndex] = useState(0);

  // Zoom-from-icon: compute transformOrigin then reveal
  useEffect(() => {
    const card = cardRef.current;
    if (card) {
      const cardRect = card.getBoundingClientRect();
      const ox = anchorRect.left + anchorRect.width / 2 - cardRect.left;
      const oy = anchorRect.top + anchorRect.height / 2 - cardRect.top;
      card.style.transformOrigin = `${ox}px ${oy}px`;
    }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [anchorRect]);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200${visible ? " opacity-100" : " opacity-0"}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-highlight bg-nav shadow-2xl transition-all duration-200${visible ? " scale-100 opacity-100" : " scale-75 opacity-0"}`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-primary px-4 py-3">
          <span className="font-pixel text-sm tracking-wide text-primary">
            Item Detail
          </span>
          <div className="flex items-center gap-3">
            {viewPageHref && (
              <a
                href={viewPageHref}
                className="text-xs text-highlight hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                View full page →
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 text-secondary transition-colors hover:text-primary"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          {detail == null ? (
            <p className="py-8 text-center text-sm text-secondary opacity-60">
              Loading…
            </p>
          ) : (
            <ItemDetailPanel
              detail={detail}
              selectedRecipeIndex={recipeIndex}
              onRecipeSelect={setRecipeIndex}
              stationById={stationById}
              queryTagById={queryTagById}
              itemLookup={itemLookup}
              workshopCurrencies={workshopCurrencies}
            />
          )}
        </div>
      </div>
    </div>
  );
}
