import type { Player, Team, DraftPick, PositionalRequirement } from '@/types';
import { draftsApi } from '@/lib/api/drafts';

export function useAutoDraft() {
  const calculatePositionalNeeds = (
    teamPicks: DraftPick[],
    players: Map<string, Player>,
    requirements: PositionalRequirement[]
  ): Map<Position, number> => {
    const needs = new Map<Position, number>();
    const filled = new Map<Position, number>();

    // Initialize needs from requirements
    requirements.forEach((req) => {
      needs.set(req.position, req.required);
      filled.set(req.position, 0);
    });

    // Count filled positions
    teamPicks.forEach((pick) => {
      const player = players.get(pick.player_id);
      if (player) {
        player.positions.forEach((pos) => {
          const current = filled.get(pos) || 0;
          filled.set(pos, current + 1);
        });
      }
    });

    // Calculate remaining needs
    const remainingNeeds = new Map<Position, number>();
    needs.forEach((required, position) => {
      const current = filled.get(position) || 0;
      const remaining = Math.max(0, required - current);
      if (remaining > 0) {
        remainingNeeds.set(position, remaining);
      }
    });

    return remainingNeeds;
  };

  const selectBestPlayer = (
    availablePlayers: Player[],
    positionalNeeds: Map<Position, number>,
    adpOrder: boolean = true
  ): Player | null => {
    if (availablePlayers.length === 0) return null;

    // Sort by ADP if available, otherwise by tier
    const sorted = [...availablePlayers].sort((a, b) => {
      if (adpOrder) {
        if (a.adp === null && b.adp === null) {
          return (a.tier || 999) - (b.tier || 999);
        }
        if (a.adp === null) return 1;
        if (b.adp === null) return -1;
        return a.adp - b.adp;
      } else {
        return (a.tier || 999) - (b.tier || 999);
      }
    });

    // First, try to fill a positional need
    for (const player of sorted) {
      for (const position of player.positions) {
        if (positionalNeeds.has(position) && (positionalNeeds.get(position) || 0) > 0) {
          return player;
        }
      }
    }

    // If no positional need, take best available
    return sorted[0];
  };

  const autoDraftPick = async (
    draftId: string,
    teamId: string,
    teamPicks: DraftPick[],
    availablePlayers: Player[],
    requirements: PositionalRequirement[],
    allPlayers: Map<string, Player>,
    slot: number
  ): Promise<Player> => {
    const positionalNeeds = calculatePositionalNeeds(teamPicks, allPlayers, requirements);
    const bestPlayer = selectBestPlayer(availablePlayers, positionalNeeds);

    if (!bestPlayer) {
      throw new Error('No available players');
    }

    await draftsApi.createPick({
      draft_id: draftId,
      team_id: teamId,
      player_id: bestPlayer.id,
      pick_number: teamPicks.length + 1,
      slot,
    });

    return bestPlayer;
  };

  return {
    autoDraftPick,
    calculatePositionalNeeds,
    selectBestPlayer,
  };
}


