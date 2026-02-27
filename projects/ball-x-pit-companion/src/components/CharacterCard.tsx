'use client';

import { useState } from 'react';
import { Character, formatStatName, formatPropName } from '@/data/characters';
import { getBallBySlug } from '@/data/balls';
import BallIcon from './BallIcon';
import CharacterIcon from './CharacterIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface CharacterCardProps {
  character: Character;
  disableMobileExpand?: boolean;
}

export default function CharacterCard({
  character,
  disableMobileExpand = false,
}: CharacterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const starterBall = getBallBySlug(character.starterBall);

  const statEntries = Object.entries(character.stats);
  const hasProps = character.props && character.props.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border-2 border-primary bg-body shadow-md transition-all hover:border-highlight">
      {/* Mobile: Click to expand (disabled in grid view) */}
      <button
        onClick={() => !disableMobileExpand && setIsExpanded(!isExpanded)}
        className={`w-full p-2 text-left sm:p-4 ${disableMobileExpand ? 'cursor-default bg-card-header sm:cursor-default' : isExpanded ? 'bg-card-header' : 'bg-secondary sm:cursor-default sm:bg-card-header'}`}
      >
        <div className="grid h-16 grid-cols-[auto_1fr_auto_auto] items-center gap-3 sm:gap-4">
          {/* Portrait */}
          <div className="flex flex-shrink-0 items-end justify-center">
            <div className="-translate-y-1 border-b-2 border-primary">
              <CharacterIcon
                slug={character.slug}
                name={character.name}
                type="portrait"
                className="h-16 w-16 sm:hidden"
              />
            </div>
            <div className="-translate-y-1 border-b-2 border-primary">
              <CharacterIcon
                slug={character.slug}
                name={character.name}
                type="portrait"
                className="hidden h-16 w-16 sm:block"
              />
            </div>
          </div>

          {/* Name */}
          <div className="min-w-0">
            <h3 className="font-pixel text-xl tracking-wider text-primary sm:text-2xl md:text-4xl">
              {character.name}
            </h3>
          </div>

          {/* Starter Ball */}
          <div className="flex-shrink-0">
            {starterBall ? (
              <BallIcon
                slug={starterBall.slug}
                name={starterBall.name}
                className="h-16 w-16 shrink-0"
              />
            ) : (
              <div className="h-16 w-16" />
            )}
          </div>

          {/* Expand Icon (mobile only) */}
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
        {/* Descriptions */}
        <div className="mb-4 space-y-2">
          {/* Flavor text */}
          <div className="card-text-box p-2">
            <em>&ldquo;{character.flavorDescription}&rdquo;</em>
          </div>

          {/* Gameplay description */}
          <p className="card-text-box p-2">{character.gameplayDescription}</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-4">
          <h4 className="mb-2 font-pixel text-xl tracking-wider text-secondary">
            STATS
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {statEntries.map(([statKey, value]) => (
              <div
                key={statKey}
                className="flex items-center justify-between rounded border border-primary/30 bg-primary px-3 py-1"
              >
                <span className="text-xl text-primary/80">
                  {formatStatName(statKey)}
                </span>
                <span className="text-xl font-bold text-secondary">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
