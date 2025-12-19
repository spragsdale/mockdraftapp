import type { Player } from '@/types';

/**
 * Normalize a player name for matching
 * Removes extra spaces, converts to lowercase, removes common suffixes
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\s+(jr\.?|sr\.?|ii|iii|iv)$/i, '') // Remove suffixes
    .replace(/\./g, '') // Remove periods
    .replace(/'/g, ''); // Remove apostrophes
}

/**
 * Extract first and last name from a full name
 */
function extractNames(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first: '', last: parts[0] };
  }
  return {
    first: parts[0],
    last: parts[parts.length - 1],
  };
}

/**
 * Check if two names match (handles middle initial variations)
 */
function namesMatch(name1: string, name2: string): boolean {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  // Exact match after normalization
  if (norm1 === norm2) return true;

  const names1 = extractNames(name1);
  const names2 = extractNames(name2);

  // Match on first and last name only (ignoring middle names/initials)
  if (names1.first && names2.first && names1.last && names2.last) {
    const firstMatch = normalizeName(names1.first) === normalizeName(names2.first);
    const lastMatch = normalizeName(names1.last) === normalizeName(names2.last);
    if (firstMatch && lastMatch) return true;
  }

  // Match on last name only if first names are single letters (initials)
  if (names1.last && names2.last) {
    const lastMatch = normalizeName(names1.last) === normalizeName(names2.last);
    const first1Norm = normalizeName(names1.first);
    const first2Norm = normalizeName(names2.first);
    if (
      lastMatch &&
      ((first1Norm.length <= 1 && first2Norm.length <= 1) ||
        (first1Norm.length <= 1 && names2.first.length > 1) ||
        (names1.first.length > 1 && first2Norm.length <= 1))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Fuzzy match a player name against existing players
 * Returns the best matching player or null if no match found
 */
export function fuzzyMatchPlayerName(csvName: string, existingPlayers: Player[]): Player | null {
  if (!csvName || csvName.trim().length === 0) return null;

  // Try exact match first (case-insensitive)
  const exactMatch = existingPlayers.find((p) => p.name.toLowerCase() === csvName.toLowerCase());
  if (exactMatch) return exactMatch;

  // Try normalized match
  const normalizedMatch = existingPlayers.find((p) => normalizeName(p.name) === normalizeName(csvName));
  if (normalizedMatch) return normalizedMatch;

  // Try fuzzy matching (handles middle initials, suffixes)
  const fuzzyMatch = existingPlayers.find((p) => namesMatch(p.name, csvName));
  if (fuzzyMatch) return fuzzyMatch;

  return null;
}

