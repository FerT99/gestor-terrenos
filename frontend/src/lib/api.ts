import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type EstadoTerreno = 'disponible' | 'apartado' | 'vendido';

export interface Terreno {
  id: string;
  clave: string;
  nombre: string | null;
  fase: string | null;
  superficie_m2: number;
  precio_lista: number;
  propietario: string | null;
  estado: EstadoTerreno;
  coordenadas: string | null;
  notas: string | null;
  created_at: string;
}

export interface TerrenoInput {
  clave: string;
  nombre: string;
  fase: string;
  superficie_m2: number;
  precio_lista: number;
  propietario: string;
  estado: string;
  coordenadas: string;
  notas: string;
}

export interface Cliente {
  id: string;
  nombre_completo: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: 'Activo' | 'Pendiente' | string;
  created_at: string;
}

export interface ClienteInput {
  nombre_completo: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const api = {
  terrenos: {
    getAll: async (): Promise<Terreno[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/terrenos`, { headers });
      if (!res.ok) throw new Error('Error al obtener terrenos');
      const json = await res.json();
      return json.data as Terreno[];
    },

    create: async (input: TerrenoInput): Promise<Terreno> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/terrenos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al crear terreno');
      }
      const json = await res.json();
      return json.data as Terreno;
    },

    update: async (id: string, input: TerrenoInput): Promise<Terreno> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/terrenos/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al actualizar terreno');
      }
      const json = await res.json();
      return json.data as Terreno;
    },

    delete: async (id: string): Promise<void> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/terrenos/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Error al eliminar terreno');
    },
  },

  clientes: {
    getAll: async (): Promise<Cliente[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/clientes`, { headers });
      if (!res.ok) throw new Error('Error al obtener clientes');
      const json = await res.json();
      return json.data as Cliente[];
    },

    create: async (input: ClienteInput): Promise<Cliente> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/clientes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al crear cliente');
      }
      const json = await res.json();
      return json.data as Cliente;
    },

    update: async (id: string, input: ClienteInput): Promise<Cliente> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/clientes/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al actualizar cliente');
      }
      const json = await res.json();
      return json.data as Cliente;
    },

    delete: async (id: string): Promise<void> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/clientes/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error('Error al eliminar cliente');
    },
  },
};
