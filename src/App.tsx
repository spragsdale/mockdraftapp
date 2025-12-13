import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { LeagueSettings } from '@/components/config/LeagueSettings';
import { DraftOrder } from '@/components/config/DraftOrder';
import { Keepers } from '@/components/config/Keepers';
import { PlayerList } from '@/components/players/PlayerList';
import { PlayerImport } from '@/components/players/PlayerImport';
import { TierEditor } from '@/components/players/TierEditor';
import { usePlayers } from '@/hooks/usePlayers';
import { DraftPlanBuilder } from '@/components/planning/DraftPlanBuilder';
import { DraftBoard } from '@/components/draft/DraftBoard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { leaguesApi } from '@/lib/api/leagues';
import { draftsApi } from '@/lib/api/drafts';
import { useToast } from '@/components/ui/use-toast';
import type { League, Draft, Team } from '@/types';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';

function App() {
  const { toast } = useToast();
  const { players } = usePlayers();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadDrafts();
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedDraft) {
      loadTeams();
    }
  }, [selectedDraft]);

  const loadLeagues = async () => {
    try {
      const data = await leaguesApi.getAll();
      setLeagues(data);
      if (data.length > 0 && !selectedLeague) {
        setSelectedLeague(data[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load leagues',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDrafts = async () => {
    if (!selectedLeague) return;
    try {
      const allDrafts = await draftsApi.getAll();
      const leagueDrafts = allDrafts.filter((d) => d.league_id === selectedLeague.id);
      setDrafts(leagueDrafts);
      if (leagueDrafts.length > 0 && !selectedDraft) {
        setSelectedDraft(leagueDrafts[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load drafts',
        variant: 'destructive',
      });
  }
};

  const loadTeams = async () => {
    if (!selectedDraft) return;
    try {
      const teamData = await draftsApi.getTeams(selectedDraft.id);
      setTeams(teamData);
    } catch (error) {
      console.error('Failed to load teams', error);
  }
};

  const handleLeagueSave = (league: League) => {
    setLeagues((prev) => {
      const existing = prev.findIndex((l) => l.id === league.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = league;
        return updated;
      }
      return [...prev, league];
    });
    setSelectedLeague(league);
    loadDrafts();
  };

  const handleCreateDraft = async () => {
    if (!selectedLeague) {
      toast({
        title: 'Error',
        description: 'Please select a league first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newDraft = await draftsApi.create({
        league_id: selectedLeague.id,
        name: `Draft ${new Date().toLocaleDateString()}`,
        status: 'setup',
        current_pick: 0,
        draft_order: [],
      });

      // Create teams for the draft
      const numberOfTeams = selectedLeague.number_of_teams || 12;
      const teamPromises = [];
      for (let i = 0; i < numberOfTeams; i++) {
        const isUserTeam = i === 0; // First team is user team
        teamPromises.push(
          draftsApi.createTeam({
            draft_id: newDraft.id,
            name: isUserTeam ? 'My Team' : `Team ${i + 1}`,
            is_user_team: isUserTeam,
          })
        );
      }
      const createdTeams = await Promise.all(teamPromises);

      // Set draft order to team IDs
      const draftOrder = createdTeams.map((t) => t.id);
      await draftsApi.update(newDraft.id, { draft_order: draftOrder });

      setDrafts([...drafts, newDraft]);
      setSelectedDraft(newDraft);
      await loadTeams();
      toast({
        title: 'Success',
        description: 'Draft created with teams',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create draft',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold">Fantasy Baseball Mock Draft</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">League</label>
                <Select
                  value={selectedLeague?.id || ''}
                  onValueChange={(value) => {
                    const league = leagues.find((l) => l.id === value);
                    setSelectedLeague(league || null);
                    setSelectedDraft(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedLeague && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Draft</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedDraft?.id || ''}
                      onValueChange={(value) => {
                        const draft = drafts.find((d) => d.id === value);
                        setSelectedDraft(draft || null);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select draft" />
                      </SelectTrigger>
                      <SelectContent>
                        {drafts.map((draft) => (
                          <SelectItem key={draft.id} value={draft.id}>
                            {draft.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateDraft} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
          </div>
        </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            <Tabs defaultValue="config" className="w-full">
              <TabsList>
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="draft" disabled={!selectedDraft}>
                  Draft
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="space-y-4">
                <LeagueSettings league={selectedLeague || undefined} onSave={handleLeagueSave} />
                {selectedDraft && teams.length > 0 && (
                  <>
                    <DraftOrder draft={selectedDraft} teams={teams} onUpdate={loadTeams} />
                    <Keepers draft={selectedDraft} teams={teams} onUpdate={loadTeams} />
                  </>
                )}
              </TabsContent>

              <TabsContent value="players" className="space-y-4">
                <PlayerImport />
                <PlayerList players={players} />
                <TierEditor />
              </TabsContent>

              <TabsContent value="planning" className="space-y-4">
                {selectedDraft && selectedLeague ? (
                  <DraftPlanBuilder
                    draft={selectedDraft}
                    totalPicks={selectedLeague.roster_size * (selectedLeague.number_of_teams || 12)}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground">Please select a league and draft to plan</p>
                    </CardContent>
                  </Card>
        )}
              </TabsContent>

              <TabsContent value="draft">
                {selectedDraft ? (
                  <DraftBoard
                    draftId={selectedDraft.id}
                    onReset={async () => {
                      await loadDrafts();
                      if (selectedDraft) {
                        const updated = await draftsApi.getById(selectedDraft.id);
                        if (updated) setSelectedDraft(updated);
                      }
                    }}
                    onDuplicate={async (newDraftId) => {
                      await loadDrafts();
                      const newDraft = await draftsApi.getById(newDraftId);
                      if (newDraft) {
                        setSelectedDraft(newDraft);
                        await loadTeams();
                      }
                    }}
          />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground">Please select a draft to begin</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

