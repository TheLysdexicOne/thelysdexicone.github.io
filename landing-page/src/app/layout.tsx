import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TheLysdexicOne Projects',
  description: 'A collection of gaming companion sites and tools',
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
