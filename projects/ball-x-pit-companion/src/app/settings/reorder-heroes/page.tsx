'use client';

import { useState, useEffect } from 'react';
import { getAllCharacters, type Character } from '@/data/characters';
import CharacterIcon from '@/components/CharacterIcon';
import BallIcon from '@/components/BallIcon';
import { getBallBySlug } from '@/data/balls';
import { useProgressData } from '@/hooks/useProgressData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HeroItemProps {
  hero: Character;
  isDragging?: boolean;
  dragHandleProps?: any;
}

function HeroItem({
  hero,
  isDragging = false,
  dragHandleProps,
}: HeroItemProps) {
  const starterBall = hero.starterBall ? getBallBySlug(hero.starterBall) : null;

  return (
    <div
      className={`group flex items-center gap-4 rounded-lg border-2 bg-nav/70 px-2 py-2 transition-colors sm:px-5 ${
        isDragging
          ? 'border-highlight bg-nav/60 shadow-[0_0_15px_rgba(226,170,97,0.3)]'
          : 'border-primary/60 hover:border-highlight hover:bg-nav/60'
      }`}
    >
      {/* Hero Portrait */}
      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-primary/60 bg-body sm:h-20 sm:w-20">
        <CharacterIcon
          slug={hero.id}
          name={hero.name}
          type="portrait"
          className="h-full w-full"
          highlighted={isDragging}
        />
      </div>

      {/* Text Content - Desktop: Two Lines, Mobile: Starter Ball Text Only */}
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="font-pixel text-base uppercase tracking-widest text-secondary sm:text-xl">
          {hero.name}
        </span>
        {starterBall && (
          <span className="font-pixel text-xs text-primary sm:text-base sm:tracking-widest">
            {starterBall.name}
          </span>
        )}
      </div>

      {/* Ball Icon - Desktop Only */}
      {starterBall && (
        <div className="hidden h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border-2 border-primary/60 bg-body sm:flex sm:h-20 sm:w-20">
          <BallIcon
            slug={starterBall.slug}
            name={starterBall.name}
            className="h-[50px] w-[50px]"
          />
        </div>
      )}

      {/* Drag Handle */}
      <button
        type="button"
        aria-label={`Reorder ${hero.name}`}
        className="flex h-12 w-12 flex-shrink-0 cursor-grab items-center justify-center rounded-lg text-xl text-primary hover:text-secondary active:cursor-grabbing"
        {...dragHandleProps}
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </button>
    </div>
  );
}

interface SortableHeroItemProps {
  hero: Character;
  index: number;
  isDragging: boolean;
}

function SortableHeroItem({ hero, index, isDragging }: SortableHeroItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: hero.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
    style: { touchAction: 'manipulation' },
  };

  return (
    <li ref={setNodeRef} style={style}>
      <HeroItem
        hero={hero}
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
      />
    </li>
  );
}

export default function ReorderHeroesPage() {
  const { getSortedCharacters, updateCharacterOrders } = useProgressData();
  const [heroes, setHeroes] = useState<Character[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sensor setup: MouseSensor for PC (instant), TouchSensor for mobile (long-press)
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load heroes from progress data on mount and when data changes externally
  useEffect(() => {
    // Skip reloading if we're in the middle of updating (prevents overwriting our own changes)
    if (isUpdating) {
      setIsUpdating(false);
      return;
    }

    const sortedProgress = getSortedCharacters();
    const allCharacters = getAllCharacters();
    const sortedHeroes = sortedProgress
      .map(progress => allCharacters.find(c => c.id === progress.characterId))
      .filter((h): h is Character => h !== undefined);
    setHeroes(sortedHeroes);
  }, [getSortedCharacters, isUpdating]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = heroes.findIndex(item => item.id === active.id);
      const newIndex = heroes.findIndex(item => item.id === over.id);

      const newHeroes = arrayMove(heroes, oldIndex, newIndex);

      // Update state immediately
      setHeroes(newHeroes);

      // Mark that we're updating to prevent reload race condition
      setIsUpdating(true);

      // Defer the save until after render completes
      setTimeout(() => {
        const updates = newHeroes.map((hero, index) => ({
          characterId: hero.id,
          customIndex: index,
        }));
        updateCharacterOrders(updates);
      }, 0);
    }

    setActiveId(null);
  };

  const activeHero = activeId ? heroes.find(h => h.id === activeId) : null;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center justify-center">
      <div className="card-primary w-full">
        <div className="card-text-box m-0 font-pixel text-sm uppercase tracking-widest text-secondary sm:text-base">
          Drag characters up or down to change the order they appear.
        </div>
      </div>
      <div className="card-primary w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={heroes.map(h => h.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {heroes.map((hero, index) => (
                <SortableHeroItem
                  key={hero.id}
                  hero={hero}
                  index={index}
                  isDragging={activeId === hero.id}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay>
            {activeHero ? <HeroItem hero={activeHero} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
