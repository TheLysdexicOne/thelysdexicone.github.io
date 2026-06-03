import type { GameConfig } from '../types';

export const icarusConfig: GameConfig = {
  id: 'icarus',
  name: 'Icarus Companion',
  description: 'An offline-friendly companion built from ripped game data.',
  dataVersion: '1.0.0',
  stats: {
    itemCount: 1845,
    label: 'craftable items',
  },
  
  homePage: {
    hero: {
      title: 'Icarus Companion',
      description: 
        'An offline-friendly companion built from ripped game data. Look up how to craft any item, trace ingredient chains, or plan the fastest path through the tech tiers.',
      stats: 'Data version {dataVersion} · {itemCount} {label}',
    },
    sections: [
      {
        id: 'field-guide',
        label: 'Field Guide',
        href: '/field-guide/items',
        description:
          'Browse 1,600+ craftable items by category. Look up recipes, ingredients, required stations, and interactive crafting workflow graphs.',
        cta: 'Open Field Guide →',
      },
      {
        id: 'progression',
        label: 'Tier Progression Guide',
        href: '/progression',
        description:
          'Find the fastest path to Tier 2, 3, and 4. See which crafting benches unlock each tier and what to prioritise first.',
        cta: 'View Guide →',
      },
    ],
  },
  
  fieldGuide: {
    tabs: ['Items', 'Bestiary', 'Fishing'],
    searchableFields: ['displayName', 'description', 'tags'],
    
    categoryGrid: {
      header: 'Browse by Category',
    },
    
    itemCard: {
      badges: {
        topLeft: {
          sourceField: 'requiredFeatureLevel',
          type: 'icon',
          iconMap: {
            NewFrontiers: '/icarus/game-assets/Assets/2DArt/UI/Icons/T_FeatureLevelIcon_NewFrontiers3.webp',
            GreatHunts: '/icarus/game-assets/Assets/2DArt/UI/Icons/FeatureLevel/T_FeatureLevel_GH.webp',
            DangerousHorizons: '/icarus/game-assets/Assets/2DArt/UI/Icons/FeatureLevel/T_FeatureLevel_DH.webp',
          },
          style: {
            className: 'pointer-events-none absolute left-0 top-0 h-3 w-3 object-contain brightness-0 invert md:h-4 md:w-4 xl:h-5 xl:w-5',
          },
        },
        bottomLeft: {
          sourceField: 'cosmeticPack|requiredFeatureLevel',
          type: 'icon',
          iconMap: {
            // Cosmetic packs
            ArtDeco: '/icarus/game-assets/Assets/2DArt/UI/Icons/T_ICON_Money_Symbol_Double.webp',
            Industrial: '/icarus/game-assets/Assets/2DArt/UI/Icons/T_ICON_Money_Symbol_Double.webp',
            Interior: '/icarus/game-assets/Assets/2DArt/UI/Icons/T_ICON_Money_Symbol_Double.webp',
            // Feature-level packs
            Homestead: '/icarus/game-assets/Assets/2DArt/UI/Icons/T_Icon_Homestead.webp',
            Laika: '/icarus/game-assets/Assets/2DArt/UI/Icons/T_ICON_Paws.webp',
          },
          style: {
            containerClassName: 'absolute bottom-0 left-0 border border-[#f1ad1c] bg-[#191919] p-px',
            iconClassName: 'h-3 w-3 object-contain md:h-4 md:w-4 xl:h-5 xl:w-5',
          },
        },
      },
      borderHighlight: {
        condition: (item) => item.cosmeticPack === 'Workshop',
      },
      secondaryLabel: {
        condition: (item) => item.recipeCount && item.recipeCount > 1,
        format: (item) => `${item.recipeCount}×`,
      },
    },
  },
};
