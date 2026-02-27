'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Ball } from '@/types/ball';
import { getAllBalls, getBasicBalls, getFusionBalls } from '@/data/balls';
import BallsCard from '@/components/BallsCard';
import BallIcon from '@/components/BallIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type FilterType = 'all' | 'basic' | 'fusion';
type SortType = 'name' | 'encyclopedia';
type ViewType = 'list' | 'grid';

export default function Balls() {
  // Load saved view type from localStorage, default to 'list'
  const [viewType, setViewType] = useState<ViewType>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('encyclopedia');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [expandedBallId, setExpandedBallId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const gridItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load saved view type after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('balls-view-type');
      if (saved === 'list' || saved === 'grid') {
        setViewType(saved);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save view type to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('balls-view-type', viewType);
    }
  }, [viewType, isLoaded]);

  // Auto-scroll to expanded ball on mobile
  useEffect(() => {
    if (expandedBallId && typeof window !== 'undefined') {
      const element = gridItemRefs.current[expandedBallId];
      if (element && window.innerWidth < 1024) {
        // Only scroll on mobile/tablet (< lg breakpoint)
        setTimeout(() => {
          const headerHeight = 88; // pt-20 = 5rem = 80px
          const y =
            element.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }, 100); // Small delay to allow content to render
      }
    }
  }, [expandedBallId]);

  // Track grid columns for responsive layout
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 1280)
          setGridColumns(8); // xl
        else if (width >= 1024)
          setGridColumns(6); // lg
        else if (width >= 768)
          setGridColumns(6); // md
        else if (width >= 640)
          setGridColumns(5); // sm
        else setGridColumns(4); // mobile
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const filteredBalls = useMemo(() => {
    let balls: Ball[];

    switch (filter) {
      case 'basic':
        balls = getBasicBalls();
        break;
      case 'fusion':
        balls = getFusionBalls();
        break;
      default:
        balls = getAllBalls();
    }

    // Apply search filter (fuzzy search: removes spaces and checks name, slug, description)
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
      balls = balls.filter(ball => {
        const normalizedName = ball.name.toLowerCase().replace(/\s+/g, '');
        const normalizedSlug = ball.slug.toLowerCase().replace(/\s+/g, '');
        const normalizedDesc = ball.description
          .toLowerCase()
          .replace(/\s+/g, '');

        return (
          normalizedName.includes(normalizedQuery) ||
          normalizedSlug.includes(normalizedQuery) ||
          normalizedDesc.includes(normalizedQuery)
        );
      });
    }

    // Apply sorting
    if (sort === 'encyclopedia') {
      // Sort by recipe length (0 = base, 1 = 2-ball fusion, 2+ = 3+ ball fusion), then alphabetically
      balls = [...balls].sort((a, b) => {
        const aRecipeLength =
          a.fusionRecipe.length > 0 ? a.fusionRecipe[0].length : 0;
        const bRecipeLength =
          b.fusionRecipe.length > 0 ? b.fusionRecipe[0].length : 0;

        if (aRecipeLength !== bRecipeLength) {
          return aRecipeLength - bRecipeLength;
        }

        return a.name.localeCompare(b.name);
      });
    } else {
      // Sort by name only
      balls = [...balls].sort((a, b) => a.name.localeCompare(b.name));
    }

    return balls;
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
            placeholder="Search balls..."
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
              <option value="all">All Balls ({getAllBalls().length})</option>
              <option value="basic">Basic ({getBasicBalls().length})</option>
              <option value="fusion">Fusion ({getFusionBalls().length})</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortType)}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="encyclopedia">Sort: Encyclopedia</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-3 text-center font-pixel text-sm tracking-wider text-secondary sm:text-base">
          Found {filteredBalls.length} ball
          {filteredBalls.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* View Rendering */}
      {viewType === 'list' ? (
        <div className="space-y-4 px-2 py-2">
          {filteredBalls.map(ball => (
            <BallsCard key={ball.id} ball={ball} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 overflow-visible">
          {(() => {
            const expandedIndex = expandedBallId
              ? filteredBalls.findIndex(b => b.id === expandedBallId)
              : -1;
            const expandedRowEnd =
              expandedIndex >= 0
                ? Math.floor(expandedIndex / gridColumns) * gridColumns +
                  gridColumns
                : -1;

            const items: JSX.Element[] = [];

            filteredBalls.forEach((ball, index) => {
              const isExpanded = expandedBallId === ball.id;

              // Determine position in row (left, middle, right)
              const positionInRow = index % gridColumns;
              const isLeftEdge = positionInRow === 0;
              const isRightEdge = positionInRow === gridColumns - 1;

              // Add the ball icon button
              items.push(
                <div
                  key={ball.id}
                  ref={el => {
                    gridItemRefs.current[ball.id] = el;
                  }}
                  className={isExpanded ? 'relative' : ''}
                >
                  <button
                    onClick={() =>
                      setExpandedBallId(isExpanded ? null : ball.id)
                    }
                    className={`z-50 flex aspect-square h-full w-full items-center justify-center rounded-lg border-2 p-1 ${
                      isExpanded
                        ? 'rounded-b-none border-highlight border-b-transparent bg-card-header shadow-lg'
                        : 'border-primary bg-body hover:border-highlight hover:bg-card-header'
                    }`}
                  >
                    <BallIcon
                      slug={ball.slug}
                      name={ball.name}
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

              // If this is the end of the row containing the expanded ball, insert the details
              if (expandedRowEnd >= 0 && index === expandedRowEnd - 1) {
                const expandedBall = filteredBalls[expandedIndex];
                items.push(
                  <div
                    key={`expanded-${expandedBall.id}`}
                    className="col-span-full"
                  >
                    <BallsCard
                      ball={expandedBall}
                      disableMobileExpand={true}
                      isGridExpanded={true}
                    />
                  </div>
                );
              }
            });

            // If expanded item is on the last row and wasn't inserted yet, add it now
            if (expandedIndex >= 0 && expandedRowEnd > filteredBalls.length) {
              const expandedBall = filteredBalls[expandedIndex];
              items.push(
                <div
                  key={`expanded-${expandedBall.id}`}
                  className="col-span-full"
                >
                  <BallsCard
                    ball={expandedBall}
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

      {filteredBalls.length === 0 && (
        <div className="card-text-box py-8">
          No balls found matching your criteria.
        </div>
      )}
    </>
  );
}
