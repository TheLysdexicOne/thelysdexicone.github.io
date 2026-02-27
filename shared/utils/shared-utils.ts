/**
 * Shared utilities for all projects
 */

/**
 * Get base path for assets in production
 * Handles GitHub Pages basePath configuration
 */
export function getAssetPath(
  path: string,
  projectBasePath: string = ''
): string {
  const basePath =
    process.env.NODE_ENV === 'production' ? projectBasePath : '';
  return `${basePath}${path}`;
}

/**
 * Combine class names safely
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
