'use client';

import Image from 'next/image';
import { getImagePath } from '@/utils/basePath';

interface BuildingIconProps {
  slug: string;
  name: string;
  className?: string;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
  highlighted?: boolean;
}

/**
 * BuildingIcon Component
 *
 * Renders a building icon from individual image files in public/images/buildings/
 * Supports various sizes, interactions, and visual states.
 * Size is controlled via className (e.g., "h-16 w-16" or "h-full w-full").
 *
 * @param slug - Building identifier (e.g., 'bld_bank', 'bld_market')
 * @param name - Building name for accessibility
 * @param className - CSS classes for sizing and styling
 * @param onClick - Click handler
 * @param draggable - Enable drag-and-drop
 * @param highlighted - Apply glow effect
 */
export default function BuildingIcon({
  slug,
  name,
  className = '',
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
  highlighted = false,
}: BuildingIconProps) {
  const imageSrc = getImagePath(`/images/buildings/${slug}.png`);

  const inlineStyles: React.CSSProperties = {
    imageRendering: 'pixelated',
    objectFit: 'contain',
  };

  if (highlighted) {
    inlineStyles.filter =
      'drop-shadow(0 0 2px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))';
  }

  return (
    <div
      className={`relative select-none ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
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
