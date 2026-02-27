'use client';

import type { EnemyVariant } from '@/types/enemy';
import EnemyIcon from './EnemyIcon';
import { getLevelNameByType } from '@/data/levels';

interface EnemyCardProps {
  variant: EnemyVariant;
}

export default function EnemyCard({ variant }: EnemyCardProps) {
  const levelName = getLevelNameByType(variant.levelType);
  const gridSize = `${variant.gridWidth}×${variant.gridHeight}`;

  return (
    <div className="overflow-hidden rounded-xl border-2 border-primary bg-body shadow-md transition-all hover:border-highlight">
      {/* Header */}

      <div className="flex items-center gap-2 rounded-xl px-2 pb-1 pt-2 sm:pb-1 sm:pt-4">
        {/* Enemy Icon */}
        <div className="col-span-1 h-24 w-24 flex-shrink-0 rounded-xl bg-primary p-2">
          <EnemyIcon
            iconName={variant.iconName}
            name={variant.displayName}
            className="h-full w-full"
          />
        </div>
        <div className="flex h-24 w-full flex-col items-center justify-between rounded-xl bg-primary p-2">
          {/* Enemy Name */}
          <div className="font-pixel text-2xl tracking-widest text-secondary sm:text-3xl">
            {variant.displayName}
          </div>
          {/* Level Badge */}
          <div className="flex items-center justify-between py-1 text-base tracking-widest text-secondary sm:text-lg">
            <span className="tracking-wider text-primary/80">
              Health Multiplier:
            </span>
            <span className="pl-2 font-bold text-secondary">
              {variant.healthScale}x
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">
        {/* Description */}
        {variant.description && (
          <div className="card-text-box p-2">
            <em>{variant.description}</em>
          </div>
        )}
      </div>
    </div>
  );
}
