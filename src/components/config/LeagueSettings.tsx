import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { leaguesApi } from '@/lib/api/leagues';
import type { League, Position, PositionalRequirement } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface LeagueSettingsProps {
  league?: League;
  onSave: (league: League) => void;
}

const POSITIONS: Position[] = ['C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP', 'UTIL', 'CI', 'MI', 'BEN'];

// Default scoring categories
const DEFAULT_SCORING_CATEGORIES = {
  hitters: ['RBI', 'Runs', 'SB', 'HR', 'OBP', 'SLG'],
  pitchers: ['W+QS', 'ERA', 'WHIP', 'SO', 'K/9', 'SV+HLD'],
};

export function LeagueSettings({ league, onSave }: LeagueSettingsProps) {
  const { toast } = useToast();
  const [name, setName] = useState(league?.name || '');
  const [numberOfTeams, setNumberOfTeams] = useState(league?.number_of_teams || 12);
  const [rosterSize, setRosterSize] = useState(league?.roster_size || 23);
  const [requirements, setRequirements] = useState<PositionalRequirement[]>(
    league?.positional_requirements || []
  );
  const scoringCategories = league?.scoring_categories || DEFAULT_SCORING_CATEGORIES;

  const addRequirement = () => {
    setRequirements([...requirements, { position: 'C', required: 1 }]);
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const updateRequirement = (index: number, updates: Partial<PositionalRequirement>) => {
    setRequirements(requirements.map((req, i) => (i === index ? { ...req, ...updates } : req)));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'League name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const leagueData: Omit<League, 'id' | 'created_at' | 'updated_at'> = {
        name,
        number_of_teams: numberOfTeams,
        roster_size: rosterSize,
        positional_requirements: requirements,
        scoring_categories: scoringCategories,
      };

      let savedLeague: League;
      if (league) {
        savedLeague = await leaguesApi.update(league.id, leagueData);
      } else {
        savedLeague = await leaguesApi.create(leagueData);
      }

      toast({
        title: 'Success',
        description: 'League settings saved',
      });
      onSave(savedLeague);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save league settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>League Settings</CardTitle>
        <CardDescription>Configure your league's positional requirements and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">League Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My League" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teams">Number of Teams</Label>
            <Input
              id="teams"
              type="number"
              min="2"
              max="20"
              value={numberOfTeams}
              onChange={(e) => setNumberOfTeams(parseInt(e.target.value) || 12)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roster">Roster Size</Label>
            <Input
              id="roster"
              type="number"
              min="1"
              max="50"
              value={rosterSize}
              onChange={(e) => setRosterSize(parseInt(e.target.value) || 23)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Positional Requirements</Label>
            <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </div>

          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Select
                  value={req.position}
                  onValueChange={(value: Position) => updateRequirement(index, { position: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  value={req.required}
                  onChange={(e) => updateRequirement(index, { required: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scoring Categories</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Hitters</Label>
              <div className="flex flex-wrap gap-2">
                {scoringCategories.hitters.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Pitchers</Label>
              <div className="flex flex-wrap gap-2">
                {scoringCategories.pitchers.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save League Settings
        </Button>
      </CardContent>
    </Card>
  );
}


