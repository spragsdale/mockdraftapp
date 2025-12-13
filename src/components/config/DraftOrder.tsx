import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { draftsApi } from '@/lib/api/drafts';
import { useToast } from '@/components/ui/use-toast';
import type { Draft, Team } from '@/types';
import { GripVertical, Trash2 } from 'lucide-react';

interface DraftOrderProps {
  draft: Draft;
  teams: Team[];
  onUpdate: () => void;
}

export function DraftOrder({ draft, teams, onUpdate }: DraftOrderProps) {
  const { toast } = useToast();
  const [teamOrder, setTeamOrder] = useState<string[]>(draft.draft_order || []);
  const [teamNames, setTeamNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const names = new Map<string, string>();
    teams.forEach((team) => {
      names.set(team.id, team.name);
    });
    setTeamNames(names);
    if (draft.draft_order.length === 0 && teams.length > 0) {
      setTeamOrder(teams.map((t) => t.id));
    }
  }, [teams, draft]);

  const moveTeam = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...teamOrder];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    setTeamOrder(newOrder);
  };

  const handleSave = async () => {
    try {
      await draftsApi.update(draft.id, { draft_order: teamOrder });
      toast({
        title: 'Success',
        description: 'Draft order updated',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update draft order',
        variant: 'destructive',
      });
    }
  };

  const generateSnakeOrder = () => {
    const rounds = Math.ceil((draft.draft_order.length * 10) / draft.draft_order.length);
    const order: string[] = [];
    for (let round = 0; round < rounds; round++) {
      const roundOrder = round % 2 === 0 ? [...teamOrder] : [...teamOrder].reverse();
      order.push(...roundOrder);
    }
    return order;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Order</CardTitle>
        <CardDescription>Set the order teams will draft</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {teamOrder.map((teamId, index) => (
            <div key={teamId} className="flex items-center gap-2 p-2 border rounded">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{teamNames.get(teamId) || `Team ${index + 1}`}</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveTeam(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveTeam(index, 'down')}
                  disabled={index === teamOrder.length - 1}
                >
                  ↓
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Draft Order
        </Button>
      </CardContent>
    </Card>
  );
}


