'use client';

import { useState } from 'react';
import type { Ball } from '@/types/ball';
import { formatDescription, getBallBySlug } from '@/data/balls';
import BallIcon from './BallIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface BallsCardProps {
  ball: Ball;
  disableMobileExpand?: boolean;
  isGridExpanded?: boolean;
}

export default function BallsCard({
  ball,
  disableMobileExpand = false,
  isGridExpanded = false,
}: BallsCardProps) {
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [evolutionsExpanded, setEvolutionsExpanded] = useState(false);

  const currentLevelProps =
    ball[`level${selectedLevel}` as 'level1' | 'level2' | 'level3'];

  // Determine ball tier
  const tier =
    ball.fusionRecipe.length === 0
      ? 'Basic'
      : ball.fusionRecipe[0].length >= 3
        ? 'Legendary'
        : 'Evolved';

  // Get damage type color from BallColor property
  const getDamageTypeColor = () => {
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

  const highlightColor = getDamageTypeColor();

  // Format tag names
  const formatTagName = (tag: string) => {
    const cleaned = tag.replace(/^k/, '');
    if (cleaned === 'Frozen') return 'Freeze';
    if (cleaned === 'LaserHorz' || cleaned === 'LaserVert' || cleaned === 'Ray')
      return 'Laser';
    return cleaned.replace(/([A-Z])/g, ' $1').trim();
  };

  // Filter out tags that match the ball's slug (for spawners)
  const shouldShowTag = (tag: string) => {
    if (!ball.isSpawner) return true;
    const tagCleaned = tag
      .replace(/^k/, '')
      .replace(/^hupg_/, '')
      .toLowerCase();
    const slugCleaned = ball.slug.replace(/^hupg_/, '').toLowerCase();
    return tagCleaned !== slugCleaned;
  };

  // Format description with highlighted values
  const formatDescriptionWithHighlights = () => {
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

  // Collect all tags
  const allTags = [
    ...ball.hitEffects.filter(shouldShowTag),
    ...ball.aoeTypes.filter(shouldShowTag),
    ...ball.specials.filter(shouldShowTag),
  ];

  // If no tags, default to "Normal"
  const displayTags = allTags.length > 0 ? allTags : ['Normal'];

  return (
    <div
      className={`overflow-hidden rounded-lg border-2 bg-body shadow-md transition-all ${isGridExpanded ? 'border-highlight' : 'border-primary hover:border-highlight'}`}
    >
      {/* Mobile: Click to expand (disabled in grid view) */}
      <button
        onClick={() => !disableMobileExpand && setIsExpanded(!isExpanded)}
        className={`w-full p-2 text-left sm:p-4 ${disableMobileExpand ? 'cursor-default bg-card-header sm:cursor-default' : isExpanded ? 'bg-card-header' : 'bg-secondary sm:cursor-default sm:bg-card-header'}`}
      >
        <div className="grid h-16 grid-cols-[auto_1fr_auto_auto] items-center gap-3 sm:gap-4">
          {/* Ball Icon */}
          <div className="flex-shrink-0">
            <BallIcon
              slug={ball.slug}
              name={ball.name}
              className="h-16 w-16 sm:hidden"
            />
            <BallIcon
              slug={ball.slug}
              name={ball.name}
              className="hidden h-16 w-16 sm:block"
            />
          </div>

          {/* Ball Name */}
          <div className="min-w-0">
            <h3 className="font-pixel text-2xl tracking-wider text-primary sm:text-2xl md:text-4xl">
              {ball.name}
            </h3>
          </div>

          {/* Tier & Spawner Badges (Dashboard Style) */}
          <div className="flex flex-col items-end justify-center gap-1">
            <span
              className={`whitespace-nowrap rounded px-2 py-0.5 text-base sm:text-lg ${isExpanded ? 'bg-secondary' : 'bg-card-header sm:bg-secondary'}`}
            >
              {tier}
            </span>
            {ball.isSpawner ? (
              <span
                className={`whitespace-nowrap rounded px-2 py-0.5 text-base sm:text-lg ${isExpanded ? 'bg-secondary' : 'bg-card-header sm:bg-secondary'}`}
              >
                Spawner
              </span>
            ) : (
              <div className="h-5 sm:h-6" />
            )}
          </div>

          {/* Expand Icon (mobile only, hidden in grid view) */}
          {!disableMobileExpand && (
            <div className="flex-shrink-0 sm:hidden">
              <FontAwesomeIcon
                icon={isExpanded ? faChevronUp : faChevronDown}
                className="h-5 w-5 text-primary"
              />
            </div>
          )}
        </div>
      </button>

      {/* Expanded Content - Always shown on desktop, click to expand on mobile (unless disabled) */}
      <div
        className={`${disableMobileExpand ? 'block' : isExpanded ? 'block' : 'hidden'} border-t-2 border-primary p-3 sm:block sm:p-4`}
      >
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

        {/* Level Selector */}
        <div className="mb-3 flex gap-2">
          {[1, 2, 3].map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level as 1 | 2 | 3)}
              className={`flex-1 rounded-lg px-3 py-2 text-lg tracking-wider transition-colors sm:text-xl ${
                selectedLevel === level
                  ? 'bg-highlight text-primary'
                  : 'card-text-box'
              }`}
            >
              Level {level}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-3 rounded-lg bg-primary p-3 sm:p-4">
          <p className="text-justify text-lg leading-relaxed text-secondary sm:text-lg">
            {formatDescriptionWithHighlights()}
          </p>
        </div>

        {/* Footer Info: Recipe & Evolution */}
        <div className="space-y-1 text-base text-secondary sm:text-base">
          {ball.fusionRecipe.length > 0 && (
            <div className="rounded-lg bg-primary p-2 sm:p-3">
              <strong className="text-primary">Recipe:</strong>{' '}
              {ball.fusionRecipe
                .map(recipe =>
                  recipe
                    .map(slug => getBallBySlug(slug)?.name || slug)
                    .join(' + ')
                )
                .join(' | ')}
            </div>
          )}
          {ball.evolvesInto.length > 0 && (
            <div className="rounded-lg bg-primary p-2 sm:p-3">
              <button
                onClick={() => setEvolutionsExpanded(!evolutionsExpanded)}
                className="hover:text-highlight flex w-full items-center justify-between text-left transition-colors"
              >
                <span>
                  <strong className="text-primary">Evolves into:</strong>{' '}
                  {ball.evolvesInto
                    .map(slug => getBallBySlug(slug)?.name || slug)
                    .join(', ')}
                </span>
                <FontAwesomeIcon
                  icon={evolutionsExpanded ? faChevronUp : faChevronDown}
                  className="ml-2 h-4 w-4 flex-shrink-0 text-secondary"
                />
              </button>
              {evolutionsExpanded && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ball.evolvesInto.map(evolutionSlug => {
                    const evolutionBall = getBallBySlug(evolutionSlug);
                    if (!evolutionBall) return null;

                    // Find the recipe for this evolution
                    const recipe = evolutionBall.fusionRecipe.find(r =>
                      r.includes(ball.slug)
                    );
                    const partnerSlug = recipe?.find(
                      slug => slug !== ball.slug
                    );
                    const partnerBall = partnerSlug
                      ? getBallBySlug(partnerSlug)
                      : null;

                    return (
                      <div
                        key={evolutionSlug}
                        className="flex items-center justify-center gap-2 rounded border-2 border-primary/30 bg-body p-2"
                      >
                        {/* Current Ball Icon */}
                        <div className="flex flex-col items-center">
                          <BallIcon
                            slug={ball.slug}
                            name={ball.name}
                            className="h-16 w-16"
                          />
                        </div>

                        {/* Plus Sign */}
                        <span className="text-2xl font-bold text-secondary">
                          +
                        </span>

                        {/* Partner Ball Icon */}
                        {partnerBall ? (
                          <div className="flex flex-col items-center">
                            <BallIcon
                              slug={partnerBall.slug}
                              name={partnerBall.name}
                              className="h-16 w-16"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-dashed border-primary/30">
                            <span className="text-xs text-primary/50">?</span>
                          </div>
                        )}

                        {/* Equals Sign */}
                        <span className="text-2xl font-bold text-secondary">
                          =
                        </span>

                        {/* Evolution Ball Icon */}
                        <div className="flex flex-col items-center">
                          <BallIcon
                            slug={evolutionBall.slug}
                            name={evolutionBall.name}
                            className="h-16 w-16"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
