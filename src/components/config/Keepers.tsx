import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { draftsApi } from '@/lib/api/drafts';
import { playersApi } from '@/lib/api/players';
import { useToast } from '@/components/ui/use-toast';
import type { Draft, Team, Keeper, Player } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface KeepersProps {
  draft: Draft;
  teams: Team[];
  onUpdate: () => void;
}

export function Keepers({ draft, teams, onUpdate }: KeepersProps) {
  const { toast } = useToast();
  const [keepers, setKeepers] = useState<Keeper[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [draft.id]);

  const loadData = async () => {
    try {
      const [keepersData, playersData] = await Promise.all([
        draftsApi.getKeepers(draft.id),
        playersApi.getAll(),
      ]);
      setKeepers(keepersData);
      setPlayers(playersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load keepers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addKeeper = async () => {
    if (teams.length === 0) {
      toast({
        title: 'Error',
        description: 'No teams available',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newKeeper = await draftsApi.createKeeper({
        draft_id: draft.id,
        team_id: teams[0].id,
        player_id: players[0]?.id || '',
        draft_slot: 1,
      });
      setKeepers([...keepers, newKeeper]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add keeper',
        variant: 'destructive',
      });
    }
  };

  const removeKeeper = async (id: string) => {
    try {
      await draftsApi.deleteKeeper(id);
      setKeepers(keepers.filter((k) => k.id !== id));
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove keeper',
        variant: 'destructive',
      });
    }
  };

  const updateKeeper = async (id: string, updates: Partial<Keeper>) => {
    const keeper = keepers.find((k) => k.id === id);
    if (!keeper) return;

    try {
      // Delete and recreate (Supabase doesn't have update for keepers in our API)
      await draftsApi.deleteKeeper(id);
      const updated = await draftsApi.createKeeper({ ...keeper, ...updates });
      setKeepers(keepers.map((k) => (k.id === id ? updated : k)));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update keeper',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keepers</CardTitle>
        <CardDescription>Assign keepers to teams before the draft</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={addKeeper} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Keeper
        </Button>

        <div className="space-y-2">
          {keepers.map((keeper) => {
            const team = teams.find((t) => t.id === keeper.team_id);
            const player = players.find((p) => p.id === keeper.player_id);
            return (
              <div key={keeper.id} className="flex gap-2 items-center p-2 border rounded">
                <Select
                  value={keeper.team_id}
                  onValueChange={(value) => updateKeeper(keeper.id, { team_id: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={keeper.player_id}
                  onValueChange={(value) => updateKeeper(keeper.id, { player_id: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.positions.join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={keeper.draft_slot}
                  onChange={(e) =>
                    updateKeeper(keeper.id, { draft_slot: parseInt(e.target.value) || 1 })
                  }
                  className="w-24"
                  placeholder="Slot"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeKeeper(keeper.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


