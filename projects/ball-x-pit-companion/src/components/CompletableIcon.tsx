'use client';

import { getImagePath } from '@/utils/basePath';
import Image from 'next/image';

interface CompletableIconProps {
  isComplete: boolean;
  onToggle: () => void;
  isClient?: boolean;
  label?: string;
  checkmarkClassName?: string;
}

/**
 * CompletableIcon - Checkmark overlay with click handling
 *
 * This component adds a checkmark overlay and click interactivity.
 * It should be used as a child of icon components (CharacterIcon, LevelIcon).
 *
 * @param isComplete - Whether to show the checkmark
 * @param onToggle - Click handler
 * @param isClient - Client-side flag for SSR
 * @param label - Accessibility label
 * @param checkmarkClassName - Custom positioning/sizing for checkmark
 */
export default function CompletableIcon({
  isComplete,
  onToggle,
  isClient = true,
  label,
  checkmarkClassName = 'absolute top-0 right-0 h-1/2 w-1/2',
}: CompletableIconProps) {
  const handleClick = () => {
    if (isClient) {
      onToggle();
    }
  };

  return (
    <>
      {/* Interactive overlay */}
      <div
        className="absolute inset-0 cursor-pointer transition-all hover:drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={label}
      />
      {/* Checkmark */}
      {isClient && isComplete && (
        <div className={`pointer-events-none ${checkmarkClassName}`}>
          <Image
            src={getImagePath('/images/ui/check.png')}
            alt="Complete"
            fill
            className="object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      )}
    </>
  );
}
