import { useState, useEffect } from 'react';
import { playersApi } from '@/lib/api/players';
import type { Player } from '@/types';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await playersApi.getAll();
      setPlayers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch players'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const addPlayer = async (player: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newPlayer = await playersApi.create(player);
      setPlayers((prev) => [...prev, newPlayer]);
      return newPlayer;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create player'));
      throw err;
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      const updated = await playersApi.update(id, updates);
      setPlayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update player'));
      throw err;
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      await playersApi.delete(id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete player'));
      throw err;
    }
  };

  const bulkAddPlayers = async (playersToAdd: Omit<Player, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const newPlayers = await playersApi.bulkCreate(playersToAdd);
      setPlayers((prev) => [...prev, ...newPlayers]);
      return newPlayers;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to bulk create players'));
      throw err;
    }
  };

  return {
    players,
    loading,
    error,
    refetch: fetchPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
    bulkAddPlayers,
  };
}


