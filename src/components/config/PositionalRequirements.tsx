import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PositionalRequirement } from '@/types';

interface PositionalRequirementsProps {
  requirements: PositionalRequirement[];
}

export function PositionalRequirements({ requirements }: PositionalRequirementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Positional Requirements</CardTitle>
        <CardDescription>Current league positional requirements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requirements.length === 0 ? (
            <p className="text-muted-foreground">No requirements set</p>
          ) : (
            requirements.map((req, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium">{req.position}</span>
                <span>{req.required} required</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}


