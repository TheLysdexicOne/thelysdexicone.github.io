"use client";

import type { ReactNode } from "react";
import { ConanSettingsProvider } from "@/components/conan-settings-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return <ConanSettingsProvider>{children}</ConanSettingsProvider>;
}
