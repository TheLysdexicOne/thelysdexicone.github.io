'use client';

import Image from 'next/image';
import { getImagePath } from '@/utils/basePath';
import { ReactNode } from 'react';

interface EnemyIconProps {
  iconName: string;
  name: string;
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
 * EnemyIcon Component
 *
 * Renders an enemy icon from individual image files in public/images/enemies/
 * Size is controlled via className (e.g., "h-16 w-16" or "h-full w-full").
 *
 * @param iconName - Enemy icon filename without extension (e.g., 'PieceDefault_snowy_icon')
 * @param name - Enemy display name for accessibility
 * @param className - CSS classes for sizing and styling
 * @param onClick - Click handler
 * @param draggable - Enable drag-and-drop
 * @param highlighted - Apply glow effect
 * @param children - Optional overlay content (e.g., checkmarks, badges)
 */
export default function EnemyIcon({
  iconName,
  name,
  className = '',
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  draggable = false,
  highlighted = false,
  children,
}: EnemyIconProps) {
  const imageSrc = getImagePath(`/images/enemies/${iconName}.png`);

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
