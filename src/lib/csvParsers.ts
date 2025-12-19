import Papa from 'papaparse';
import type { Position } from '@/types';

/**
 * Parse a numeric value from CSV, handling empty strings and invalid values
 */
function parseNumeric(value: string | undefined | null): number | null {
  if (!value || value.trim() === '' || value === '-' || value === 'N/A') {
    return null;
  }
  const parsed = parseFloat(value.toString().replace(/,/g, ''));
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse positions from POS column (handles formats like "OF", "1B,OF", "SP/RP")
 */
function parsePositions(posString: string | undefined | null): Position[] {
  if (!posString || posString.trim() === '') {
    return [];
  }

  const validPositions: Position[] = ['C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP', 'UTIL', 'CI', 'MI', 'BEN'];

  // Split by comma, slash, or space
  const positions = posString
    .split(/[,/\s]+/)
    .map((p) => p.trim().toUpperCase())
    .filter((p) => p.length > 0)
    .filter((p) => validPositions.includes(p as Position)) as Position[];

  return positions;
}

/**
 * Find column index by name (case-insensitive)
 */
function findColumn(header: string[], columnName: string): number {
  const lowerName = columnName.toLowerCase();
  return header.findIndex((h) => h.toLowerCase() === lowerName);
}

/**
 * Get column value from row, handling case-insensitive matching
 */
function getColumnValue(row: any, header: string[], columnName: string): string | null {
  const index = findColumn(header, columnName);
  if (index === -1) return null;
  const value = row[header[index]];
  return value !== undefined && value !== null ? String(value).trim() : null;
}

export interface ParsedHitterProjection {
  name: string;
  team: string | null;
  g: number | null;
  pa: number | null;
  ab: number | null;
  h: number | null;
  doubles: number | null;
  triples: number | null;
  hr: number | null;
  runs: number | null;
  rbi: number | null;
  bb: number | null;
  so: number | null;
  hbp: number | null;
  sb: number | null;
  cs: number | null;
  avg: number | null;
  obp: number | null;
  slg: number | null;
  ops: number | null;
  woba: number | null;
  wrc_plus: number | null;
  bsr: number | null;
  fld: number | null;
  off: number | null;
  def: number | null;
  war: number | null;
  adp: number | null;
}

export interface ParsedPitcherProjection {
  name: string;
  team: string | null;
  gs: number | null;
  g: number | null;
  ip: number | null;
  w: number | null;
  l: number | null;
  qs: number | null;
  sv: number | null;
  hld: number | null;
  h: number | null;
  er: number | null;
  hr: number | null;
  so: number | null;
  bb: number | null;
  whip: number | null;
  k_per_9: number | null;
  bb_per_9: number | null;
  era: number | null;
  fip: number | null;
  war: number | null;
  ra9_war: number | null;
  adp: number | null;
}

export interface ParsedAuctionValue {
  name: string;
  team: string | null;
  positions: Position[];
  adp: number | null;
  auction_value: number | null;
}

/**
 * Parse Hitter Projections CSV
 * Expected columns: Name, Team, G, PA, AB, H, 2B, 3B, HR, R, RBI, BB, SO, HBP, SB, CS, AVG, OBP, SLG, OPS, wOBA, wRC+, BsR, Fld, Off, Def, WAR, ADP
 */
export function parseHitterProjections(csvText: string): ParsedHitterProjection[] {
  const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const header = results.meta.fields || [];
  const data: ParsedHitterProjection[] = [];

  for (const row of results.data as any[]) {
    const name = getColumnValue(row, header, 'Name');
    if (!name) continue; // Skip rows without a name

    data.push({
      name,
      team: getColumnValue(row, header, 'Team'),
      g: parseNumeric(getColumnValue(row, header, 'G')),
      pa: parseNumeric(getColumnValue(row, header, 'PA')),
      ab: parseNumeric(getColumnValue(row, header, 'AB')),
      h: parseNumeric(getColumnValue(row, header, 'H')),
      doubles: parseNumeric(getColumnValue(row, header, '2B')),
      triples: parseNumeric(getColumnValue(row, header, '3B')),
      hr: parseNumeric(getColumnValue(row, header, 'HR')),
      runs: parseNumeric(getColumnValue(row, header, 'R')),
      rbi: parseNumeric(getColumnValue(row, header, 'RBI')),
      bb: parseNumeric(getColumnValue(row, header, 'BB')),
      so: parseNumeric(getColumnValue(row, header, 'SO')),
      hbp: parseNumeric(getColumnValue(row, header, 'HBP')),
      sb: parseNumeric(getColumnValue(row, header, 'SB')),
      cs: parseNumeric(getColumnValue(row, header, 'CS')),
      avg: parseNumeric(getColumnValue(row, header, 'AVG')),
      obp: parseNumeric(getColumnValue(row, header, 'OBP')),
      slg: parseNumeric(getColumnValue(row, header, 'SLG')),
      ops: parseNumeric(getColumnValue(row, header, 'OPS')),
      woba: parseNumeric(getColumnValue(row, header, 'wOBA')),
      wrc_plus: parseNumeric(getColumnValue(row, header, 'wRC+')),
      bsr: parseNumeric(getColumnValue(row, header, 'BsR')),
      fld: parseNumeric(getColumnValue(row, header, 'Fld')),
      off: parseNumeric(getColumnValue(row, header, 'Off')),
      def: parseNumeric(getColumnValue(row, header, 'Def')),
      war: parseNumeric(getColumnValue(row, header, 'WAR')),
      adp: parseNumeric(getColumnValue(row, header, 'ADP')),
    });
  }

  return data;
}

/**
 * Parse Pitcher Projections CSV
 * Expected columns: Name, Team, GS, G, IP, W, L, QS, SV, HLD, H, ER, HR, SO, BB, WHIP, K/9, BB/9, ERA, FIP, WAR, RA9-WAR, ADP
 */
export function parsePitcherProjections(csvText: string): ParsedPitcherProjection[] {
  const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const header = results.meta.fields || [];
  const data: ParsedPitcherProjection[] = [];

  for (const row of results.data as any[]) {
    const name = getColumnValue(row, header, 'Name');
    if (!name) continue; // Skip rows without a name

    data.push({
      name,
      team: getColumnValue(row, header, 'Team'),
      gs: parseNumeric(getColumnValue(row, header, 'GS')),
      g: parseNumeric(getColumnValue(row, header, 'G')),
      ip: parseNumeric(getColumnValue(row, header, 'IP')),
      w: parseNumeric(getColumnValue(row, header, 'W')),
      l: parseNumeric(getColumnValue(row, header, 'L')),
      qs: parseNumeric(getColumnValue(row, header, 'QS')),
      sv: parseNumeric(getColumnValue(row, header, 'SV')),
      hld: parseNumeric(getColumnValue(row, header, 'HLD')),
      h: parseNumeric(getColumnValue(row, header, 'H')),
      er: parseNumeric(getColumnValue(row, header, 'ER')),
      hr: parseNumeric(getColumnValue(row, header, 'HR')),
      so: parseNumeric(getColumnValue(row, header, 'SO')),
      bb: parseNumeric(getColumnValue(row, header, 'BB')),
      whip: parseNumeric(getColumnValue(row, header, 'WHIP')),
      k_per_9: parseNumeric(getColumnValue(row, header, 'K/9')),
      bb_per_9: parseNumeric(getColumnValue(row, header, 'BB/9')),
      era: parseNumeric(getColumnValue(row, header, 'ERA')),
      fip: parseNumeric(getColumnValue(row, header, 'FIP')),
      war: parseNumeric(getColumnValue(row, header, 'WAR')),
      ra9_war: parseNumeric(getColumnValue(row, header, 'RA9-WAR')),
      adp: parseNumeric(getColumnValue(row, header, 'ADP')),
    });
  }

  return data;
}

/**
 * Parse Auction Values CSV
 * Expected columns: Name, Team, POS, ADP, Dollars
 */
export function parseAuctionValues(csvText: string): ParsedAuctionValue[] {
  const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const header = results.meta.fields || [];
  const data: ParsedAuctionValue[] = [];

  for (const row of results.data as any[]) {
    const name = getColumnValue(row, header, 'Name');
    if (!name) continue; // Skip rows without a name

    const posString = getColumnValue(row, header, 'POS');
    const positions = parsePositions(posString);

    data.push({
      name,
      team: getColumnValue(row, header, 'Team'),
      positions,
      adp: parseNumeric(getColumnValue(row, header, 'ADP')),
      auction_value: parseNumeric(getColumnValue(row, header, 'Dollars')),
    });
  }

  return data;
}

