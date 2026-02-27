'use client';

import Image from 'next/image';
import { getImagePath } from '@/utils/basePath';
import { ReactNode } from 'react';

interface CharacterIconProps {
  slug: string;
  name: string;
  type: 'portrait' | 'sprite';
  className?: string;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
  highlighted?: boolean;
  children?: ReactNode;
}

/**
 * CharacterIcon Component
 *
 * Renders a character icon from individual image files in public/images/characters/
 * Supports both portrait (124x124) and sprite (18x18) sizes.
 * Size is controlled via className (e.g., "h-16 w-16" or "h-full w-full").
 *
 * @param slug - Character identifier (e.g., 'char_default', 'char_recaller')
 * @param name - Character name for accessibility
 * @param type - Icon type: 'portrait' or 'sprite'
 * @param className - CSS classes for sizing and styling
 * @param onClick - Click handler
 * @param draggable - Enable drag-and-drop
 * @param highlighted - Apply glow effect
 */
export default function CharacterIcon({
  slug,
  name,
  type,
  className = '',
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
  highlighted = false,
  children,
}: CharacterIconProps) {
  const imageSrc = getImagePath(`/images/characters/${type}/${slug}.png`);

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
      {children}
    </div>
  );
}
