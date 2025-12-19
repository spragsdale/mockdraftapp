import { supabase } from '@/lib/supabase';
import type { Player } from '@/types';

export const playersApi = {
  async getAll(): Promise<Player[]> {
    const { data, error } = await supabase.from('players').select('*').order('adp', { nullsLast: true });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Player | null> {
    const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(player: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
    const { data, error } = await supabase.from('players').insert(player).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Player>): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw error;
  },

  async bulkCreate(players: Omit<Player, 'id' | 'created_at' | 'updated_at'>[]): Promise<Player[]> {
    const { data, error } = await supabase.from('players').insert(players).select();
    if (error) throw error;
    return data || [];
  },

  async bulkUpdate(updates: Array<{ id: string; updates: Partial<Player> }>): Promise<Player[]> {
    // Update players one by one (Supabase doesn't support bulk updates with different values easily)
    const updated: Player[] = [];
    for (const { id, updates: updateData } of updates) {
      const player = await this.update(id, updateData);
      updated.push(player);
    }
    return updated;
  },

  async bulkUpsert(players: Omit<Player, 'id' | 'created_at' | 'updated_at'>[]): Promise<Player[]> {
    // For upsert, we'll insert new players and update existing ones
    // First, get all existing players to match against
    const existingPlayers = await this.getAll();
    const existingMap = new Map(existingPlayers.map((p) => [p.name.toLowerCase(), p]));

    const toInsert: Omit<Player, 'id' | 'created_at' | 'updated_at'>[] = [];
    const toUpdate: Array<{ id: string; updates: Partial<Player> }> = [];

    for (const player of players) {
      const existing = existingMap.get(player.name.toLowerCase());
      if (existing) {
        // Merge updates with existing player data
        toUpdate.push({
          id: existing.id,
          updates: { ...player, updated_at: new Date().toISOString() },
        });
      } else {
        toInsert.push(player);
      }
    }

    // Insert new players
    const inserted = toInsert.length > 0 ? await this.bulkCreate(toInsert) : [];

    // Update existing players
    const updated = toUpdate.length > 0 ? await this.bulkUpdate(toUpdate) : [];

    return [...inserted, ...updated];
  },
};


