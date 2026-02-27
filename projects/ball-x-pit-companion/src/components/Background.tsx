import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function Background({ children, className = '' }: BackgroundProps) {
  // Handle different base paths for dev vs production
  const basePath = process.env.NODE_ENV === 'production' ? '/ball-x-pit-companion' : '';

  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Main background layer */}
      <div
        className="fixed inset-0 z-0 bg-scroll bg-repeat"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/bg-1.png)`,
          backgroundSize: '512px',
        }}
      />

      {/* Border layers - uncomment and modify when you add border images */}
      {/* Top borders */}
      <div
        className="pointer-events-none absolute top-0 z-20 h-full w-full bg-right-top bg-no-repeat"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/top-right.png)`,
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-20 h-full w-full -scale-x-100 bg-right-top bg-no-repeat"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/top-right.png)`,
        }}
      />

      {/* Bottom borders */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-20 h-full w-full bg-right-bottom bg-no-repeat"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/bot-right.png)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 z-20 h-full w-full -scale-x-100 bg-right-bottom bg-no-repeat"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/bot-right.png)`,
        }}
      />

      {/* Side borders - tiled vertically */}
      <div
        className="pointer-events-none absolute bottom-8 left-0 top-8 z-10 w-full bg-right-top bg-repeat-y"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/right.png)`,
        }}
      />
      <div
        className="pointer-events-none absolute bottom-8 left-0 top-8 z-10 w-full -scale-x-100 bg-right-top bg-repeat-y"
        style={{
          backgroundImage: `url(${basePath}/images/backgrounds/right.png)`,
          height: 'calc(100% - 64px)',
        }}
      />

      {/* Content layer */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
