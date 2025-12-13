import { useState, useEffect } from 'react';
import { draftPlansApi } from '@/lib/api/draftPlans';
import type { DraftPlan } from '@/types';

export function useDraftPlan(draftId: string | null) {
  const [plans, setPlans] = useState<DraftPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = async () => {
    if (!draftId) return;
    try {
      setLoading(true);
      const data = await draftPlansApi.getByDraft(draftId);
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch draft plans'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [draftId]);

  const createPlan = async (plan: Omit<DraftPlan, 'id' | 'created_at'>) => {
    try {
      const newPlan = await draftPlansApi.create(plan);
      setPlans((prev) => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create plan'));
      throw err;
    }
  };

  const updatePlan = async (id: string, updates: Partial<DraftPlan>) => {
    try {
      const updated = await draftPlansApi.update(id, updates);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update plan'));
      throw err;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await draftPlansApi.delete(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete plan'));
      throw err;
    }
  };

  const bulkUpsertPlans = async (plansToUpsert: Omit<DraftPlan, 'id' | 'created_at'>[]) => {
    try {
      const updated = await draftPlansApi.bulkUpsert(plansToUpsert);
      setPlans(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to bulk upsert plans'));
      throw err;
    }
  };

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    bulkUpsertPlans,
  };
}


