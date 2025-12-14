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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">League Settings</CardTitle>
        <CardDescription className="text-sm">Configure your league's positional requirements and settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* First row: League name, teams, roster */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs">League Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My League" className="h-9" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="teams" className="text-xs">Teams</Label>
            <Input
              id="teams"
              type="number"
              min="2"
              max="20"
              value={numberOfTeams}
              onChange={(e) => setNumberOfTeams(parseInt(e.target.value) || 12)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="roster" className="text-xs">Roster Size</Label>
            <Input
              id="roster"
              type="number"
              min="1"
              max="50"
              value={rosterSize}
              onChange={(e) => setRosterSize(parseInt(e.target.value) || 23)}
              className="h-9"
            />
          </div>
        </div>

        {/* Positional Requirements - Compact grid */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Positional Requirements</Label>
            <Button type="button" variant="outline" size="sm" onClick={addRequirement} className="h-7 text-xs px-2">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-1.5 items-center">
                <Select
                  value={req.position}
                  onValueChange={(value: Position) => updateRequirement(index, { position: value })}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
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
                  className="w-14 h-8 text-xs"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(index)} className="h-8 w-8">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Categories - Compact inline */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Scoring Categories</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hitters</Label>
              <div className="flex flex-wrap gap-1">
                {scoringCategories.hitters.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Pitchers</Label>
              <div className="flex flex-wrap gap-1">
                {scoringCategories.pitchers.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full h-9 mt-2">
          Save League Settings
        </Button>
      </CardContent>
    </Card>
  );
}


