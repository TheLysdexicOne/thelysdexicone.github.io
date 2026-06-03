import type { GameConfig } from '../types';

export const conanConfig: GameConfig = {
  id: 'conan-exiles-enhanced',
  name: 'Conan Exiles Enhanced',
  description: 'Static companion for Conan lore, checklists, items, and map tools.',
  dataVersion: '1.0.0',
  stats: {
    label: 'Lore browser live · Checklists staged next',
  },
  
  homePage: {
    hero: {
      kicker: 'Conan Exiles Enhanced',
      title: 'Static companion for Conan lore now, with checklists, items, and map tools staged in sequence.',
      description:
        'The site already ships a real lore browser backed by staged Conan data from the pipeline workspace. The next major milestones are the first checklist surfaces, then the item browser, and later map-driven exploration tools.',
      stats: 'Site data version {dataVersion} · {label}',
    },
    sections: [
      {
        id: 'lore',
        label: 'Lore Browser',
        href: '/lore',
        kicker: 'Live Slice',
        description:
          'Search notes, NPC dialogue, and lorestones with unlock-aware browsing, grouping, favorites, and searchable unlock management.',
      },
      {
        id: 'items',
        label: 'Item Browser',
        href: '/items',
        kicker: 'Planned',
        description:
          'Browse craftable and non-craftable items, recipes, drop sources, map exclusivity, and future thrall modifiers.',
      },
      {
        id: 'checklists',
        label: 'Checklists',
        href: '/checklists',
        kicker: 'Staged Next',
        description:
          'Track progression-oriented checklist surfaces starting with Journey and Sorcery before the heavier map tooling arrives.',
      },
      {
        id: 'map',
        label: 'Map Tools',
        href: '/map',
        kicker: 'Wish Goal',
        description:
          'Future map layers for lore, NPCs, and resources across Exiled Lands and Isle of Siptah.',
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        kicker: 'State',
        description:
          'Centralize unlock-all, lore reset, group favorites, and crafting multiplier preferences in one place.',
      },
    ],
  },
  
  fieldGuide: {
    tabs: ['Items'],
    searchableFields: ['name', 'tags'],
    
    categoryGrid: {
      header: 'Browse by Category',
      description: 'Browse the Conan field guide by category first, then drill into each item for staged description, map availability, and source details.',
      stats: 'Data version {dataVersion} · {itemCount} staged items',
    },
    
    itemCard: {
      badges: {
        bottomRight: {
          sourceField: 'mapAvailability',
          type: 'text',
          textMap: {
            'Exiled Lands': 'EL',
            'Isle of Siptah': 'IOS',
            'Both': 'Both',
          },
          styleMap: {
            'Exiled Lands': 'border-highlight bg-highlight/20 text-highlight',
            'Isle of Siptah': 'border-secondary bg-secondary/20 text-secondary',
            'Both': 'border-primary bg-primary/20 text-primary',
          },
          style: {
            className: 'pointer-events-none absolute bottom-0 right-0 rounded border px-1 py-0.5 text-[8px] leading-none',
          },
        },
      },
      secondaryLabel: {
        condition: (item) => item.isCraftable === true,
        format: () => 'crafted',
      },
    },
  },
};
