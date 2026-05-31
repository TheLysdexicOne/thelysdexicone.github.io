import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/nav";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Conan Exiles Enhanced",
  description:
    "Conan Exiles lore browser, item database, and future map tools built for static export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-main text-primary">
        <Providers>
          <Nav />
          <div className="lg:pl-64">
            <div className="pt-20">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
