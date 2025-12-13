import { useState, useEffect } from 'react';
import { draftsApi } from '@/lib/api/drafts';
import { playersApi } from '@/lib/api/players';
import type { Draft, Team, DraftPick, Player, League } from '@/types';

export function useDraft(draftId: string | null) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDraft = async () => {
    if (!draftId) return;
    try {
      setLoading(true);
      const [draftData, teamsData, picksData, playersData] = await Promise.all([
        draftsApi.getById(draftId),
        draftsApi.getTeams(draftId),
        draftsApi.getPicks(draftId),
        playersApi.getAll(),
      ]);

      if (!draftData) throw new Error('Draft not found');

      setDraft(draftData);
      setTeams(teamsData);
      setPicks(picksData);
      setAllPlayers(playersData);

      // Filter out drafted players
      const draftedPlayerIds = new Set(picksData.map((p) => p.player_id));
      const available = playersData.filter((p) => !draftedPlayerIds.has(p.id));
      setAvailablePlayers(available);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch draft'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraft();
  }, [draftId]);

  const makePick = async (teamId: string, playerId: string, slot: number) => {
    if (!draft) throw new Error('No draft selected');

    try {
      const pickNumber = picks.length + 1;
      const pick = await draftsApi.createPick({
        draft_id: draftId!,
        team_id: teamId,
        player_id: playerId,
        pick_number: pickNumber,
        slot,
      });

      // Update draft current pick
      await draftsApi.update(draftId!, { current_pick: pickNumber });

      // Update local state
      setPicks((prev) => [...prev, pick]);
      setAvailablePlayers((prev) => prev.filter((p) => p.id !== playerId));

      // Refresh draft
      await fetchDraft();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to make pick'));
      throw err;
    }
  };

  const updateDraft = async (updates: Partial<Draft>) => {
    if (!draftId) return;
    try {
      const updated = await draftsApi.update(draftId, updates);
      setDraft(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update draft'));
      throw err;
    }
  };

  return {
    draft,
    teams,
    picks,
    availablePlayers,
    allPlayers,
    loading,
    error,
    refetch: fetchDraft,
    makePick,
    updateDraft,
  };
}

