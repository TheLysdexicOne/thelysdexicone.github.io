'use client';

import Image from 'next/image';
import { getImagePath } from '@/utils/basePath';

interface PassiveIconProps {
  slug: string;
  name: string;
  className?: string;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
  highlighted?: boolean;
  borderColor?: string; // Optional custom border color (for rarity tiers)
}

/**
 * PassiveIcon Component
 *
 * Renders a passive item icon from individual image files in public/images/passives/
 * Supports various sizes, interactions, and visual states.
 * Size is controlled via className (e.g., "h-16 w-16" or "h-full w-full").
 *
 * @param slug - Passive identifier (e.g., 'pass_bow', 'pass_armor')
 * @param name - Passive name for accessibility
 * @param className - CSS classes for sizing and styling
 * @param onClick - Click handler
 * @param draggable - Enable drag-and-drop
 * @param highlighted - Apply glow effect
 * @param borderColor - Custom border color (for rarity visualization)
 */
export default function PassiveIcon({
  slug,
  name,
  className = '',
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
  highlighted = false,
  borderColor,
}: PassiveIconProps) {
  const imageSrc = getImagePath(`/images/passives/${slug}.png`);

  const inlineStyles: React.CSSProperties = {
    imageRendering: 'pixelated',
    objectFit: 'contain',
  };

  if (highlighted) {
    inlineStyles.filter =
      'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))';
  }

  const containerClassName = `relative select-none ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${borderColor ? 'inline-flex items-center justify-center rounded border-2 p-2' : ''} ${className}`;
  const containerStyle = borderColor ? { borderColor } : undefined;

  return (
    <div
      className={containerClassName}
      style={containerStyle}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      draggable={draggable}
      title={name}
    >
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-contain"
        style={inlineStyles}
        unoptimized
      />
    </div>
  );
}
