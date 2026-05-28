import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  if (session?.user?.id) {
    headers['X-User-Id'] = session.user.id;
  }
  
  const userRole = localStorage.getItem('user_role');
  if (userRole) {
    headers['X-User-Role'] = userRole;
  }
  
  const parcelaId = localStorage.getItem('selected_parcela');
  if (parcelaId) {
    headers['X-Parcela-Id'] = parcelaId;
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
  vendedor_id: string | null;
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
  moneda: string;
  vendedor_id?: string;
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

export interface PlanPago {
  id: string;
  parcela_id: string;
  terreno_id: string;
  cliente_id: string;
  monto_total: number;
  enganche: number;
  plazos: number;
  tasa_interes: number;
  fecha_inicio: string;
  estado: string;
  created_at: string;
  cliente_nombre?: string;
  terreno_nombre?: string;
}

export interface PlanPagoInput {
  terreno_id: string;
  cliente_id: string;
  monto_total: number;
  enganche: number;
  plazos: number;
  tasa_interes: number;
  fecha_inicio: string;
  moneda: string;
}

export interface Parcela {
  id: string;
  nombre: string;
  descripcion: string;
  created_at: string;
}

export interface PeriodoPago {
  id: string;
  plan_id: string;
  numero_periodo: number;
  monto_esperado: number;
  fecha_vencimiento: string;
  estado: string;
  mora_aplicada: number;
  created_at: string;
}

export interface Abono {
  id: string;
  parcela_id: string;
  periodo_pago_id: string;
  numero_abono: number;
  monto_pagado: number;
  fecha_pago: string;
  metodo_pago: string | null;
  comprobante_url: string | null;
  notas: string | null;
  moneda: string;
  created_at: string;
}

export interface AbonoInput {
  periodo_pago_id: string;
  monto_pagado: number;
  fecha_pago: string;
  metodo_pago: string;
  notas: string;
  perdonar_mora: boolean;
  moneda: string;
}

export interface ClienteMoroso {
  id: string;
  nombre_completo: string;
  telefono: string;
  plan_id: string;
  terreno_clave: string;
  periodo_id: string;
  numero_periodo: number;
  monto_esperado: number;
  fecha_vencimiento: string;
  dias_retraso: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  usuario_nombre: string;
  accion: string;
  entidad_tipo: string;
  entidad_id: string;
  detalles: any;
  created_at: string;
}

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: string;
  created_at: string;
}

export const api = {
  parcelas: {
    getAll: async (): Promise<Parcela[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${API_URL}/api/v1/parcelas`, { headers });
      if (!res.ok) throw new Error('Error al obtener parcelas');
      const json = await res.json();
      return json.data as Parcela[];
    },
    create: async (input: { nombre: string; descripcion: string }): Promise<Parcela> => {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const res = await fetch(`${API_URL}/api/v1/parcelas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input)
      });
      if (!res.ok) throw new Error('Error al crear parcela');
      const json = await res.json();
      return json.data as Parcela;
    }
  },

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

  planesPago: {
    getAll: async (): Promise<PlanPago[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/planes-pago`, { headers });
      if (!res.ok) throw new Error('Error al obtener planes de pago');
      const json = await res.json();
      return json.data as PlanPago[];
    },

    create: async (input: PlanPagoInput): Promise<PlanPago> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/planes-pago`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al crear plan de pago');
      }
      const json = await res.json();
      return json.data as PlanPago;
    },

    getPeriodos: async (planId: string): Promise<PeriodoPago[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/planes-pago/${planId}/periodos`, { headers });
      if (!res.ok) throw new Error('Error al obtener periodos');
      const json = await res.json();
      return json.data as PeriodoPago[];
    }
  },

  abonos: {
    getAll: async (): Promise<Abono[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/abonos`, { headers });
      if (!res.ok) throw new Error('Error al obtener todos los abonos');
      const json = await res.json();
      return json.data as Abono[];
    },
    create: async (input: AbonoInput): Promise<Abono> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/abonos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Error al crear abono');
      }
      const json = await res.json();
      return json.data as Abono;
    },
    getByPeriodo: async (periodoId: string): Promise<Abono[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/periodos/${periodoId}/abonos`, { headers });
      if (!res.ok) throw new Error('Error al obtener abonos');
      const json = await res.json();
      return json.data as Abono[];
    }
  },

  auditLogs: {
    getAll: async (): Promise<AuditLog[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/audit-logs`, { headers });
      if (!res.ok) throw new Error('Error al obtener audit logs');
      const json = await res.json();
      return json.data as AuditLog[];
    }
  },
  reportes: {
    getMorosos: async (): Promise<ClienteMoroso[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/reportes/morosos`, { headers });
      if (!res.ok) throw new Error('Error al obtener clientes morosos');
      const json = await res.json();
      return json.data as ClienteMoroso[];
    }
  },

  usuarios: {
    getAll: async (): Promise<Usuario[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/usuarios`, { headers });
      if (!res.ok) throw new Error('Error al obtener usuarios');
      const json = await res.json();
      return json.data as Usuario[];
    },
    getMe: async (): Promise<Usuario> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/api/v1/usuarios/me`, { headers });
      if (!res.ok) throw new Error('Error al obtener perfil de usuario');
      const json = await res.json();
      return json.data as Usuario;
    }
  }
};
