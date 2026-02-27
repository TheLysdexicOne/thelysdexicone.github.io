/**
 * Shared theme configuration for all projects
 * Each project can override colors while using the same base structure
 */

export type ThemeVariant = 'default' | 'custom';

export interface ThemeConfig {
  name: string;
  colors: {
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      main: string;
      body: string;
      nav: string;
      card: string;
    };
    buttons: {
      primary: string;
      hover: string;
    };
    borders: {
      primary: string;
      secondary: string;
    };
  };
}

/**
 * Default theme for all projects
 * Warm, earthy tones with amber highlights
 */
export const defaultTheme: ThemeConfig = {
  name: 'default',
  colors: {
    text: {
      primary: '#f6eade',
      secondary: '#dabda1',
    },
    background: {
      main: '#0f0a09',
      body: '#292627',
      nav: '#1c1512',
      card: '#292627',
    },
    buttons: {
      primary: '#1c1512',
      hover: '#3b3129',
    },
    borders: {
      primary: '#8b5a2b',
      secondary: '#704214',
    },
  },
};

/**
 * Get theme for a specific project
 * Can be extended to support per-project theme overrides
 */
export function getThemeForProject(projectId: string): ThemeConfig {
  // Future: Map projectId to custom theme variants
  // All projects currently use the default theme
  return defaultTheme;
}
