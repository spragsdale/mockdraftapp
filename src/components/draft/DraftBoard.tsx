import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDraft } from '@/hooks/useDraft';
import { useAutoDraft } from '@/hooks/useAutoDraft';
import { useToast } from '@/components/ui/use-toast';
import { draftsApi } from '@/lib/api/drafts';
import { leaguesApi } from '@/lib/api/leagues';
import type { Draft, Team, Player, DraftPick, League } from '@/types';
import { DraftPool } from './DraftPool';
import { RosterView } from './RosterView';
import { DraftBoardGrid } from './DraftBoardGrid';
import { PickSelector } from './PickSelector';
import { RotateCcw, Copy } from 'lucide-react';

interface DraftBoardProps {
  draftId: string;
  onReset?: () => void;
  onDuplicate?: (newDraftId: string) => void;
}

export function DraftBoard({ draftId, onReset, onDuplicate }: DraftBoardProps) {
  const { draft, teams, picks, availablePlayers, allPlayers, loading, refetch, makePick, updateDraft } = useDraft(draftId);
  const { autoDraftPick } = useAutoDraft();
  const { toast } = useToast();
  const [league, setLeague] = useState<League | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);

  useEffect(() => {
    if (draft) {
      loadLeague();
      const user = teams.find((t) => t.is_user_team);
      setUserTeam(user || null);
    }
  }, [draft, teams]);

  const loadLeague = async () => {
    if (!draft) return;
    try {
      const leagueData = await leaguesApi.getById(draft.league_id);
      setLeague(leagueData);
    } catch (error) {
      console.error('Failed to load league', error);
    }
  };

  const getCurrentTeam = (): Team | null => {
    if (!draft || teams.length === 0) return null;
    const pickNumber = picks.length + 1;
    const draftOrder = draft.draft_order || teams.map((t) => t.id);
    const round = Math.floor((pickNumber - 1) / draftOrder.length);
    const positionInRound = (pickNumber - 1) % draftOrder.length;
    const isSnake = round % 2 === 1;
    const teamIndex = isSnake ? draftOrder.length - 1 - positionInRound : positionInRound;
    return teams.find((t) => t.id === draftOrder[teamIndex]) || null;
  };

  const handleMakePick = async (playerId: string, slot: number) => {
    const currentTeam = getCurrentTeam();
    if (!currentTeam || !draft) return;

    try {
      await makePick(currentTeam.id, playerId, slot);
      await refetch();
      toast({
        title: 'Pick Made',
        description: `Selected ${availablePlayers.find((p) => p.id === playerId)?.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to make pick',
        variant: 'destructive',
      });
    }
  };

  const handleAutoDraft = async () => {
    const currentTeam = getCurrentTeam();
    if (!currentTeam || !draft || !league || currentTeam.is_user_team) return;

    try {
      const teamPicks = picks.filter((p) => p.team_id === currentTeam.id);
      const allPlayersMap = new Map<string, Player>();
      allPlayers.forEach((p) => allPlayersMap.set(p.id, p));

      await autoDraftPick(
        draft.id,
        currentTeam.id,
        teamPicks,
        availablePlayers,
        league.positional_requirements,
        allPlayersMap,
        teamPicks.length + 1
      );
      await refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to auto-draft',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    if (!draft) return;
    if (!confirm('Reset this draft? This will clear all picks but keep your setup (draft order, keepers, plans).')) {
      return;
    }

    try {
      await draftsApi.resetDraft(draft.id);
      await refetch();
      toast({
        title: 'Success',
        description: 'Draft reset successfully',
      });
      onReset?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset draft',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    if (!draft) return;
    const newName = prompt('Enter name for the duplicate draft:', `${draft.name} (Copy)`);
    if (!newName) return;

    try {
      const newDraft = await draftsApi.duplicateDraft(draft.id, newName);
      toast({
        title: 'Success',
        description: 'Draft duplicated successfully',
      });
      onDuplicate?.(newDraft.id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to duplicate draft',
        variant: 'destructive',
      });
    }
  };

  const currentTeam = getCurrentTeam();
  const isUserTurn = currentTeam?.is_user_team || false;

  if (loading || !draft) {
    return <div>Loading draft...</div>;
  }

  const totalRounds = Math.ceil((league?.roster_size || 23) * teams.length / teams.length);
  const teamsPerRound = teams.length;

  return (
    <div className="flex flex-col gap-2" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-4 bg-destructive text-destructive-foreground rounded-lg">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg">{draft.name}</div>
          {userTeam && <div className="text-sm">@{userTeam.name}</div>}
        </div>
        <div className="flex items-center gap-4">
          {draft.status === 'in_progress' && (
            <div className="px-3 py-1 bg-green-600 rounded text-sm font-semibold">LIVE</div>
          )}
          <div className="text-sm">
            {isUserTurn ? (
              <span className="font-semibold">Your turn!</span>
            ) : (
              <>
                {(() => {
                  const userTeamIndex = draft.draft_order.findIndex((id) => teams.find((t) => t.id === id)?.is_user_team);
                  const currentIndex = draft.draft_order.findIndex((id) => id === currentTeam?.id);
                  const picksUntil = userTeamIndex > currentIndex 
                    ? userTeamIndex - currentIndex
                    : teams.length - currentIndex + userTeamIndex;
                  return `${picksUntil} Picks until your turn`;
                })()}
              </>
            )}
          </div>
          <div className="text-sm">
            Pick {picks.length + 1}/{teams.length * (league?.roster_size || 23)} Overall {picks.length + 1} Avg time 0:00
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        </div>
      </div>

      {/* Draft Board Grid - Top Section */}
      <div className="flex-1 min-h-0">
        <DraftBoardGrid
          picks={picks}
          teams={teams}
          allPlayers={allPlayers}
          totalRounds={totalRounds}
          teamsPerRound={teamsPerRound}
        />
      </div>

      {/* Bottom Section - 50/50 Split */}
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {/* Left: Draft Pool */}
        <div className="min-h-0 overflow-hidden">
          <DraftPool players={availablePlayers} onPlayerSelect={(player) => {}} />
        </div>

        {/* Right: Rosters */}
        <div className="min-h-0 overflow-hidden">
          <RosterView teams={teams} picks={picks} availablePlayers={allPlayers} userTeamId={userTeam?.id} />
        </div>
      </div>

      {/* Pick Selector - Show when it's user's turn */}
      {isUserTurn && (
        <Card className="border-2 border-primary">
          <CardContent className="p-4">
            <PickSelector
              availablePlayers={availablePlayers}
              onSelect={(playerId, slot) => handleMakePick(playerId, slot)}
            />
          </CardContent>
        </Card>
      )}

      {/* Auto-draft button for other teams */}
      {!isUserTurn && currentTeam && (
        <Card>
          <CardContent className="p-4">
            <Button onClick={handleAutoDraft} className="w-full">
              Auto-Draft for {currentTeam.name}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

