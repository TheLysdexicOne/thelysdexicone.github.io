'use client';

import { useState, useEffect, useRef } from 'react';
import type { Ball } from '@/types/ball';
import { getImagePath } from '@/utils/basePath';

interface FusionIconProps {
  ballA: Ball;
  ballB: Ball;
  className?: string;
}

// Convert IconColorList string to RGB tuple
function parseIconColor(colorStr: string): [number, number, number] {
  const parts = colorStr.split(',').map(p => p.trim());
  const r = Math.round(parseFloat(parts[0].split(':')[1]) * 255);
  const g = Math.round(parseFloat(parts[1].split(':')[1]) * 255);
  const b = Math.round(parseFloat(parts[2].split(':')[1]) * 255);
  return [r, g, b];
}

export default function FusionIcon({
  ballA,
  ballB,
  className = 'h-16 w-16',
}: FusionIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const swapPalette = async () => {
      if (!canvasRef.current) return;

      // Parse palettes from IconColorList
      const paletteA = ballA.iconColorList?.map(parseIconColor) || [];
      const paletteB = ballB.iconColorList?.map(parseIconColor) || [];

      if (paletteA.length === 0 || paletteB.length === 0) {
        setIsLoading(false);
        return;
      }

      // Load Ball A's icon
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Cache for color lookups
        const cache = new Map<number, number>();

        // Lookup function with nearest-neighbor fallback
        const lookup = (r: number, g: number, b: number): number => {
          const key = (r << 16) | (g << 8) | b;
          if (cache.has(key)) return cache.get(key)!;

          // Try exact match first
          for (let i = 0; i < paletteA.length; i++) {
            const [pr, pg, pb] = paletteA[i];
            if (pr === r && pg === g && pb === b) {
              // Map palette A index to palette B index proportionally
              const mappedIdx = Math.floor(
                (i * paletteB.length) / paletteA.length
              );
              cache.set(key, mappedIdx);
              return mappedIdx;
            }
          }

          // Fallback to nearest color by Euclidean distance
          let best = 0;
          let bestDist = Infinity;
          for (let i = 0; i < paletteA.length; i++) {
            const [pr, pg, pb] = paletteA[i];
            const dist = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          }
          // Map palette A index to palette B index proportionally
          const mappedIdx = Math.floor(
            (best * paletteB.length) / paletteA.length
          );
          cache.set(key, mappedIdx);
          return mappedIdx;
        };

        // Swap colors for each opaque pixel
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha === 0) continue; // Skip transparent pixels

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const idx = lookup(r, g, b);
          const [nr, ng, nb] = paletteB[idx];

          data[i] = nr;
          data[i + 1] = ng;
          data[i + 2] = nb;
          // Keep original alpha
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);
        setIsLoading(false);
      };

      img.onerror = () => {
        console.error('Failed to load image:', ballA.slug);
        setIsLoading(false);
      };

      img.src = getImagePath(`/images/balls/${ballA.slug}.png`);
    };

    swapPalette();
  }, [ballA, ballB]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{
          imageRendering: 'pixelated',
          objectFit: 'contain',
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-secondary">Loading...</div>
        </div>
      )}
    </div>
  );
}
