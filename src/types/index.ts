// Player types
export type Position = 'C' | '1B' | '2B' | 'SS' | '3B' | 'OF' | 'SP' | 'RP' | 'UTIL' | 'CI' | 'MI' | 'BEN';

export interface Player {
  id: string;
  name: string;
  positions: Position[];
  adp: number | null;
  auction_value: number | null;
  tier: number | null;
  team?: string;
  // Hitter stats
  g?: number | null;
  pa?: number | null;
  ab?: number | null;
  h?: number | null;
  doubles?: number | null;
  triples?: number | null;
  runs?: number | null;
  rbi?: number | null;
  bb?: number | null;
  so?: number | null;
  hbp?: number | null;
  cs?: number | null;
  avg?: number | null;
  obp?: number | null;
  slg?: number | null;
  ops?: number | null;
  woba?: number | null;
  wrc_plus?: number | null;
  bsr?: number | null;
  fld?: number | null;
  off?: number | null;
  def?: number | null;
  war?: number | null;
  // Pitcher stats
  gs?: number | null;
  ip?: number | null;
  w?: number | null;
  l?: number | null;
  qs?: number | null;
  sv?: number | null;
  hld?: number | null;
  er?: number | null;
  whip?: number | null;
  k_per_9?: number | null;
  bb_per_9?: number | null;
  era?: number | null;
  fip?: number | null;
  ra9_war?: number | null;
  created_at?: string;
  updated_at?: string;
}

// League types
export interface PositionalRequirement {
  position: Position;
  required: number;
}

export interface ScoringCategories {
  hitters: string[];
  pitchers: string[];
}

export interface League {
  id: string;
  name: string;
  positional_requirements: PositionalRequirement[];
  number_of_teams: number;
  roster_size: number;
  scoring_categories?: ScoringCategories;
  created_at?: string;
  updated_at?: string;
}

// Draft types
export type DraftStatus = 'setup' | 'in_progress' | 'completed';

export interface Draft {
  id: string;
  league_id: string;
  name: string;
  status: DraftStatus;
  current_pick: number;
  draft_order: string[]; // Array of team IDs in draft order
  created_at?: string;
  updated_at?: string;
}

// Team types
export interface Team {
  id: string;
  draft_id: string;
  name: string;
  is_user_team: boolean;
  created_at?: string;
}

// Keeper types
export interface Keeper {
  id: string;
  draft_id: string;
  team_id: string;
  player_id: string;
  draft_slot: number; // Which pick number this keeper occupies
  created_at?: string;
}

// Draft Pick types
export interface DraftPick {
  id: string;
  draft_id: string;
  team_id: string;
  player_id: string;
  pick_number: number;
  slot: number; // Position slot on roster (1, 2, 3, etc.)
  created_at?: string;
}

// Draft Plan types
export interface DraftPlan {
  id: string;
  draft_id: string;
  pick_number: number;
  planned_position: Position | null;
  notes?: string;
  created_at?: string;
}

// Roster types
export interface RosterSlot {
  position: Position;
  player: Player | null;
  slot_number: number;
}

export interface TeamRoster {
  team_id: string;
  team_name: string;
  slots: RosterSlot[];
}

// Draft state types
export interface DraftState {
  draft: Draft;
  teams: Team[];
  picks: DraftPick[];
  availablePlayers: Player[];
  userTeamId: string | null;
}

// Import types
export type ImportType = 'hitter_projections' | 'pitcher_projections' | 'auction_values';

export interface ImportHistory {
  id: string;
  import_type: ImportType;
  filename: string;
  uploaded_at: string;
  rows_processed?: number | null;
  rows_successful?: number | null;
}


