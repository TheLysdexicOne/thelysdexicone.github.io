'use client';

import CompletableIcon from '@/components/CompletableIcon';
import CharacterIcon from '@/components/CharacterIcon';
import { getAllCharacters, type Character } from '@/data/characters';
import { getAllLevels } from '@/data/levels';
import type { Level } from '@/types/level';
import { useProgressData } from '@/hooks/useProgressData';
import { getImagePath } from '@/utils/basePath';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  DifficultyTier,
  FastTierCompletion,
} from '@/types/characterProgress';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';

// Map level IDs to background images
const getBackgroundForLevel = (levelId: number): string | null => {
  const backgrounds: { [key: number]: string } = {
    1: '/images/levels/01-bone-yard.png',
    2: '/images/levels/02-snowy-shores.png',
    3: '/images/levels/03-liminal-desert.png',
    4: '/images/levels/04-fungal-forest.png',
    5: '/images/levels/05-gory-grasslands.png',
    6: '/images/levels/06-smoldering-depths.png',
    7: '/images/levels/07-heavenly-gates.png',
    8: '/images/levels/08-vast-void.png',
  };
  return backgrounds[levelId] || null;
};

// Difficulty tier options
const DIFFICULTY_TIERS: { value: DifficultyTier; label: string }[] = [
  { value: 'base', label: 'Base Level' },
  { value: 'ng-plus', label: 'New Game +' },
  { value: 'ng-plus-2', label: 'New Game ++' },
  { value: 'ng-plus-3', label: 'New Game +3' },
  { value: 'ng-plus-4', label: 'New Game +4' },
  { value: 'ng-plus-5', label: 'New Game +5' },
  { value: 'ng-plus-6', label: 'New Game +6' },
  { value: 'ng-plus-7', label: 'New Game +7' },
  { value: 'ng-plus-8', label: 'New Game +8' },
  { value: 'ng-plus-9', label: 'New Game +9' },
];

// Fast tier options
const FAST_TIERS: { value: FastTierCompletion; label: string }[] = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Fast' },
  { value: 3, label: 'Fast +' },
  { value: 4, label: 'Fast ++' },
  { value: 5, label: 'Fast +3' },
  { value: 6, label: 'Fast +4' },
  { value: 7, label: 'Fast +5' },
  { value: 8, label: 'Fast +6' },
  { value: 9, label: 'Fast +7' },
  { value: 10, label: 'Fast +8' },
  { value: 11, label: 'Fast +9' },
];

export default function Home() {
  const router = useRouter();
  const {
    getSortedCharacters,
    updateLevelCompletion,
    getCharacterProgress,
    currentDifficulty,
    currentTier,
    setCurrentDifficulty,
    setCurrentTier,
  } = useProgressData();
  const [sortedCharacters, setSortedCharacters] = useState<Character[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setLevels(getAllLevels());
  }, []);

  useEffect(() => {
    const sortedProgress = getSortedCharacters();
    const allCharacters = getAllCharacters();
    const characters = sortedProgress
      .map(progress => allCharacters.find(c => c.id === progress.characterId))
      .filter((character): character is Character => character !== undefined);
    setSortedCharacters(characters);
  }, [getSortedCharacters]);

  const navigateDifficulty = (direction: 'prev' | 'next') => {
    const currentIndex = DIFFICULTY_TIERS.findIndex(
      tier => tier.value === currentDifficulty
    );
    let nextDifficulty: DifficultyTier | null = null;

    if (direction === 'prev' && currentIndex > 0) {
      nextDifficulty = DIFFICULTY_TIERS[currentIndex - 1].value;
    } else if (
      direction === 'next' &&
      currentIndex < DIFFICULTY_TIERS.length - 1
    ) {
      nextDifficulty = DIFFICULTY_TIERS[currentIndex + 1].value;
    }

    if (nextDifficulty) {
      setCurrentDifficulty(nextDifficulty);
    }
  };

  const navigateFastTier = (direction: 'prev' | 'next') => {
    const currentIndex = FAST_TIERS.findIndex(
      tier => tier.value === currentTier
    );
    let nextTier: FastTierCompletion | null = null;

    if (direction === 'prev' && currentIndex > 0) {
      nextTier = FAST_TIERS[currentIndex - 1].value;
    } else if (direction === 'next' && currentIndex < FAST_TIERS.length - 1) {
      nextTier = FAST_TIERS[currentIndex + 1].value;
    }

    if (nextTier) {
      setCurrentTier(nextTier);
    }
  };

  const isCharacterLevelComplete = (
    characterId: string,
    levelId: number
  ): boolean => {
    const progress = getCharacterProgress(characterId);
    if (!progress) return false;

    const completion = progress.levelCompletions.find(
      entry =>
        entry.levelId === levelId && entry.difficulty === currentDifficulty
    );

    if (!completion) return false;

    return completion.fastTier >= currentTier;
  };

  const toggleCharacterCompletion = (characterId: string, levelId: number) => {
    const alreadyComplete = isCharacterLevelComplete(characterId, levelId);
    const newFastTier = alreadyComplete
      ? Math.max(0, currentTier - 1)
      : currentTier;

    updateLevelCompletion(characterId, levelId, {
      difficulty: currentDifficulty,
      fastTier: newFastTier as FastTierCompletion,
    });
  };

  const currentDifficultyLabel =
    DIFFICULTY_TIERS.find(tier => tier.value === currentDifficulty)?.label ||
    'Base Level';
  const currentFastTierLabel =
    FAST_TIERS.find(tier => tier.value === currentTier)?.label || 'Normal';

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <div className="mb-4 grid w-full gap-4 sm:grid-cols-2">
        <div className="btn-body-secondary relative flex min-h-[48px] items-center justify-center px-6 py-2 sm:px-10">
          {isClient && currentDifficulty !== DIFFICULTY_TIERS[0].value && (
            <button
              className="absolute left-4 text-3xl text-secondary transition-colors sm:left-6 sm:text-4xl"
              onClick={() => navigateDifficulty('prev')}
              aria-label="Previous difficulty tier"
            >
              <FontAwesomeIcon icon={faCaretLeft} />
            </button>
          )}
          <h1 className="select-none text-center font-pixel text-2xl tracking-widest text-secondary sm:text-3xl lg:text-4xl">
            {isClient ? currentDifficultyLabel : 'Base Level'}
          </h1>
          {isClient &&
            currentDifficulty !==
              DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1].value && (
              <button
                className="absolute right-4 text-3xl text-secondary transition-colors sm:right-6 sm:text-4xl"
                onClick={() => navigateDifficulty('next')}
                aria-label="Next difficulty tier"
              >
                <FontAwesomeIcon icon={faCaretRight} />
              </button>
            )}
        </div>
        <div className="btn-body-secondary relative flex min-h-[48px] items-center justify-center px-6 py-2 sm:px-10">
          {isClient && currentTier !== FAST_TIERS[0].value && (
            <button
              className="absolute left-4 text-3xl text-secondary transition-colors sm:left-6 sm:text-4xl"
              onClick={() => navigateFastTier('prev')}
              aria-label="Previous fast tier"
            >
              <FontAwesomeIcon icon={faCaretLeft} />
            </button>
          )}
          <h1 className="select-none text-center font-pixel text-2xl tracking-widest text-secondary sm:text-3xl lg:text-4xl">
            {isClient ? currentFastTierLabel : 'Normal'}
          </h1>
          {isClient &&
            currentTier !== FAST_TIERS[FAST_TIERS.length - 1].value && (
              <button
                className="absolute right-4 text-3xl text-secondary transition-colors sm:right-6 sm:text-4xl"
                onClick={() => navigateFastTier('next')}
                aria-label="Next fast tier"
              >
                <FontAwesomeIcon icon={faCaretRight} />
              </button>
            )}
        </div>
      </div>
      <div className="w-full space-y-4">
        {levels.map(level => {
          const backgroundUrl = getBackgroundForLevel(level.levelId)
            ? getImagePath(getBackgroundForLevel(level.levelId)!)
            : null;

          return (
            <section
              key={level.levelId}
              className="relative overflow-hidden rounded-xl border-2 border-primary shadow-lg backdrop-blur"
            >
              {backgroundUrl && (
                <>
                  <div
                    className="absolute inset-0 -z-20 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundUrl})` }}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 -z-10 bg-body/80"
                    aria-hidden="true"
                  />
                </>
              )}

              <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 rounded-t-xl bg-primary px-4 py-2 sm:px-6">
                <h2 className="font-pixel text-2xl tracking-widest text-secondary sm:text-3xl">
                  {level.name}
                </h2>
                <span className="text-xs uppercase tracking-[0.45em] text-secondary/70 md:text-sm">
                  LEVEL {level.levelId.toString().padStart(2, '0')}
                </span>
              </header>
              <div className="relative z-10 border-t-2 border-primary px-2 py-2 sm:px-4 sm:py-4">
                <div className="grid grid-cols-4 justify-items-center gap-2 sm:grid-cols-8">
                  {sortedCharacters.map(character => (
                    <CharacterIcon
                      key={`${level.levelId}-${character.id}`}
                      slug={character.id}
                      name={character.name}
                      type="sprite"
                      className="h-16 w-16 sm:h-16 sm:w-16"
                    >
                      <CompletableIcon
                        isComplete={isCharacterLevelComplete(
                          character.id,
                          level.levelId
                        )}
                        onToggle={() =>
                          toggleCharacterCompletion(character.id, level.levelId)
                        }
                        isClient={isClient}
                        label={`${character.name} - ${isCharacterLevelComplete(character.id, level.levelId) ? 'Complete' : 'Incomplete'}`}
                        checkmarkClassName="absolute top-0 right-0 h-2/3 w-2/3"
                      />
                    </CharacterIcon>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="btn-body-primary font-pixel text-xl tracking-widest"
          onClick={() => router.push('/settings/reorder-heroes')}
          type="button"
        >
          REORDER CHARACTERS
        </button>
      </div>
    </div>
  );
}
