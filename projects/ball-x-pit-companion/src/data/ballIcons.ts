// Ball icon spritesheet utilities

import ballIconMapping from '../../data/ball_icon_mapping.json';

const ICON_SIZE = 50;
const SPRITE_COLUMNS = 10;

export interface SpritePosition {
  x: number;
  y: number;
}

/**
 * Get the sprite position for a ball slug
 */
export function getBallSpritePosition(slug: string): SpritePosition | null {
  const frameIndex = ballIconMapping[slug as keyof typeof ballIconMapping];

  if (frameIndex === undefined) {
    return null;
  }

  return {
    x: (frameIndex % SPRITE_COLUMNS) * ICON_SIZE,
    y: Math.floor(frameIndex / SPRITE_COLUMNS) * ICON_SIZE,
  };
}

/**
 * Get CSS background-position string for a ball
 */
export function getBallIconStyle(slug: string, scale: number = 1): React.CSSProperties | null {
  const position = getBallSpritePosition(slug);

  if (!position) {
    return null;
  }

  return {
    backgroundImage: 'url(/images/balls.png)',
    backgroundPosition: `-${position.x * scale}px -${position.y * scale}px`,
    backgroundSize: `${500 * scale}px ${300 * scale}px`,
    width: `${50 * scale}px`,
    height: `${50 * scale}px`,
    imageRendering: 'pixelated',
  };
}
