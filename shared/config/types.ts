/**
 * Shared type definitions for game configurations.
 * 
 * These types govern home page content, field guide behavior, and other
 * game-specific settings. All configs should conform to these contracts.
 */

// ── Home Page Types ──────────────────────────────────────────────────────

export type GameHomeSection = {
  /** Unique identifier for this section */
  id: string;
  /** Display label (e.g., "Field Guide", "Lore Browser") */
  label: string;
  /** Navigation href */
  href: string;
  /** Description text */
  description: string;
  /** Optional status kicker (e.g., "Live", "Planned") */
  kicker?: string;
  /** Optional CTA text (defaults to "Open →") */
  cta?: string;
};

export type GameHomeHero = {
  /** Optional eyebrow text above title */
  kicker?: string;
  /** Main title */
  title: string;
  /** Hero description */
  description: string;
  /** Footer stats line (e.g., "Data version 1.0.0 · 1,845 items") */
  stats?: string;
};

export type GameHomePage = {
  hero: GameHomeHero;
  sections: GameHomeSection[];
  /** Optional additional content sections (game-specific) */
  additionalSections?: React.ReactNode;
};

// ── Field Guide Types ────────────────────────────────────────────────────

export type BadgePosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export type BadgeConfig = {
  /** Source field from item data (e.g., 'requiredFeatureLevel', 'mapAvailability') */
  sourceField: string;
  /** Badge rendering type */
  type: 'icon' | 'text';
  /** Icon URL mapping (for type: 'icon') */
  iconMap?: Record<string, string>;
  /** Text display mapping (for type: 'text') */
  textMap?: Record<string, string>;
  /** Style class mapping by value (for type: 'text') */
  styleMap?: Record<string, string>;
  /** Fixed styling */
  style?: {
    className?: string;
    containerClassName?: string;
    iconClassName?: string;
  };
};

export type ItemCardConfig = {
  /** Badge configurations by position */
  badges?: Partial<Record<BadgePosition, BadgeConfig>>;
  /** Border highlight function */
  borderHighlight?: {
    condition: (item: any) => boolean;
  };
  /** Secondary label (e.g., "crafted", "3×") */
  secondaryLabel?: {
    condition: (item: any) => boolean;
    format: (item: any) => string;
  };
};

export type CategoryGridConfig = {
  /** Optional header text above grid */
  header?: string;
  /** Optional description below header */
  description?: string;
  /** Optional stats footer (with template variables) */
  stats?: string;
};

export type FieldGuideConfig = {
  /** Section tabs (e.g., ["Items", "Bestiary", "Fishing"]) */
  tabs?: string[];
  /** Searchable fields from item data */
  searchableFields?: string[];
  /** Category grid config */
  categoryGrid?: CategoryGridConfig;
  /** Item card visual config */
  itemCard?: ItemCardConfig;
  /** Item detail panel field config */
  itemDetail?: {
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'badge' | 'list';
    }>;
  };
};

// ── Root Game Config ─────────────────────────────────────────────────────

export type GameConfig = {
  /** Unique game identifier (slug) */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Data version string */
  dataVersion: string;
  /** Stats metadata */
  stats?: {
    itemCount?: number;
    label?: string;
  };
  /** Home page content */
  homePage: GameHomePage;
  /** Field guide configuration (optional) */
  fieldGuide?: FieldGuideConfig;
};
