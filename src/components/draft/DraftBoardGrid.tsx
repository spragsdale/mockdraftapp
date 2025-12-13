import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { DraftPick, Team, Player } from '@/types';

interface DraftBoardGridProps {
  picks: DraftPick[];
  teams: Team[];
  allPlayers: Player[];
  totalRounds: number;
  teamsPerRound: number;
}

export function DraftBoardGrid({ picks, teams, allPlayers, totalRounds, teamsPerRound }: DraftBoardGridProps) {
  const playersMap = useMemo(() => {
    const map = new Map<string, Player>();
    allPlayers.forEach((p) => map.set(p.id, p));
    return map;
  }, [allPlayers]);

  const teamsMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach((t) => map.set(t.id, t));
    return map;
  }, [teams]);

  const picksByRound = useMemo(() => {
    const rounds: Record<number, (DraftPick & { player: Player | null; team: Team | null })[]> = {};
    
    picks.forEach((pick) => {
      const round = Math.floor((pick.pick_number - 1) / teamsPerRound) + 1;
      if (!rounds[round]) rounds[round] = [];
      rounds[round].push({
        ...pick,
        player: playersMap.get(pick.player_id) || null,
        team: teamsMap.get(pick.team_id) || null,
      });
    });

    // Sort picks within each round
    Object.keys(rounds).forEach((round) => {
      rounds[Number(round)].sort((a, b) => a.pick_number - b.pick_number);
    });

    return rounds;
  }, [picks, playersMap, teamsMap, teamsPerRound]);

  const getPickAtPosition = (round: number, position: number): (DraftPick & { player: Player | null; team: Team | null }) | null => {
    const roundPicks = picksByRound[round] || [];
    return roundPicks.find((p) => {
      const pickPosition = ((p.pick_number - 1) % teamsPerRound) + 1;
      return pickPosition === position;
    }) || null;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left text-xs font-medium text-muted-foreground">Round</th>
                  {Array.from({ length: teamsPerRound }, (_, i) => (
                    <th key={i + 1} className="border p-2 text-center text-xs font-medium text-muted-foreground min-w-[120px]">
                      Pick {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: totalRounds }, (_, roundIndex) => {
                  const round = roundIndex + 1;
                  return (
                    <tr key={round}>
                      <td className="border p-2 font-semibold bg-muted/50">{round}</td>
                      {Array.from({ length: teamsPerRound }, (_, posIndex) => {
                        const position = posIndex + 1;
                        const pick = getPickAtPosition(round, position);
                        return (
                          <td key={position} className="border p-2 text-sm">
                            {pick ? (
                              <div className="space-y-1">
                                <div className="font-medium text-xs text-muted-foreground">
                                  {pick.team?.name || 'Unknown'}
                                </div>
                                {pick.player ? (
                                  <>
                                    <div className="font-semibold">{pick.player.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {pick.player.positions.join(', ')}
                                      {pick.player.team && `-${pick.player.team}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {round}-{position} ({pick.pick_number})
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-xs text-muted-foreground">Unknown Player</div>
                                )}
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-xs">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

