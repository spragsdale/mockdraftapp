import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Player } from '@/types';

interface PlayerTableProps {
  players: Player[];
  onPlayerClick?: (player: Player) => void;
}

export function PlayerTable({ players, onPlayerClick }: PlayerTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Positions</TableHead>
            <TableHead>ADP</TableHead>
            <TableHead>Auction Value</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Team</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No players found
              </TableCell>
            </TableRow>
          ) : (
            players.map((player) => (
              <TableRow
                key={player.id}
                className={onPlayerClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                onClick={() => onPlayerClick?.(player)}
              >
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{player.positions.join(', ')}</TableCell>
                <TableCell>{player.adp ?? '-'}</TableCell>
                <TableCell>{player.auction_value ? `$${player.auction_value}` : '-'}</TableCell>
                <TableCell>{player.tier ?? '-'}</TableCell>
                <TableCell>{player.team || '-'}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}


