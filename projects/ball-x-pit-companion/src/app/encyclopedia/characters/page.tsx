'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getAllCharacters, Character } from '@/data/characters';
import CharacterCard from '@/components/CharacterCard';
import { useProgressData } from '@/hooks/useProgressData';

export default function CharactersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { getSortedCharacters } = useProgressData();
  const characters = getAllCharacters();

  // Prevent hydration mismatch
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Filter and sort characters
  const filteredCharacters = useMemo(() => {
    let filtered = [...characters];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        char =>
          char.name.toLowerCase().includes(query) ||
          char.flavorDescription.toLowerCase().includes(query) ||
          char.gameplayDescription.toLowerCase().includes(query)
      );
    }

    // Sort by custom order from progression data
    const sortedCharacters = getSortedCharacters();
    const characterOrderMap = new Map(
      sortedCharacters.map((char, index) => [char.characterId, index])
    );
    filtered.sort((a, b) => {
      const aIndex = characterOrderMap.get(a.id) ?? 999;
      const bIndex = characterOrderMap.get(b.id) ?? 999;
      return aIndex - bIndex;
    });

    return filtered;
  }, [characters, searchQuery, getSortedCharacters]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="rounded-lg border-2 border-primary bg-body p-4">
        {/* Filters content */}
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search characters..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base text-primary placeholder:text-primary/50 focus:border-highlight focus:ring-0 sm:text-lg"
            />
          </div>
          {/* Reorder Button */}
          <Link
            href="/settings/reorder-heroes"
            className="block rounded-lg bg-btn-primary px-4 py-2 text-center text-base text-secondary transition-colors hover:bg-highlight hover:text-primary sm:text-lg"
          >
            Reorder Characters
          </Link>
        </div>
      </div>
      {/* Character list */}
      <div className="space-y-4">
        {filteredCharacters.map(character => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
      {/* No results message */}
      {filteredCharacters.length === 0 && (
        <div className="rounded-lg border-2 border-primary bg-body p-8 text-center">
          <p className="font-pixel text-lg tracking-wider text-primary">
            No characters found
          </p>
          <p className="mt-2 font-pixel text-sm text-primary/70">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
