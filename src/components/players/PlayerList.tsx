import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Player, Position } from '@/types';
import { playerQualifiesForPosition } from '@/lib/utils';
import { PlayerTable } from './PlayerTable';

interface PlayerListProps {
  players: Player[];
  onPlayerClick?: (player: Player) => void;
}

export function PlayerList({ players, onPlayerClick }: PlayerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<Position | 'all'>('all');

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition =
        positionFilter === 'all' || playerQualifiesForPosition(player.positions, positionFilter);
      return matchesSearch && matchesPosition;
    });
  }, [players, searchTerm, positionFilter]);

  const positions: (Position | 'all')[] = ['all', 'C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP', 'UTIL', 'CI', 'MI'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardDescription>Browse and search all players</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={positionFilter} onValueChange={(value) => setPositionFilter(value as Position | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos === 'all' ? 'All Positions' : pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PlayerTable players={filteredPlayers} onPlayerClick={onPlayerClick} />
      </CardContent>
    </Card>
  );
}


