import type { Metadata } from 'next';
import './globals.css';
import { getImagePath } from '@/utils/basePath';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import Nav from '@/components/Nav';
import ScrollToTop from '@/components/ScrollToTop';

// Prevent Font Awesome from adding its CSS since we did it manually above
config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'Ball X Pit Companion',
  description: 'Companion site for Ball X Pit game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontPath = getImagePath('/fonts/TimesNewPixel.ttf');

  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'TimesNewPixel';
                src: url('${fontPath}') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
              }
            `,
          }}
        />
      </head>
      <body className="bg-main">
        <Nav />
        <ScrollToTop />
        <main className="pt-24 lg:pl-64">
          <div className="mx-auto min-h-screen max-w-6xl p-4 sm:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
