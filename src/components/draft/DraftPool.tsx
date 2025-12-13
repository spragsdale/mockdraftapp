import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Player, Position } from '@/types';

interface DraftPoolProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
}

export function DraftPool({ players, onPlayerSelect }: DraftPoolProps) {
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesPosition = positionFilter === 'all' || player.positions.includes(positionFilter);
      const matchesTier = tierFilter === 'all' || player.tier?.toString() === tierFilter;
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPosition && matchesTier && matchesSearch;
    });
  }, [players, positionFilter, tierFilter, searchTerm]);

  const playersByPosition = useMemo(() => {
    const grouped: Record<string, Player[]> = {};
    filteredPlayers.forEach((player) => {
      player.positions.forEach((pos) => {
        if (!grouped[pos]) grouped[pos] = [];
        if (!grouped[pos].includes(player)) {
          grouped[pos].push(player);
        }
      });
    });

    // Sort each position by tier, then ADP
    Object.keys(grouped).forEach((pos) => {
      grouped[pos].sort((a, b) => {
        if (a.tier !== b.tier) {
          return (a.tier || 999) - (b.tier || 999);
        }
        return (a.adp || 999) - (b.adp || 999);
      });
    });

    return grouped;
  }, [filteredPlayers]);

  const positions: (Position | 'all')[] = ['all', 'C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP', 'UTIL'];
  const tiers = ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Available Players</CardTitle>
            <CardDescription className="text-xs">Filter and search draftable players</CardDescription>
          </div>
          <div className="flex gap-1">
            {positions.slice(1).map((pos) => (
              <Button
                key={pos}
                variant={positionFilter === pos ? 'default' : 'outline'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setPositionFilter(pos)}
              >
                {pos}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Q Find Player"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-8 text-sm"
          />
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiers.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {tier === 'all' ? 'All' : `T${tier}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2">
        {positionFilter === 'all' ? (
          <div className="space-y-3">
            {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
              <div key={position}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">{position}</h3>
                  <span className="text-xs text-muted-foreground">
                    {positionPlayers.length} available
                  </span>
                </div>
                <div className="rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Name</TableHead>
                        <TableHead className="h-8 text-xs">ADP</TableHead>
                        <TableHead className="h-8 text-xs">Tier</TableHead>
                        <TableHead className="h-8 text-xs">$</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positionPlayers.map((player) => (
                        <TableRow
                          key={player.id}
                          className={onPlayerSelect ? 'cursor-pointer hover:bg-muted/50 h-8' : 'h-8'}
                          onClick={() => onPlayerSelect?.(player)}
                        >
                          <TableCell className="text-xs font-medium py-1">{player.name}</TableCell>
                          <TableCell className="text-xs py-1">{player.adp ?? '-'}</TableCell>
                          <TableCell className="text-xs py-1">{player.tier ?? '-'}</TableCell>
                          <TableCell className="text-xs py-1">
                            {player.auction_value ? `$${player.auction_value}` : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 text-xs">Name</TableHead>
                  <TableHead className="h-8 text-xs">ADP</TableHead>
                  <TableHead className="h-8 text-xs">Tier</TableHead>
                  <TableHead className="h-8 text-xs">$</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers
                  .sort((a, b) => {
                    if (a.tier !== b.tier) return (a.tier || 999) - (b.tier || 999);
                    return (a.adp || 999) - (b.adp || 999);
                  })
                  .map((player) => (
                    <TableRow
                      key={player.id}
                      className={onPlayerSelect ? 'cursor-pointer hover:bg-muted/50 h-8' : 'h-8'}
                      onClick={() => onPlayerSelect?.(player)}
                    >
                      <TableCell className="text-xs font-medium py-1">{player.name}</TableCell>
                      <TableCell className="text-xs py-1">{player.adp ?? '-'}</TableCell>
                      <TableCell className="text-xs py-1">{player.tier ?? '-'}</TableCell>
                      <TableCell className="text-xs py-1">
                        {player.auction_value ? `$${player.auction_value}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


