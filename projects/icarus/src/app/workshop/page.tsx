"use client";

import { useEffect, useState } from "react";
import type { WorkshopData } from "@/types/icarus";
import WorkshopCatalog from "@/app/components/workshop-catalog";

const DATA_BASE = "/icarus/data/221.2";

export default function WorkshopPage() {
  const [data, setData] = useState<WorkshopData | null>(null);

  useEffect(() => {
    fetch(`${DATA_BASE}/workshop-items.json`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <span className="text-secondary opacity-60">Loading Workshop…</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] overflow-hidden">
      <WorkshopCatalog data={data} />
    </div>
  );
}
