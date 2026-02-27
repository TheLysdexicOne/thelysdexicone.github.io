/**
 * Get the base path for assets based on environment
 * In production (GitHub Pages), includes the repo name
 * In development, returns empty string
 */
export const getBasePath = (): string => {
  return process.env.NODE_ENV === 'production' ? '/ball-x-pit-companion' : '';
};

/**
 * Get the full path for an image asset
 * @param path - Path to the image starting with /images/
 */
export const getImagePath = (path: string): string => {
  return `${getBasePath()}${path}`;
};
