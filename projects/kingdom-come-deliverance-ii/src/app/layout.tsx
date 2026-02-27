import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kingdom Come: Deliverance II - Coming Soon",
  description: "Kingdom Come: Deliverance II companion site - Coming Soon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-main text-primary">{children}</body>
    </html>
  );
}
