import { supabase } from '@/lib/supabase';
import type { Draft, Team, DraftPick, Keeper } from '@/types';

export const draftsApi = {
  async getAll(): Promise<Draft[]> {
    const { data, error } = await supabase.from('drafts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Draft | null> {
    const { data, error } = await supabase.from('drafts').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(draft: Omit<Draft, 'id' | 'created_at' | 'updated_at'>): Promise<Draft> {
    const { data, error } = await supabase.from('drafts').insert(draft).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Draft>): Promise<Draft> {
    const { data, error } = await supabase
      .from('drafts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTeams(draftId: string): Promise<Team[]> {
    const { data, error } = await supabase.from('teams').select('*').eq('draft_id', draftId).order('name');
    if (error) throw error;
    return data || [];
  },

  async createTeam(team: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
    const { data, error } = await supabase.from('teams').insert(team).select().single();
    if (error) throw error;
    return data;
  },

  async getPicks(draftId: string): Promise<DraftPick[]> {
    const { data, error } = await supabase
      .from('draft_picks')
      .select('*')
      .eq('draft_id', draftId)
      .order('pick_number');
    if (error) throw error;
    return data || [];
  },

  async createPick(pick: Omit<DraftPick, 'id' | 'created_at'>): Promise<DraftPick> {
    const { data, error } = await supabase.from('draft_picks').insert(pick).select().single();
    if (error) throw error;
    return data;
  },

  async getKeepers(draftId: string): Promise<Keeper[]> {
    const { data, error } = await supabase.from('keepers').select('*').eq('draft_id', draftId);
    if (error) throw error;
    return data || [];
  },

  async createKeeper(keeper: Omit<Keeper, 'id' | 'created_at'>): Promise<Keeper> {
    const { data, error } = await supabase.from('keepers').insert(keeper).select().single();
    if (error) throw error;
    return data;
  },

  async deleteKeeper(id: string): Promise<void> {
    const { error } = await supabase.from('keepers').delete().eq('id', id);
    if (error) throw error;
  },

  async resetDraft(draftId: string): Promise<void> {
    // Delete all picks but keep everything else (teams, keepers, draft order, plans)
    const { error } = await supabase.from('draft_picks').delete().eq('draft_id', draftId);
    if (error) throw error;
    
    // Reset draft status
    await this.update(draftId, {
      status: 'setup',
      current_pick: 0,
    });
  },

  async duplicateDraft(draftId: string, newName: string): Promise<Draft> {
    // Get original draft
    const originalDraft = await this.getById(draftId);
    if (!originalDraft) throw new Error('Draft not found');

    // Get teams, keepers from original
    const [originalTeams, originalKeepers] = await Promise.all([
      this.getTeams(draftId),
      this.getKeepers(draftId),
    ]);

    // Create new draft
    const newDraft = await this.create({
      league_id: originalDraft.league_id,
      name: newName,
      status: 'setup',
      current_pick: 0,
      draft_order: [], // Will be set after teams are created
    });

    // Create teams (maintain order and user team flag)
    const teamMap = new Map<string, string>(); // old team id -> new team id
    const newTeams = [];
    for (const originalTeam of originalTeams) {
      const newTeam = await this.createTeam({
        draft_id: newDraft.id,
        name: originalTeam.name,
        is_user_team: originalTeam.is_user_team,
      });
      teamMap.set(originalTeam.id, newTeam.id);
      newTeams.push(newTeam);
    }

    // Set draft order (map old team IDs to new team IDs)
    const newDraftOrder = originalDraft.draft_order.map((oldTeamId) => teamMap.get(oldTeamId) || '').filter(Boolean);
    await this.update(newDraft.id, { draft_order: newDraftOrder });

    // Copy keepers (map team IDs and maintain draft slots)
    for (const keeper of originalKeepers) {
      const newTeamId = teamMap.get(keeper.team_id);
      if (newTeamId) {
        await this.createKeeper({
          draft_id: newDraft.id,
          team_id: newTeamId,
          player_id: keeper.player_id,
          draft_slot: keeper.draft_slot,
        });
      }
    }

    return newDraft;
  },
};


