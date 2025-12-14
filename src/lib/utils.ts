import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Position } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a player qualifies for a composite position
 * CI (Corner Infield) = 1B or 3B
 * MI (Middle Infield) = 2B or SS
 * BEN (Bench) = Any player qualifies
 */
export function playerQualifiesForPosition(playerPositions: Position[], targetPosition: Position): boolean {
  // Bench position - any player qualifies
  if (targetPosition === 'BEN') {
    return true;
  }

  // Direct match
  if (playerPositions.includes(targetPosition)) {
    return true;
  }

  // Composite position checks
  if (targetPosition === 'CI') {
    return playerPositions.includes('1B') || playerPositions.includes('3B');
  }

  if (targetPosition === 'MI') {
    return playerPositions.includes('2B') || playerPositions.includes('SS');
  }

  return false;
}


