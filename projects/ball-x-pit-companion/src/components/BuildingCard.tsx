'use client';

import { useState } from 'react';
import type { Building } from '@/data/buildings';
import { formatBuildingCost } from '@/data/buildings';
import BuildingIcon from './BuildingIcon';
import StatIcon from './StatIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface BuildingCardProps {
  building: Building;
  disableMobileExpand?: boolean;
  isGridExpanded?: boolean;
}

export default function BuildingCard({
  building,
  disableMobileExpand = false,
  isGridExpanded = false,
}: BuildingCardProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLevelProps =
    building.propertiesByLevel.find(p => p.Level === selectedLevel)
      ?.Properties || {};

  // Format category name (remove 'k' prefix)
  const formatCategory = (cat: string) => cat.replace(/^k/, '');

  // Format subcategory name (remove 'k' prefix, add spaces)
  const formatSubCategory = (subCat: string) => {
    const cleaned = subCat.replace(/^k/, '');
    return cleaned.replace(/([A-Z])/g, ' $1').trim();
  };

  // Format description with highlighted values and stat icons
  const formatDescriptionWithHighlights = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /\{(\[.*?\])\}|<color=#\w+>|<\/color>/g;
    let match;
    let inColorTag = false;

    while ((match = regex.exec(building.description)) !== null) {
      if (match.index > lastIndex) {
        parts.push(building.description.substring(lastIndex, match.index));
      }

      if (match[0] === '<color=#FFFF00>') {
        inColorTag = true;
      } else if (match[0] === '</color>') {
        inColorTag = false;
      } else if (match[1]) {
        // This is a {[property]} match
        const key = match[1].replace(/[\[\]]/g, '');

        // Check if it's a stat icon
        if (key === 'icon') {
          const iconId = currentLevelProps[key] as string;
          if (
            iconId &&
            [
              'dexterity_icon',
              'endurance_icon',
              'intelligence_icon',
              'leadership_icon',
              'speed_icon',
              'strength_icon',
            ].includes(iconId)
          ) {
            parts.push(
              <StatIcon
                key={match.index}
                iconId={
                  iconId as
                    | 'dexterity_icon'
                    | 'endurance_icon'
                    | 'intelligence_icon'
                    | 'leadership_icon'
                    | 'speed_icon'
                    | 'strength_icon'
                }
                className="inline-block h-5 w-5"
              />
            );
          }
        } else {
          // Regular property value
          const value = currentLevelProps[key];
          if (value !== undefined) {
            parts.push(
              <span key={match.index} className="text-highlight font-bold">
                {String(value)}
              </span>
            );
          } else {
            parts.push(match[0]);
          }
        }
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < building.description.length) {
      parts.push(building.description.substring(lastIndex));
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
        <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
          {/* Building Icon */}
          <div className="flex-shrink-0">
            <BuildingIcon
              slug={building.slug}
              name={building.name}
              className="h-16 w-16"
            />
          </div>

          {/* Building Name */}
          <div className="min-w-0">
            <h3 className="font-pixel text-2xl tracking-wider text-primary sm:text-2xl md:text-4xl">
              {building.name}
            </h3>
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
        {/* Category & SubCategory Tags */}
        <div className="mb-3 flex flex-wrap gap-1 sm:gap-2">
          <span className="rounded border-2 border-highlight bg-primary px-2 py-1 text-base font-semibold text-secondary sm:text-lg">
            {formatCategory(building.category)}
          </span>
          <span className="rounded border-2 border-highlight bg-primary px-2 py-1 text-base font-semibold text-secondary sm:text-lg">
            {formatSubCategory(building.subCategory)}
          </span>
        </div>

        {/* Level Selector */}
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {Array.from({ length: building.numLevels }, (_, i) => i + 1).map(
            level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`flex-shrink-0 rounded-lg px-3 py-2 text-lg tracking-wider transition-colors sm:text-xl ${
                  selectedLevel === level
                    ? 'bg-highlight text-primary'
                    : 'card-text-box'
                }`}
              >
                Level {level}
              </button>
            )
          )}
        </div>

        {/* Description */}
        <div className="mb-3 rounded-lg bg-primary p-3 sm:p-4">
          <p className="text-justify text-lg leading-relaxed text-secondary sm:text-lg">
            {formatDescriptionWithHighlights()}
          </p>
        </div>

        {/* Build Cost */}
        <div className="space-y-1 text-base text-secondary sm:text-base">
          <div className="rounded-lg bg-primary p-2 sm:p-3">
            <strong className="text-primary">Build Cost:</strong>{' '}
            {formatBuildingCost(building.buildCost)}
          </div>
          {building.numLevels > 1 && (
            <div className="rounded-lg bg-primary p-2 sm:p-3">
              <strong className="text-primary">Base Upgrade Cost:</strong>{' '}
              {formatBuildingCost(building.baseUpgradeCost)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
