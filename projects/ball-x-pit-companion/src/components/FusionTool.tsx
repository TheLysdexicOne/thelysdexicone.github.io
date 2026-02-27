'use client';

import { useState } from 'react';
import type { Ball } from '@/types/ball';
import { getAllBalls, getBallBySlug } from '@/data/balls';
import BallIcon from './BallIcon';
import BallsCard from './BallsCard';
import FusionIcon from './FusionIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import propertyCategorizationJson from '../../data/latest/property_types_categorization.json';

const propertyCategorization = propertyCategorizationJson as Record<
  string,
  {
    IsAOEDamageProp: boolean;
    IsStatusEffectDamageProp: boolean;
    IsMosquitoDamageProp: boolean;
  }
>;

export default function FusionTool() {
  const [slotA, setSlotA] = useState<Ball | null>(null);
  const [slotB, setSlotB] = useState<Ball | null>(null);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allBalls = getAllBalls();

  // Helper function to check if a ball has AOE damage
  const hasAOEDamage = (ball: Ball): boolean => {
    return ball.isAOE === true;
  };

  // Helper function to check if a ball has status effects
  const hasStatusEffects = (ball: Ball): boolean => {
    return ball.isStatusEffect === true;
  };

  // Get damage type color from BallColor property
  const getDamageTypeColor = (ball: Ball) => {
    if (!ball.ballColor) return '#f59e0b'; // Fallback to amber-500

    const colorMatch = ball.ballColor.match(
      /r:\s*([\d.]+),\s*g:\s*([\d.]+),\s*b:\s*([\d.]+)/
    );
    if (!colorMatch) return '#f59e0b';

    const r = Math.round(parseFloat(colorMatch[1]) * 255);
    const g = Math.round(parseFloat(colorMatch[2]) * 255);
    const b = Math.round(parseFloat(colorMatch[3]) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Format description with highlighted values for a specific ball and level
  const formatDescriptionWithHighlights = (ball: Ball, level: 1 | 2 | 3) => {
    const currentLevelProps =
      ball[`level${level}` as 'level1' | 'level2' | 'level3'];
    const highlightColor = getDamageTypeColor(ball);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\{\[(\w+)\]\}/g;
    let match;

    while ((match = regex.exec(ball.description)) !== null) {
      if (match.index > lastIndex) {
        parts.push(ball.description.substring(lastIndex, match.index));
      }

      const key = match[1];
      const value = currentLevelProps[key];

      if (value !== undefined) {
        let displayValue: string | number = value;
        if (
          key.includes('_length') ||
          key.includes('_len') ||
          key.includes('cycle') ||
          key.includes('cooldown')
        ) {
          const numValue =
            typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(numValue)) {
            displayValue = (numValue / 10).toFixed(1);
          }
        } else if (key.includes('_chance') || key.includes('_pct')) {
          displayValue = `${value}%`;
        }

        parts.push(
          <span
            key={match.index}
            className="font-bold"
            style={{ color: highlightColor }}
          >
            {String(displayValue)}
          </span>
        );
      } else {
        parts.push(match[0]);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < ball.description.length) {
      parts.push(ball.description.substring(lastIndex));
    }

    // Ensure the description ends with a period
    const lastPart = parts[parts.length - 1];
    if (typeof lastPart === 'string' && !lastPart.trim().endsWith('.')) {
      parts[parts.length - 1] = lastPart + '.';
    } else if (typeof lastPart !== 'string' && parts.length > 0) {
      parts.push('.');
    }

    return parts;
  };

  // Filter balls for selection
  const filteredBalls = allBalls.filter(ball =>
    ball.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle ball selection
  const handleBallSelect = (ball: Ball) => {
    if (activeSlot === 'A') {
      // Prevent selecting the same ball that's in slot B
      if (slotB && slotB.slug === ball.slug) {
        return;
      }
      setSlotA(ball);
      setActiveSlot(null);
    } else if (activeSlot === 'B') {
      // Prevent selecting the same ball that's in slot A
      if (slotA && slotA.slug === ball.slug) {
        return;
      }
      setSlotB(ball);
      setActiveSlot(null);
    }
  };

  // Swap slots
  const handleSwap = () => {
    const temp = slotA;
    setSlotA(slotB);
    setSlotB(temp);
  };

  // Clear slots
  const handleClear = () => {
    setSlotA(null);
    setSlotB(null);
    setActiveSlot(null);
  };

  // Check if two balls have an evolution together
  const getEvolutionBall = (ballA: Ball, ballB: Ball): Ball | null => {
    // Don't allow evolution if both balls are the same
    if (ballA.slug === ballB.slug) {
      return null;
    }

    // Check if any ball has an exact recipe match with both slugs
    for (const ball of allBalls) {
      if (ball.fusionRecipe.length > 0) {
        for (const recipe of ball.fusionRecipe) {
          // Recipe must be exactly 2 ingredients and contain both slugs
          if (
            recipe.length === 2 &&
            recipe.includes(ballA.slug) &&
            recipe.includes(ballB.slug)
          ) {
            return ball;
          }
        }
      }
    }

    return null;
  };

  // Get the evolution ball if it exists
  const evolutionBall = slotA && slotB ? getEvolutionBall(slotA, slotB) : null;

  // Combine tags from both balls for fusion display
  const getCombinedTags = (ballA: Ball, ballB: Ball): string[] => {
    const tags = new Set<string>();

    // Filter function to exclude spawner's own type
    const shouldShowTag = (ball: Ball, tag: string) => {
      if (!ball.isSpawner) return true;
      const tagCleaned = tag
        .replace(/^k/, '')
        .replace(/^hupg_/, '')
        .toLowerCase();
      const slugCleaned = ball.slug.replace(/^hupg_/, '').toLowerCase();
      return tagCleaned !== slugCleaned;
    };

    // Add hit effects (arrays)
    if (ballA.hitEffects) {
      ballA.hitEffects.forEach(effect => {
        if (shouldShowTag(ballA, effect)) tags.add(effect);
      });
    }
    if (ballB.hitEffects) {
      ballB.hitEffects.forEach(effect => {
        if (shouldShowTag(ballB, effect)) tags.add(effect);
      });
    }

    // Add AOE types (arrays)
    if (ballA.aoeTypes) {
      ballA.aoeTypes.forEach(type => {
        if (shouldShowTag(ballA, type)) tags.add(type);
      });
    }
    if (ballB.aoeTypes) {
      ballB.aoeTypes.forEach(type => {
        if (shouldShowTag(ballB, type)) tags.add(type);
      });
    }

    // Add special tags
    if (ballA.specials) {
      ballA.specials.forEach(special => {
        if (shouldShowTag(ballA, special)) tags.add(special);
      });
    }
    if (ballB.specials) {
      ballB.specials.forEach(special => {
        if (shouldShowTag(ballB, special)) tags.add(special);
      });
    }

    // Add spawner tag if either is a spawner
    if (ballA.isSpawner) tags.add('Spawner');
    if (ballB.isSpawner) tags.add('Spawner');

    return Array.from(tags);
  };

  // Format tag names for display
  const formatTagName = (tag: string) => {
    const cleaned = tag.replace(/^k/, '');
    if (cleaned === 'Frozen') return 'Freeze';
    if (cleaned === 'LaserHorz' || cleaned === 'LaserVert' || cleaned === 'Ray')
      return 'Laser';
    return cleaned.replace(/([A-Z])/g, ' $1').trim();
  };

  const displayTags =
    slotA && slotB && !evolutionBall ? getCombinedTags(slotA, slotB) : [];

  // Calculate special fusion effects
  const getSpecialEffects = (ballA: Ball, ballB: Ball) => {
    const effects: Array<{ type: string; description: React.ReactNode }> = [];

    // Priority order for special effects (can be reordered if needed)
    const effectChecks = [
      // 1. Mosquito combo - mosquitoes inflict hit effects
      () => {
        if (ballA.isMosquitoSpawner) {
          effects.push({
            type: 'mosquito_combo',
            description: (
              <>
                Mosquitoes also inflict hit effects from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballB.name}
                </span>{' '}
                when hitting an enemy
              </>
            ),
          });
          return true;
        }
        if (ballB.isMosquitoSpawner) {
          effects.push({
            type: 'mosquito_combo',
            description: (
              <>
                Mosquitoes also inflict hit effects from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballA.name}
                </span>{' '}
                when hitting an enemy
              </>
            ),
          });
          return true;
        }
        return false;
      },

      // 2. Spawner combo - spawned balls inherit properties
      () => {
        if (ballA.isSpawner && !ballB.isSpawner) {
          effects.push({
            type: 'spawner_combo',
            description: (
              <>
                Spawned balls from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballA.name}
                </span>{' '}
                have the same properties as{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballB.name}
                </span>
              </>
            ),
          });
          return true;
        }
        if (ballB.isSpawner && !ballA.isSpawner) {
          effects.push({
            type: 'spawner_combo',
            description: (
              <>
                Spawned balls from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballB.name}
                </span>{' '}
                have the same properties as{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballA.name}
                </span>
              </>
            ),
          });
          return true;
        }
        return false;
      },

      // 3. AOE + HitEffect combo - AOE inflicts status effects
      () => {
        if (hasAOEDamage(ballA) && hasStatusEffects(ballB)) {
          effects.push({
            type: 'aoe_hiteff_combo',
            description: (
              <>
                Area-of-effect damage from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballA.name}
                </span>{' '}
                also inflicts status effects from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballB.name}
                </span>
              </>
            ),
          });
          return true;
        }
        if (hasAOEDamage(ballB) && hasStatusEffects(ballA)) {
          effects.push({
            type: 'aoe_hiteff_combo',
            description: (
              <>
                Area-of-effect damage from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballB.name}
                </span>{' '}
                also inflicts status effects from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballA.name}
                </span>
              </>
            ),
          });
          return true;
        }
        return false;
      },

      // 4. Glacier combo - glacial spikes apply hit effects (only when Glacier is first ball)
      () => {
        if (ballA.isGlacier && hasStatusEffects(ballB)) {
          effects.push({
            type: 'glacier_combo',
            description: (
              <>
                Glacial Spikes apply the hit effects from{' '}
                <span className="font-pixel text-2xl tracking-wider">
                  {ballB.name}
                </span>{' '}
                when touching an enemy
              </>
            ),
          });
          return true;
        }
        return false;
      },
    ];

    // Execute checks in priority order, stop after first match
    for (const check of effectChecks) {
      if (check()) {
        break; // Stop checking once we find a match
      }
    }

    return effects;
  };

  const specialEffects =
    slotA && slotB && !evolutionBall ? getSpecialEffects(slotA, slotB) : [];

  return (
    <div className="space-y-6">
      {/* Fusion Slots */}
      <div className="space-y-4">
        <h2 className="text-center font-pixel text-xl tracking-wider text-primary sm:text-2xl">
          Select Two Balls to Fuse
        </h2>

        <div className="flex items-center justify-center gap-4">
          {/* Slot A */}
          <button
            onClick={() => setActiveSlot(activeSlot === 'A' ? null : 'A')}
            className={`flex h-32 w-32 items-center justify-center rounded-lg border-4 transition-all sm:h-40 sm:w-40 ${
              activeSlot === 'A'
                ? 'border-highlight bg-card-header shadow-lg'
                : slotA
                  ? 'border-primary bg-body hover:border-highlight'
                  : 'border-dashed border-primary bg-body/50 hover:border-highlight'
            }`}
          >
            {slotA ? (
              <BallIcon
                slug={slotA.slug}
                name={slotA.name}
                className="h-24 w-24 sm:h-32 sm:w-32"
              />
            ) : (
              <span className="font-pixel text-lg text-secondary">Slot A</span>
            )}
          </button>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!slotA || !slotB}
            className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-primary bg-body text-primary transition-colors hover:border-highlight hover:bg-card-header disabled:opacity-30"
          >
            <FontAwesomeIcon icon={faRightLeft} className="h-6 w-6" />
          </button>

          {/* Slot B */}
          <button
            onClick={() => setActiveSlot(activeSlot === 'B' ? null : 'B')}
            className={`flex h-32 w-32 items-center justify-center rounded-lg border-4 transition-all sm:h-40 sm:w-40 ${
              activeSlot === 'B'
                ? 'border-highlight bg-card-header shadow-lg'
                : slotB
                  ? 'border-primary bg-body hover:border-highlight'
                  : 'border-dashed border-primary bg-body/50 hover:border-highlight'
            }`}
          >
            {slotB ? (
              <BallIcon
                slug={slotB.slug}
                name={slotB.name}
                className="h-24 w-24 sm:h-32 sm:w-32"
              />
            ) : (
              <span className="font-pixel text-lg text-secondary">Slot B</span>
            )}
          </button>
        </div>
      </div>

      {/* Ball Selection Grid (shown when a slot is active) */}
      {activeSlot && (
        <div className="space-y-3 rounded-lg border-2 border-highlight bg-body p-4">
          <h3 className="font-pixel text-lg tracking-wider text-primary sm:text-xl">
            Select Ball for Slot {activeSlot}
          </h3>

          {/* Search */}
          <input
            type="text"
            placeholder="Search balls..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base text-primary placeholder:text-primary/50 focus:border-highlight focus:ring-0 sm:text-lg"
          />

          {/* Grid */}
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {filteredBalls.map(ball => {
              const isOtherSlot =
                (activeSlot === 'A' && slotB?.slug === ball.slug) ||
                (activeSlot === 'B' && slotA?.slug === ball.slug);
              return (
                <button
                  key={ball.id}
                  onClick={() => handleBallSelect(ball)}
                  disabled={isOtherSlot}
                  className={`flex aspect-square items-center justify-center rounded-lg border-2 p-1 transition-all ${
                    isOtherSlot
                      ? 'cursor-not-allowed border-red-500/50 bg-red-900/20 opacity-50'
                      : 'border-primary bg-body hover:border-highlight hover:bg-card-header'
                  }`}
                  title={
                    isOtherSlot ? 'Cannot fuse two of the same ball' : ball.name
                  }
                >
                  <BallIcon
                    slug={ball.slug}
                    name={ball.name}
                    className="h-full w-full"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fusion Results */}
      {slotA && slotB && (
        <div className="space-y-4">
          {evolutionBall ? (
            <>
              <div className="card-primary">
                {/* Evolution Display */}
                <div className="card-text-box">
                  <p className="font-pixel text-2xl tracking-wider text-secondary">
                    {slotA.name} × {slotB.name} cannot fuse as they already have
                    the EVOLUTION:
                  </p>
                </div>
              </div>

              {/* Evolution Ball Card */}
              <BallsCard ball={evolutionBall} disableMobileExpand={true} />
            </>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border-2 border-highlight bg-body">
                {/* Fusion Name */}
                <div className="w-full bg-card-header p-2 text-left sm:p-4">
                  <div className="grid h-16 grid-cols-[auto_1fr_auto_auto] items-center gap-3 sm:gap-4">
                    {/* Fusion Icon - Ball A shape with Ball B color */}
                    <div className="flex-shrink-0">
                      <FusionIcon
                        ballA={slotA}
                        ballB={slotB}
                        className="h-[60px] w-[60px] sm:hidden"
                      />
                      <FusionIcon
                        ballA={slotA}
                        ballB={slotB}
                        className="hidden h-16 w-16 sm:block"
                      />
                    </div>

                    <h3 className="font-pixel text-2xl tracking-wider text-primary sm:text-2xl md:text-4xl">
                      {slotA.name} × {slotB.name}
                    </h3>
                  </div>
                </div>
                <div className="border-t-2 border-primary p-3 sm:block sm:p-4">
                  {/* Tags */}
                  {displayTags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1 sm:gap-2">
                      {displayTags.map((tag, idx) => (
                        <span
                          key={`${tag}-${idx}`}
                          className="rounded border-2 border-highlight bg-primary px-2 py-1 text-base font-semibold text-secondary sm:text-lg"
                        >
                          {formatTagName(tag)}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Stats Display */}

                  {/* Ball A Stats on top, Ball B stats on bottom */}
                  <div className="mb-3 space-y-4 rounded-lg bg-primary p-3 sm:p-4">
                    <div className="text-center text-lg leading-relaxed text-secondary sm:text-lg">
                      {formatDescriptionWithHighlights(slotA, 3)}
                    </div>
                    <div className="text-center text-lg leading-relaxed text-secondary sm:text-lg">
                      {formatDescriptionWithHighlights(slotB, 3)}
                    </div>
                  </div>

                  {/* Additional Effects */}
                  {specialEffects.length > 0 && (
                    <div className="space-y-4 rounded-lg bg-primary p-3 sm:p-4">
                      {specialEffects.map((effect, idx) => (
                        <div
                          key={`${effect.type}-${idx}`}
                          className="text-center text-lg leading-relaxed text-secondary sm:text-lg"
                        >
                          <p className="text-base leading-relaxed text-secondary sm:text-lg">
                            {effect.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      {!activeSlot && !slotA && !slotB && (
        <div className="rounded-lg bg-primary p-4 text-center">
          <p className="font-pixel text-base tracking-wider text-secondary sm:text-lg">
            Click on a slot to select a ball for fusion
          </p>
        </div>
      )}
    </div>
  );
}
