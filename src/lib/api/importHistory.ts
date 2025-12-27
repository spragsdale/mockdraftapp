import { supabase } from '@/lib/supabase';
import type { ImportHistory, ImportType } from '@/types';

export const importHistoryApi = {
  async getLatest(importType: ImportType): Promise<ImportHistory | null> {
    const { data, error } = await supabase
      .from('import_history')
      .select('*')
      .eq('import_type', importType)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      // Handle 406 Not Acceptable (RLS policy issue) or other errors gracefully
      if (error.code === 'PGRST301' || error.message?.includes('406')) {
        console.warn('RLS policy issue or table not accessible:', error.message);
        return null;
      }
      throw error;
    }
    return data;
  },

  async create(history: Omit<ImportHistory, 'id'>): Promise<ImportHistory> {
    const { data, error } = await supabase.from('import_history').insert(history).select().single();
    if (error) throw error;
    return data;
  },

  async getAll(importType?: ImportType): Promise<ImportHistory[]> {
    let query = supabase.from('import_history').select('*').order('uploaded_at', { ascending: false });
    if (importType) {
      query = query.eq('import_type', importType);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};

