'use client';

import { useState, useEffect } from 'react';
import type { Level } from '@/types/level';
import type { EnemyVariant } from '@/types/enemy';
import { getBuildingBySlug } from '@/data/buildings';
import EnemyIcon from './EnemyIcon';
import BallIcon from './BallIcon';
import PassiveIcon from './PassiveIcon';
import BuildingIcon from './BuildingIcon';

interface LevelCardProps {
  level: Level;
  enemies: EnemyVariant[];
}

export default function LevelCard({ level, enemies }: LevelCardProps) {
  const [tappedBlueprint, setTappedBlueprint] = useState<string | null>(null);

  // Auto-hide tooltip after 3 seconds
  useEffect(() => {
    if (tappedBlueprint) {
      const timer = setTimeout(() => {
        setTappedBlueprint(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [tappedBlueprint]);

  const handleBlueprintTap = (
    blueprintSlug: string,
    shortDescription?: string
  ) => {
    // Only show tooltip if there's a short description and it's different from the name
    const buildingData = getBuildingBySlug(blueprintSlug);
    if (
      buildingData?.shortDescription &&
      buildingData.shortDescription !== buildingData.name
    ) {
      setTappedBlueprint(
        tappedBlueprint === blueprintSlug ? null : blueprintSlug
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border-2 border-primary bg-body shadow-md transition-all hover:border-highlight">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl bg-primary px-4 py-2 sm:px-6">
        <h2 className="font-pixel text-2xl tracking-widest text-secondary sm:text-3xl">
          {level.name}
        </h2>
        <span className="rounded-lg bg-secondary px-2 py-1 text-base tracking-widest text-secondary sm:text-lg">
          XP {level.xpMultiplier}x
        </span>
      </header>

      {/* Content */}
      <div className="border-t-2 border-primary p-3 sm:p-4">
        {/* Description */}
        <div className="mb-4 space-y-2">
          <p className="card-text-box p-2">
            <em>{level.description}</em>
          </p>
        </div>

        {/* Unlocks Section */}
        {level.unlocks.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 font-pixel text-xl tracking-wider text-secondary">
              UNLOCKS
            </h4>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-primary p-2 sm:grid-cols-3 sm:p-5 md:grid-cols-6">
              {level.unlocks.map((unlock, index) => (
                <div
                  key={`${unlock.Slug}-${index}`}
                  className="group flex flex-col items-center rounded-xl border-2 border-primary/30 bg-secondary/70 p-2 transition-all hover:border-highlight"
                  title={unlock.Name}
                >
                  <div className="aspect-square w-24 rounded-xl border-2 border-primary/30 bg-primary p-2">
                    {unlock.UnlockType === 'Ball' ? (
                      <BallIcon
                        slug={unlock.Slug}
                        name={unlock.Name}
                        className="h-full w-full"
                      />
                    ) : (
                      <PassiveIcon
                        slug={unlock.Slug}
                        name={unlock.Name}
                        className="h-full w-full"
                      />
                    )}
                  </div>
                  <span className="mt-1 text-center text-sm leading-tight text-secondary">
                    {unlock.Name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blueprints Section */}
        {level.blueprints.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 font-pixel text-xl tracking-wider text-secondary">
              BLUEPRINTS
            </h4>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-primary p-2 sm:grid-cols-3 sm:p-5 md:grid-cols-6">
              {level.blueprints.map((blueprint, index) => {
                const buildingData = getBuildingBySlug(blueprint.Slug);
                const hoverText =
                  buildingData?.shortDescription || blueprint.Name;
                const showTooltip = tappedBlueprint === blueprint.Slug;

                return (
                  <div
                    key={`${blueprint.Slug}-${index}`}
                    className="group relative flex flex-col items-center rounded-xl border-2 border-primary/30 bg-secondary/70 p-2 transition-all hover:border-highlight active:scale-95 lg:active:scale-100"
                    onClick={() => handleBlueprintTap(blueprint.Slug)}
                  >
                    {/* Mobile tooltip */}
                    {showTooltip && (
                      <div className="absolute -top-2 left-1/2 z-10 w-full -translate-x-1/2 -translate-y-full rounded-lg border-2 border-primary bg-body px-3 py-2 text-center text-sm text-primary shadow-lg">
                        {hoverText}
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                      </div>
                    )}
                    <div className="aspect-square w-24 rounded-xl border-2 border-primary/30 bg-primary p-2">
                      <BuildingIcon
                        slug={blueprint.Slug}
                        name={hoverText}
                        className="h-full w-full"
                      />
                    </div>
                    <span className="mt-1 text-center text-sm leading-tight text-secondary">
                      {blueprint.Name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Enemy Grid */}
        <div className="mb-4">
          <h4 className="mb-2 font-pixel text-xl tracking-wider text-secondary">
            ENEMIES
          </h4>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-primary p-2 sm:grid-cols-3 sm:p-5 md:grid-cols-6">
            {enemies.map((enemy, index) => (
              <div
                key={`${enemy.templateSlug}-${index}`}
                className="group flex flex-col items-center rounded-xl border-2 border-primary/30 bg-secondary/70 p-2 transition-all hover:border-highlight"
                title={enemy.displayName}
              >
                <div className="aspect-square w-24 rounded-xl border-2 border-primary/30 bg-primary p-2">
                  <EnemyIcon
                    iconName={enemy.iconName}
                    name={enemy.displayName}
                    className="h-full w-full"
                  />
                </div>
                <span className="mt-1 text-center text-sm leading-tight text-secondary">
                  {enemy.displayName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
