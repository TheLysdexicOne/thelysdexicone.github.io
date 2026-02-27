'use client';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  // Split title on pipe for responsive display
  const titleParts = title.split('|').map(part => part.trim());
  const hasMultipleParts = titleParts.length > 1;

  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b-2 border-highlight bg-nav lg:left-64">
      <div className="flex min-h-20 items-center px-6 py-2 sm:py-4">
        {/* Page Title */}
        <h1 className="font-pixel text-2xl tracking-widest text-primary sm:text-4xl">
          {hasMultipleParts ? (
            <>
              {/* Mobile: Stack vertically */}
              <span className="block sm:hidden">
                {titleParts.map((part, i) => (
                  <span key={i} className="block">
                    {part}
                  </span>
                ))}
              </span>
              {/* Desktop: Single line with pipe */}
              <span className="hidden sm:block">{title}</span>
            </>
          ) : (
            title
          )}
        </h1>
      </div>
    </header>
  );
}
