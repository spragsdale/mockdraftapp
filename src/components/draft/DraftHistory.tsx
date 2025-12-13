import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { DraftPick, Team, Player } from '@/types';

interface DraftHistoryProps {
  picks: DraftPick[];
  teams: Team[];
  availablePlayers: Player[];
}

export function DraftHistory({ picks, teams, availablePlayers }: DraftHistoryProps) {
  const teamsMap = new Map<string, Team>();
  teams.forEach((t) => teamsMap.set(t.id, t));

  const playersMap = new Map<string, Player>();
  availablePlayers.forEach((p) => playersMap.set(p.id, p));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft History</CardTitle>
        <CardDescription>All picks made in the draft</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pick</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Positions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {picks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No picks made yet
                  </TableCell>
                </TableRow>
              ) : (
                picks
                  .sort((a, b) => a.pick_number - b.pick_number)
                  .map((pick) => {
                    const team = teamsMap.get(pick.team_id);
                    const player = playersMap.get(pick.player_id);
                    return (
                      <TableRow key={pick.id}>
                        <TableCell>{pick.pick_number}</TableCell>
                        <TableCell>{team?.name || 'Unknown'}</TableCell>
                        <TableCell className="font-medium">
                          {player ? player.name : 'Unknown Player'}
                        </TableCell>
                        <TableCell>{player ? player.positions.join(', ') : '-'}</TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

