export interface Player {
  id: string;
  name: string;
  positions: string[];
  team: string;
  adp: number;
  isOhtani?: boolean;
}

export interface HittingProjections {
  playerId: string;
  avg?: number;
  hr?: number;
  rbi?: number;
  runs?: number;
  sb?: number;
  obp?: number;
  slg?: number;
  ops?: number;
  // Add other hitting categories as needed
}

export interface PitchingProjections {
  playerId: string;
  era?: number;
  whip?: number;
  wins?: number;
  saves?: number;
  holds?: number;
  strikeouts?: number;
  innings?: number;
  qualityStarts?: number;
  kPer9?: number;
  wPlusQS?: number;
  svh?: number;
  // Add other pitching categories as needed
}

export interface LeagueSettings {
  hittingCategories: string[];
  pitchingCategories: string[];
  positions: { [key: string]: number }; // e.g., { "C": 2, "1B": 1, ... }
  numTeams: number;
  draftOrder: number[];
  ohtaniRule: 'separate' | 'combined';
  teamNames: string[];
}

export interface Team {
  id: number;
  name: string;
  draftPosition: number;
  roster: Player[];
  projectedStats: {
    hitting: Partial<HittingProjections>;
    pitching: Partial<PitchingProjections>;
  };
}

export interface DraftPick {
  pickNumber: number;
  teamId: number;
  player: Player;
  timestamp: Date;
}