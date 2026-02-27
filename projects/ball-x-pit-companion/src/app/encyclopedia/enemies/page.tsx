'use client';

import { useState, useEffect, useMemo } from 'react';
import type { EnemyVariant } from '@/types/enemy';
import { getAllEnemyVariants } from '@/data/enemies';
import EnemyCard from '@/components/EnemyCard';
import { getAllLevels } from '@/data/levels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export default function EnemiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  const variants = getAllEnemyVariants();
  const levels = getAllLevels();

  // Prevent hydration mismatch and set all levels expanded by default
  useEffect(() => {
    setIsLoaded(true);
    // Initialize all levels as expanded on first load only
    const allLevelTypes = levels.map(level => level.type);
    setExpandedLevels(new Set(allLevelTypes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and sort enemies
  const filteredVariants = useMemo(() => {
    let filtered = [...variants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        variant =>
          variant.displayName.toLowerCase().includes(query) ||
          variant.templateName.toLowerCase().includes(query)
      );
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(variant => variant.levelType === levelFilter);
    }

    // Sort by level ID and EnemyList order
    filtered.sort((a, b) => {
      const levelA = levels.find(l => l.type === a.levelType);
      const levelB = levels.find(l => l.type === b.levelType);

      // First sort by level ID
      if (levelA && levelB && levelA.levelId !== levelB.levelId) {
        return levelA.levelId - levelB.levelId;
      }

      // Within same level, sort by EnemyList order
      if (levelA && a.levelType === b.levelType) {
        const indexA = levelA.enemySlugs.indexOf(a.templateSlug);
        const indexB = levelA.enemySlugs.indexOf(b.templateSlug);
        return indexA - indexB;
      }

      return 0;
    });

    return filtered;
  }, [variants, searchQuery, levelFilter, levels]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-lg border-2 border-primary bg-body p-4">
        <div className="space-y-4">
          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="all">Level Filter</option>
              {levels.map(level => (
                <option key={level.type} value={level.type}>
                  {level.name
                    .split(' ')
                    .map(
                      word =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enemy list */}
      <div className="space-y-6">
        {levels.map(level => {
          const levelEnemies = filteredVariants.filter(
            variant => variant.levelType === level.type
          );

          if (levelEnemies.length === 0) return null;

          const isExpanded = expandedLevels.has(level.type);

          return (
            <div key={level.type}>
              {/* Level Header */}
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedLevels);
                  if (isExpanded) {
                    newExpanded.delete(level.type);
                  } else {
                    newExpanded.add(level.type);
                  }
                  setExpandedLevels(newExpanded);
                }}
                className="mb-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-primary px-4 py-2 transition-colors hover:bg-primary/80 sm:px-6"
              >
                <h2 className="font-pixel text-2xl tracking-widest text-secondary sm:text-3xl">
                  {level.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-base tracking-widest text-secondary/70 sm:text-lg">
                    Level {level.levelId.toString().padStart(2, '0')}
                  </span>
                  <FontAwesomeIcon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    className="h-5 w-5 text-secondary"
                  />
                </div>
              </button>

              {/* Enemy Cards */}
              <div
                className={`grid grid-cols-1 gap-4 overflow-hidden transition-all duration-300 ease-in-out sm:grid-cols-2 ${
                  isExpanded
                    ? 'max-h-[10000px] scale-y-100'
                    : 'max-h-0 scale-y-0'
                }`}
                style={{ transformOrigin: 'top' }}
              >
                {levelEnemies.map((variant, index) => (
                  <EnemyCard
                    key={`${variant.templateSlug}-${variant.levelType}-${index}`}
                    variant={variant}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
