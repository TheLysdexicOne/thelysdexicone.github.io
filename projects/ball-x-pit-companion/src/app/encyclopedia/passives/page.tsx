'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Passive } from '@/data/passives';
import {
  getAllPassives,
  getBasicPassives,
  getMergedPassives,
} from '@/data/passives';
import PassiveCard from '@/components/PassiveCard';
import PassiveIcon from '@/components/PassiveIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type FilterType = 'all' | 'basic' | 'merged';
type SortType = 'name' | 'type';
type ViewType = 'list' | 'grid';

export default function Passives() {
  // Load saved view type from localStorage, default to 'list'
  const [viewType, setViewType] = useState<ViewType>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [expandedPassiveId, setExpandedPassiveId] = useState<string | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const gridItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load saved view type after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('passives-view-type');
      if (saved === 'list' || saved === 'grid') {
        setViewType(saved);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save view type to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('passives-view-type', viewType);
    }
  }, [viewType, isLoaded]);

  // Auto-scroll to expanded passive on mobile
  useEffect(() => {
    if (expandedPassiveId && typeof window !== 'undefined') {
      const element = gridItemRefs.current[expandedPassiveId];
      if (element && window.innerWidth < 1024) {
        setTimeout(() => {
          const headerHeight = 88;
          const y =
            element.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [expandedPassiveId]);

  // Track grid columns for responsive layout
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 1280) setGridColumns(12);
        else if (width >= 1024) setGridColumns(8);
        else if (width >= 768) setGridColumns(8);
        else if (width >= 640) setGridColumns(6);
        else setGridColumns(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const filteredPassives = useMemo(() => {
    let passives: Passive[];

    switch (filter) {
      case 'basic':
        passives = getBasicPassives();
        break;
      case 'merged':
        passives = getMergedPassives();
        break;
      default:
        passives = getAllPassives();
    }

    // Apply search filter
    if (searchQuery) {
      passives = passives.filter(
        passive =>
          passive.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          passive.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sort === 'type') {
      passives = [...passives].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      passives = [...passives].sort((a, b) => a.name.localeCompare(b.name));
    }

    return passives;
  }, [filter, sort, searchQuery]);

  // Don't render until we've loaded the saved state
  if (!isLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="font-pixel text-lg tracking-wider text-secondary">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Controls Section */}
      <div className="card-primary my-4 space-y-3">
        {/* View Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setViewType('list')}
            className={`flex-1 rounded-lg px-4 py-2 font-pixel text-2xl tracking-wider transition-colors sm:text-4xl ${
              viewType === 'list'
                ? 'bg-btn-primary-highlight text-primary'
                : 'card-text-box'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`flex-1 rounded-lg px-4 py-2 font-pixel text-2xl tracking-wider transition-colors sm:text-4xl ${
              viewType === 'grid'
                ? 'bg-btn-primary-highlight text-primary'
                : 'card-text-box'
            }`}
          >
            Grid View
          </button>
        </div>

        {/* Expand/Collapse Button (hidden on lg+) */}
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="flex w-full items-center justify-between rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary transition-colors hover:border-highlight sm:text-lg lg:hidden"
        >
          <span>Search & Filters</span>
          <FontAwesomeIcon
            icon={isFiltersExpanded ? faChevronUp : faChevronDown}
            className="h-4 w-4"
          />
        </button>

        {/* Collapsible Filters Section */}
        <div
          className={`space-y-3 ${isFiltersExpanded ? 'block' : 'hidden'} lg:block`}
        >
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search passives..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base text-primary placeholder:text-primary/50 focus:border-highlight focus:ring-0 sm:text-lg"
          />

          {/* Filters Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as FilterType)}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="all">
                All Passives ({getAllPassives().length})
              </option>
              <option value="basic">Basic ({getBasicPassives().length})</option>
              <option value="merged">
                Merged ({getMergedPassives().length})
              </option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortType)}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="name">Sort: Alphabetical</option>
              <option value="type">Sort: Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-3 text-center font-pixel text-sm tracking-wider text-secondary sm:text-base">
          Found {filteredPassives.length} passive
          {filteredPassives.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* View Rendering */}
      {viewType === 'list' ? (
        <div className="space-y-4 px-2 py-2">
          {filteredPassives.map(passive => (
            <PassiveCard key={passive.id} passive={passive} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 overflow-visible">
          {(() => {
            const expandedIndex = expandedPassiveId
              ? filteredPassives.findIndex(p => p.id === expandedPassiveId)
              : -1;
            const expandedRowEnd =
              expandedIndex >= 0
                ? Math.floor(expandedIndex / gridColumns) * gridColumns +
                  gridColumns
                : -1;

            const items: JSX.Element[] = [];

            filteredPassives.forEach((passive, index) => {
              const isExpanded = expandedPassiveId === passive.id;

              // Determine position in row (left, middle, right)
              const positionInRow = index % gridColumns;
              const isLeftEdge = positionInRow === 0;
              const isRightEdge = positionInRow === gridColumns - 1;

              // Add the passive icon button
              items.push(
                <div
                  key={passive.id}
                  ref={el => {
                    gridItemRefs.current[passive.id] = el;
                  }}
                  className={isExpanded ? 'relative' : ''}
                >
                  <button
                    onClick={() =>
                      setExpandedPassiveId(isExpanded ? null : passive.id)
                    }
                    className={`z-50 flex aspect-square h-full w-full items-center justify-center rounded-lg border-2 p-1 ${
                      isExpanded
                        ? 'rounded-b-none border-highlight border-b-transparent bg-card-header shadow-lg'
                        : 'border-primary bg-body hover:border-highlight hover:bg-card-header'
                    }`}
                  >
                    <PassiveIcon
                      slug={passive.slug}
                      name={passive.name}
                      className="h-full w-full"
                    />
                  </button>
                  {isExpanded && (
                    <>
                      {/* Main extension below the cell */}
                      <div className="pointer-events-none absolute left-0 right-0 h-5 w-full -translate-y-[9px] border-x-2 border-b-2 border-highlight border-b-transparent bg-card-header" />

                      {/* Left border extension (right-edge cells only) */}
                      {isRightEdge && (
                        <div className="pointer-events-none absolute right-0 h-3 w-1/2 translate-y-[2px] border-r-2 border-highlight bg-card-header" />
                      )}

                      {/* Right border extension (left-edge cells only) */}
                      {isLeftEdge && (
                        <div className="pointer-events-none absolute left-0 h-3 w-1/2 translate-y-[2px] border-l-2 border-highlight bg-card-header" />
                      )}
                    </>
                  )}
                </div>
              );

              // If this is the end of the row containing the expanded passive, insert the details
              if (expandedRowEnd >= 0 && index === expandedRowEnd - 1) {
                const expandedPassive = filteredPassives[expandedIndex];
                items.push(
                  <div
                    key={`expanded-${expandedPassive.id}`}
                    className="col-span-full"
                  >
                    <PassiveCard
                      passive={expandedPassive}
                      disableMobileExpand={true}
                      isGridExpanded={true}
                    />
                  </div>
                );
              }
            });

            // If expanded item is on the last row and wasn't inserted yet, add it now
            if (
              expandedIndex >= 0 &&
              expandedRowEnd > filteredPassives.length
            ) {
              const expandedPassive = filteredPassives[expandedIndex];
              items.push(
                <div
                  key={`expanded-${expandedPassive.id}`}
                  className="col-span-full"
                >
                  <PassiveCard
                    passive={expandedPassive}
                    disableMobileExpand={true}
                    isGridExpanded={true}
                  />
                </div>
              );
            }

            return (
              <div
                className="grid gap-2 overflow-visible"
                style={{
                  gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                  gridAutoRows: 'auto',
                }}
              >
                {items}
              </div>
            );
          })()}
        </div>
      )}

      {filteredPassives.length === 0 && (
        <div className="card-text-box py-8">
          No passives found matching your criteria.
        </div>
      )}
    </>
  );
}
