'use client';

import { useState } from 'react';
import type { Passive } from '@/data/passives';
import { getPassiveBySlug } from '@/data/passives';
import PassiveIcon from './PassiveIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface PassiveCardProps {
  passive: Passive;
  disableMobileExpand?: boolean;
  isGridExpanded?: boolean;
}

export default function PassiveCard({
  passive,
  disableMobileExpand = false,
  isGridExpanded = false,
}: PassiveCardProps) {
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current level properties
  const currentLevelProps =
    passive.propertiesByLevel?.[selectedLevel - 1]?.properties || {};

  // Determine passive tier
  const tier =
    !passive.mergeComponents || passive.mergeComponents.length === 0
      ? 'Basic'
      : 'Merged';

  // Get main color for highlights
  const getHighlightColor = () => {
    if (!passive.mainColor) return '#f59e0b'; // Fallback to amber-500

    const colorMatch = passive.mainColor.match(
      /r:\s*([\d.]+),\s*g:\s*([\d.]+),\s*b:\s*([\d.]+)/
    );
    if (!colorMatch) return '#f59e0b';

    const r = Math.round(parseFloat(colorMatch[1]) * 255);
    const g = Math.round(parseFloat(colorMatch[2]) * 255);
    const b = Math.round(parseFloat(colorMatch[3]) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const highlightColor = getHighlightColor();

  // Format description with highlighted values
  const formatDescriptionWithHighlights = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\{\[(\w+)\]\}/g;
    let match;

    while ((match = regex.exec(passive.description)) !== null) {
      if (match.index > lastIndex) {
        parts.push(passive.description.substring(lastIndex, match.index));
      }

      const key = match[1];
      const value = currentLevelProps[key];

      if (value !== undefined) {
        let displayValue: string | number = value;

        // Handle percentage values
        if (key.includes('_pct') || key.includes('_chance')) {
          displayValue = `${value}%`;
        }
        // Handle time-based values (deciseconds to seconds)
        else if (
          key.includes('_length') ||
          key.includes('_len') ||
          key.includes('cycle') ||
          key.includes('cooldown') ||
          key.includes('duration')
        ) {
          const numValue =
            typeof value === 'number' ? value : parseFloat(String(value));
          if (!isNaN(numValue)) {
            displayValue = (numValue / 10).toFixed(1);
          }
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

    if (lastIndex < passive.description.length) {
      parts.push(passive.description.substring(lastIndex));
    }

    return parts;
  };

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
          {/* Passive Icon */}
          <div className="flex-shrink-0">
            <PassiveIcon
              slug={passive.slug}
              name={passive.name}
              className="h-[60px] w-[60px] sm:hidden"
            />
            <PassiveIcon
              slug={passive.slug}
              name={passive.name}
              className="hidden h-16 w-16 sm:block"
            />
          </div>

          {/* Passive Name */}
          <div className="min-w-0">
            <h3 className="font-pixel text-2xl tracking-wider text-primary sm:text-2xl md:text-4xl">
              {passive.name}
            </h3>
          </div>

          {/* Tier & Tags Badges (Dashboard Style) */}
          <div className="flex flex-col items-end justify-center gap-1">
            <span
              className={`whitespace-nowrap rounded px-2 py-0.5 text-base sm:text-lg ${isExpanded ? 'bg-secondary' : 'bg-card-header sm:bg-secondary'}`}
            >
              {tier}
            </span>
            {passive.tags && passive.tags.length > 0 ? (
              <span
                className={`whitespace-nowrap rounded px-2 py-0.5 text-base sm:text-lg ${isExpanded ? 'bg-secondary' : 'bg-card-header sm:bg-secondary'}`}
              >
                {passive.tags[0]}
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

        {/* Footer Info: Evolution & Merge Recipe */}
        <div className="space-y-1 text-base text-secondary sm:text-base">
          {passive.evolutionSlugs && passive.evolutionSlugs.length > 0 && (
            <div className="rounded-lg bg-primary p-2 sm:p-3">
              <strong className="text-primary">Evolves into:</strong>{' '}
              {passive.evolutionSlugs
                .map(slug => getPassiveBySlug(slug)?.name || slug)
                .join(', ')}
            </div>
          )}
          {passive.mergeComponents && passive.mergeComponents.length > 0 && (
            <div className="rounded-lg bg-primary p-2 sm:p-3">
              <strong className="text-primary">Merge Recipe:</strong>{' '}
              {passive.mergeComponents
                .map(slug => getPassiveBySlug(slug)?.name || slug)
                .join(' + ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
