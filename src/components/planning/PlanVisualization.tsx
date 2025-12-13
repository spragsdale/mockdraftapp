import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDraftPlan } from '@/hooks/useDraftPlan';
import type { Draft } from '@/types';

interface PlanVisualizationProps {
  draft: Draft;
  currentPick: number;
}

export function PlanVisualization({ draft, currentPick }: PlanVisualizationProps) {
  const { plans } = useDraftPlan(draft.id);

  const upcomingPlans = plans.filter((p) => p.pick_number >= currentPick).slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Draft Plan</CardTitle>
        <CardDescription>Your planned positions for upcoming picks</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingPlans.length === 0 ? (
          <p className="text-muted-foreground">No plans set for upcoming picks</p>
        ) : (
          <div className="space-y-2">
            {upcomingPlans.map((plan) => (
              <div key={plan.id} className="flex justify-between items-center p-2 border rounded">
                <span>
                  Pick <strong>{plan.pick_number}</strong>
                </span>
                <span className="font-medium">{plan.planned_position}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


