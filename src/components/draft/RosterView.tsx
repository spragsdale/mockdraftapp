import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Team, DraftPick, Player } from '@/types';

interface RosterViewProps {
  teams: Team[];
  picks: DraftPick[];
  availablePlayers: Player[];
  userTeamId?: string | null;
}

export function RosterView({ teams, picks, availablePlayers, userTeamId }: RosterViewProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeamId || teams[0]?.id || '');
  
  const playersMap = useMemo(() => {
    const map = new Map<string, Player>();
    availablePlayers.forEach((p) => map.set(p.id, p));
    return map;
  }, [availablePlayers]);

  const getTeamRoster = (teamId: string) => {
    const teamPicks = picks.filter((p) => p.team_id === teamId);
    return teamPicks.map((pick) => {
      const player = playersMap.get(pick.player_id);
      return {
        pick,
        player: player || null,
      };
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Rosters</CardTitle>
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {(() => {
            const selectedTeam = teams.find((t) => t.id === selectedTeamId);
            const roster = selectedTeam ? getTeamRoster(selectedTeam.id) : [];
            return (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">{selectedTeam?.name || 'Select Team'}</span>
                  <span className="text-xs text-muted-foreground">{roster.length} players</span>
                </div>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Pick</TableHead>
                        <TableHead className="h-8 text-xs">Player</TableHead>
                        <TableHead className="h-8 text-xs">Pos</TableHead>
                        <TableHead className="h-8 text-xs">ADP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roster.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">
                            No players drafted yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        roster
                          .sort((a, b) => a.pick.pick_number - b.pick.pick_number)
                          .map(({ pick, player }) => (
                            <TableRow key={pick.id} className="h-8">
                              <TableCell className="text-xs py-1">{pick.pick_number}</TableCell>
                              <TableCell className="text-xs font-medium py-1">
                                {player ? player.name : 'Unknown'}
                              </TableCell>
                              <TableCell className="text-xs py-1">
                                {player ? player.positions.join(',') : '-'}
                              </TableCell>
                              <TableCell className="text-xs py-1">{player?.adp ?? '-'}</TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

