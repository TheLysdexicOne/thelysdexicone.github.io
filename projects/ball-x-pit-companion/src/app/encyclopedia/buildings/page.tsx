'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { Building } from '@/data/buildings';
import { getAllBuildings } from '@/data/buildings';
import BuildingCard from '@/components/BuildingCard';
import BuildingIcon from '@/components/BuildingIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

type ViewType = 'list' | 'grid';
type SortType = 'name' | 'category';

export default function Buildings() {
  // Load saved view type from localStorage, default to 'list'
  const [viewType, setViewType] = useState<ViewType>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [sort, setSort] = useState<SortType>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [expandedBuildingId, setExpandedBuildingId] = useState<string | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);
  const gridItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const allBuildings = getAllBuildings();

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const cats = new Set(allBuildings.map(b => b.category));
    return Array.from(cats).sort();
  }, [allBuildings]);

  const subCategories = useMemo(() => {
    const subCats = new Set(
      allBuildings
        .filter(b => filterCategory === 'all' || b.category === filterCategory)
        .map(b => b.subCategory)
    );
    return Array.from(subCats).sort();
  }, [allBuildings, filterCategory]);

  // Load saved view type after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('buildings-view-type');
      if (saved === 'list' || saved === 'grid') {
        setViewType(saved);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save view type to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('buildings-view-type', viewType);
    }
  }, [viewType, isLoaded]);

  // Auto-scroll to expanded building on mobile
  useEffect(() => {
    if (expandedBuildingId && typeof window !== 'undefined') {
      const element = gridItemRefs.current[expandedBuildingId];
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
  }, [expandedBuildingId]);

  // Track grid columns for responsive layout
  useEffect(() => {
    const updateColumns = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 1280) setGridColumns(10);
        else if (width >= 1024) setGridColumns(8);
        else if (width >= 768) setGridColumns(6);
        else if (width >= 640) setGridColumns(5);
        else setGridColumns(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const filteredBuildings = useMemo(() => {
    let buildings = allBuildings;

    // Apply category filter
    if (filterCategory !== 'all') {
      buildings = buildings.filter(b => b.category === filterCategory);
    }

    // Apply subcategory filter
    if (filterSubCategory !== 'all') {
      buildings = buildings.filter(b => b.subCategory === filterSubCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
      buildings = buildings.filter(
        b =>
          b.name.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery) ||
          b.slug.toLowerCase().replace(/\s+/g, '').includes(normalizedQuery) ||
          b.description
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(normalizedQuery) ||
          b.shortDescription
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(normalizedQuery)
      );
    }

    // Apply sorting
    if (sort === 'category') {
      buildings = [...buildings].sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        if (a.subCategory !== b.subCategory) {
          return a.subCategory.localeCompare(b.subCategory);
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      buildings = [...buildings].sort((a, b) => a.name.localeCompare(b.name));
    }

    return buildings;
  }, [allBuildings, filterCategory, filterSubCategory, sort, searchQuery]);

  // Format category/subcategory names
  const formatCategory = (cat: string) => cat.replace(/^k/, '');
  const formatSubCategory = (subCat: string) => {
    const cleaned = subCat.replace(/^k/, '');
    return cleaned.replace(/([A-Z])/g, ' $1').trim();
  };

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
            placeholder="Search buildings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base text-primary placeholder:text-primary/50 focus:border-highlight focus:ring-0 sm:text-lg"
          />

          {/* Filters Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => {
                setFilterCategory(e.target.value);
                setFilterSubCategory('all'); // Reset subcategory when category changes
              }}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {formatCategory(cat)}
                </option>
              ))}
            </select>

            {/* SubCategory Filter */}
            <select
              value={filterSubCategory}
              onChange={e => setFilterSubCategory(e.target.value)}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="all">All Types</option>
              {subCategories.map(subCat => (
                <option key={subCat} value={subCat}>
                  {formatSubCategory(subCat)}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortType)}
              className="w-full cursor-pointer rounded-lg border-2 border-primary bg-primary px-4 py-2 text-base tracking-wider text-primary focus:border-highlight focus:ring-0 sm:text-lg"
            >
              <option value="name">Sort: Alphabetical</option>
              <option value="category">Sort: Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mb-3 text-center font-pixel text-sm tracking-wider text-secondary sm:text-base">
          Found {filteredBuildings.length} building
          {filteredBuildings.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* View Rendering */}
      {viewType === 'list' ? (
        <div className="space-y-4 px-2 py-2">
          {filteredBuildings.map(building => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 overflow-visible">
          {(() => {
            const expandedIndex = expandedBuildingId
              ? filteredBuildings.findIndex(b => b.id === expandedBuildingId)
              : -1;
            const expandedRowEnd =
              expandedIndex >= 0
                ? Math.floor(expandedIndex / gridColumns) * gridColumns +
                  gridColumns
                : -1;

            const items: JSX.Element[] = [];

            filteredBuildings.forEach((building, index) => {
              const isExpanded = expandedBuildingId === building.id;

              // Determine position in row (left, middle, right)
              const positionInRow = index % gridColumns;
              const isLeftEdge = positionInRow === 0;
              const isRightEdge = positionInRow === gridColumns - 1;

              // Add the building icon button
              items.push(
                <div
                  key={building.id}
                  ref={el => {
                    gridItemRefs.current[building.id] = el;
                  }}
                  className={isExpanded ? 'relative' : ''}
                >
                  <button
                    onClick={() =>
                      setExpandedBuildingId(isExpanded ? null : building.id)
                    }
                    className={`z-50 flex aspect-square h-full w-full items-center justify-center rounded-lg border-2 p-1 ${
                      isExpanded
                        ? 'rounded-b-none border-highlight border-b-transparent bg-card-header shadow-lg'
                        : 'border-primary bg-body hover:border-highlight hover:bg-card-header'
                    }`}
                  >
                    <BuildingIcon
                      slug={building.slug}
                      name={building.name}
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

              // If this is the end of the row containing the expanded building, insert the details
              if (expandedRowEnd >= 0 && index === expandedRowEnd - 1) {
                const expandedBuilding = filteredBuildings[expandedIndex];
                items.push(
                  <div
                    key={`expanded-${expandedBuilding.id}`}
                    className="col-span-full"
                  >
                    <BuildingCard
                      building={expandedBuilding}
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
              expandedRowEnd > filteredBuildings.length
            ) {
              const expandedBuilding = filteredBuildings[expandedIndex];
              items.push(
                <div
                  key={`expanded-${expandedBuilding.id}`}
                  className="col-span-full"
                >
                  <BuildingCard
                    building={expandedBuilding}
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

      {filteredBuildings.length === 0 && (
        <div className="card-text-box py-8">
          No buildings found matching your criteria.
        </div>
      )}
    </>
  );
}
