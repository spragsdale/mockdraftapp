import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePlayers } from '@/hooks/usePlayers';
import { useToast } from '@/components/ui/use-toast';
import type { Player, Position } from '@/types';

interface TierEditorProps {
  position?: Position;
}

export function TierEditor({ position }: TierEditorProps) {
  const { players, updatePlayer } = usePlayers();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>('');

  const filteredPlayers = position
    ? players.filter((p) => p.positions.includes(position))
    : players;

  const handleTierUpdate = async (playerId: string, tier: number | null) => {
    try {
      await updatePlayer(playerId, { tier });
      toast({
        title: 'Success',
        description: 'Tier updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tier',
        variant: 'destructive',
      });
    }
  };

  const bulkUpdateTier = async () => {
    if (!selectedTier) return;
    const tier = selectedTier === 'clear' ? null : parseInt(selectedTier);

    const selected = filteredPlayers.filter((p) => p.tier === null || p.tier === undefined);
    if (selected.length === 0) {
      toast({
        title: 'Info',
        description: 'No players selected for bulk update',
      });
      return;
    }

    try {
      await Promise.all(selected.map((p) => updatePlayer(p.id, { tier })));
      toast({
        title: 'Success',
        description: `Updated ${selected.length} players`,
      });
      setSelectedTier('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to bulk update tiers',
        variant: 'destructive',
      });
    }
  };

  const playersByTier = filteredPlayers.reduce((acc, player) => {
    const tier = player.tier ?? 0;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(player);
    return acc;
  }, {} as Record<number, Player[]>);

  const tiers = Object.keys(playersByTier)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tier Editor</CardTitle>
        <CardDescription>
          {position ? `Edit tiers for ${position}` : 'Edit player tiers'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clear">Clear Tier</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tier) => (
                <SelectItem key={tier} value={tier.toString()}>
                  Tier {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={bulkUpdateTier} disabled={!selectedTier}>
            Bulk Update Untiered Players
          </Button>
        </div>

        <div className="space-y-4">
          {tiers.map((tier) => (
            <div key={tier}>
              <h3 className="font-semibold mb-2">Tier {tier}</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Positions</TableHead>
                      <TableHead>ADP</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playersByTier[tier].map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.positions.join(', ')}</TableCell>
                        <TableCell>{player.adp ?? '-'}</TableCell>
                        <TableCell>
                          <Select
                            value={player.tier?.toString() || '__none__'}
                            onValueChange={(value) =>
                              handleTierUpdate(player.id, value === '__none__' ? null : parseInt(value))
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">No Tier</SelectItem>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                                <SelectItem key={t} value={t.toString()}>
                                  Tier {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


