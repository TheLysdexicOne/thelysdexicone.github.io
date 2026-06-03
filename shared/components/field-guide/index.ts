/**
 * Shared field-guide components for all game projects.
 * 
 * These components provide the structural primitives for item browsers,
 * bestiaries, and other field-guide interfaces. Game-specific logic (icons,
 * badges, metadata) is provided via props or render functions.
 */

export { default as FieldGuideLayout } from "./field-guide-layout";
export type { FieldGuideSection, FieldGuideLayoutProps } from "./field-guide-layout";

export { default as CategoryGrid } from "./category-grid";
export { default as ItemGrid } from "./item-grid";

export { EmptyState, LoadingState, ErrorState } from "./field-guide-states";

export { default as IconTile } from "./icon-tile";
