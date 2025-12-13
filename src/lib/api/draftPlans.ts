import { supabase } from '@/lib/supabase';
import type { DraftPlan } from '@/types';

export const draftPlansApi = {
  async getByDraft(draftId: string): Promise<DraftPlan[]> {
    const { data, error } = await supabase
      .from('draft_plans')
      .select('*')
      .eq('draft_id', draftId)
      .order('pick_number');
    if (error) throw error;
    return data || [];
  },

  async create(plan: Omit<DraftPlan, 'id' | 'created_at'>): Promise<DraftPlan> {
    const { data, error } = await supabase.from('draft_plans').insert(plan).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DraftPlan>): Promise<DraftPlan> {
    const { data, error } = await supabase.from('draft_plans').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('draft_plans').delete().eq('id', id);
    if (error) throw error;
  },

  async bulkUpsert(plans: Omit<DraftPlan, 'id' | 'created_at'>[]): Promise<DraftPlan[]> {
    // Delete existing plans for this draft
    if (plans.length > 0) {
      await supabase.from('draft_plans').delete().eq('draft_id', plans[0].draft_id);
    }
    // Insert new plans
    const { data, error } = await supabase.from('draft_plans').insert(plans).select();
    if (error) throw error;
    return data || [];
  },
};


