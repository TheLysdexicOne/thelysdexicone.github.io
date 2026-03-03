import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/nav";

export const metadata: Metadata = {
  title: "Icarus Companion",
  description:
    "Interactive Icarus crafting recipes, workflow flowcharts, and Tier 2-4 progression guide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-main text-primary">
        <Nav />
        {/* Offset content: push right of sidebar on desktop, below header on all viewports */}
        <div className="lg:pl-64">
          <div className="pt-20">{children}</div>
        </div>
      </body>
    </html>
  );
}
