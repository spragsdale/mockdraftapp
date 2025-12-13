import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDraftPlan } from '@/hooks/useDraftPlan';
import { useToast } from '@/components/ui/use-toast';
import type { Draft, Position } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface DraftPlanBuilderProps {
  draft: Draft;
  totalPicks: number;
}

const POSITIONS: (Position | '')[] = ['', 'C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP', 'UTIL', 'CI', 'MI'];

export function DraftPlanBuilder({ draft, totalPicks }: DraftPlanBuilderProps) {
  const { plans, bulkUpsertPlans } = useDraftPlan(draft.id);
  const { toast } = useToast();
  const [planEntries, setPlanEntries] = useState<Array<{ pickNumber: number; position: Position | null }>>([]);

  useEffect(() => {
    // Initialize plan entries from existing plans or create empty ones
    const entries: Array<{ pickNumber: number; position: Position | null }> = [];
    for (let i = 1; i <= totalPicks; i++) {
      const existing = plans.find((p) => p.pick_number === i);
      entries.push({
        pickNumber: i,
        position: existing?.planned_position || null,
      });
    }
    setPlanEntries(entries);
  }, [plans, totalPicks]);

  const updatePlanEntry = (pickNumber: number, position: Position | null) => {
    setPlanEntries((prev) =>
      prev.map((entry) => (entry.pickNumber === pickNumber ? { ...entry, position } : entry))
    );
  };

  const handleSave = async () => {
    try {
      const plansToSave = planEntries
        .filter((entry) => entry.position !== null)
        .map((entry) => ({
          draft_id: draft.id,
          pick_number: entry.pickNumber,
          planned_position: entry.position!,
        }));

      await bulkUpsertPlans(plansToSave);
      toast({
        title: 'Success',
        description: 'Draft plan saved',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save draft plan',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft Plan Builder</CardTitle>
        <CardDescription>Plan which positions to target in upcoming draft slots</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-2">
          {planEntries.map((entry) => (
            <div key={entry.pickNumber} className="flex items-center gap-2">
              <Label className="w-24">Pick {entry.pickNumber}</Label>
              <Select
                value={entry.position || ''}
                onValueChange={(value) => updatePlanEntry(entry.pickNumber, value === '' ? null : (value as Position))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="No plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No plan</SelectItem>
                  {POSITIONS.filter((p) => p !== '').map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Draft Plan
        </Button>
      </CardContent>
    </Card>
  );
}


