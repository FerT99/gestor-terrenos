import { useState, useEffect, useCallback } from 'react';
import { api, type Terreno, type TerrenoInput } from '../lib/api';

interface UseTerrenosReturn {
  terrenos: Terreno[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTerreno: (input: TerrenoInput) => Promise<void>;
  updateTerreno: (id: string, input: TerrenoInput) => Promise<void>;
  deleteTerreno: (id: string) => Promise<void>;
}

export function useTerrenos(): UseTerrenosReturn {
  const [terrenos, setTerrenos] = useState<Terreno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.terrenos.getAll();
      setTerrenos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createTerreno = async (input: TerrenoInput) => {
    const nuevo = await api.terrenos.create(input);
    setTerrenos(prev => [nuevo, ...prev]);
  };

  const updateTerreno = async (id: string, input: TerrenoInput) => {
    const actualizado = await api.terrenos.update(id, input);
    setTerrenos(prev => prev.map(t => t.id === id ? actualizado : t));
  };

  const deleteTerreno = async (id: string) => {
    await api.terrenos.delete(id);
    setTerrenos(prev => prev.filter(t => t.id !== id));
  };

  return { terrenos, loading, error, refresh, createTerreno, updateTerreno, deleteTerreno };
}
