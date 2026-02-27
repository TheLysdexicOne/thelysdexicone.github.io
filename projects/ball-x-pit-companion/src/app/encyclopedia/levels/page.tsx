'use client';

import { useState, useEffect } from 'react';
import type { Level } from '@/types/level';
import { getAllLevels } from '@/data/levels';
import LevelCard from '@/components/LevelCard';
import { getEnemyVariantsForLevel } from '@/data/enemies';

export default function LevelsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const levels = getAllLevels();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Level list */}
      <div className="space-y-4">
        {levels.map(level => {
          const enemies = getEnemyVariantsForLevel(level);
          return <LevelCard key={level.id} level={level} enemies={enemies} />;
        })}
      </div>
    </div>
  );
}
