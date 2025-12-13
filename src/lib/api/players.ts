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
};


