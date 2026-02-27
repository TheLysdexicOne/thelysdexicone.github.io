'use client';

import Image from 'next/image';
import { getImagePath } from '@/utils/basePath';
import { ReactNode } from 'react';

interface LevelIconProps {
  levelId: number;
  levelName: string;
  className?: string;
  children?: ReactNode;
}

const LEVEL_ICONS: Record<number, string> = {
  1: '/images/levels/icons/01-the-pit.png',
  2: '/images/levels/icons/02-snowy-shores.png',
  3: '/images/levels/icons/03-liminal-desert.png',
  4: '/images/levels/icons/04-fungal-forest.png',
  5: '/images/levels/icons/05-gory-grasslands.png',
  6: '/images/levels/icons/06-smoldering-depths.png',
  7: '/images/levels/icons/07-heavenly-gates.png',
  8: '/images/levels/icons/08-vast-void.png',
};

/**
 * LevelIcon Component
 *
 * Renders a level icon from the level icons directory.
 *
 * @param levelId - Level number (1-8)
 * @param levelName - Level name for accessibility
 * @param className - CSS classes for sizing (e.g., "h-16 w-16")
 */
export default function LevelIcon({
  levelId,
  levelName,
  className = '',
  children,
}: LevelIconProps) {
  const iconSrc = LEVEL_ICONS[levelId];

  return (
    <div className={`relative ${className}`}>
      <Image
        src={getImagePath(iconSrc)}
        alt={levelName}
        fill
        className="object-contain"
        style={{ imageRendering: 'pixelated' }}
        unoptimized
      />
      {children}
    </div>
  );
}
