import { supabase } from '@/lib/supabase';
import type { League } from '@/types';

export const leaguesApi = {
  async getAll(): Promise<League[]> {
    const { data, error } = await supabase.from('leagues').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<League | null> {
    const { data, error } = await supabase.from('leagues').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async create(league: Omit<League, 'id' | 'created_at' | 'updated_at'>): Promise<League> {
    const { data, error } = await supabase.from('leagues').insert(league).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<League>): Promise<League> {
    const { data, error } = await supabase
      .from('leagues')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('leagues').delete().eq('id', id);
    if (error) throw error;
  },
};


