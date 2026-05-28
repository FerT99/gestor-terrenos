import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, DollarSign, Activity } from 'lucide-react';
import { api, type AuditLog } from '../lib/api';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await api.auditLogs.getAll();
        setLogs(data || []);
      } catch (err) {
        console.error("Error cargando audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const renderIcon = (accion: string) => {
    if (accion.includes('ABONO')) return <DollarSign size={16} className="text-emerald-600" />;
    if (accion.includes('VENTA')) return <CheckCircle2 size={16} className="text-blue-600" />;
    return <Activity size={16} className="text-neutral-600" />;
  };

  const getActionName = (accion: string) => {
    switch(accion) {
      case 'CREAR_ABONO': return 'registró un pago';
      case 'CREAR_ABONO_MORA_CONDONADA': return 'registró pago (mora condonada)';
      case 'NUEVA_VENTA': return 'creó una venta';
      default: return accion;
    }
  };

  const getEntityName = (tipo: string) => {
    switch(tipo) {
      case 'abonos': return 'en abonos';
      case 'planes_pago': return 'en plan de pago';
      default: return tipo;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mt-6">
      <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-2">
        <Clock size={20} className="text-neutral-400" />
        <h3 className="font-bold text-neutral-900">Historial de Actividad Reciente</h3>
      </div>
      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500">Cargando bitácora...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-400">No hay actividad reciente registrada.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {logs.map(log => (
              <div key={log.id} className="p-4 hover:bg-neutral-50 flex gap-4 transition-colors">
                <div className="mt-1">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                    {renderIcon(log.accion)}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-800">
                    <span className="font-semibold">{log.usuario_nombre}</span>{' '}
                    {getActionName(log.accion)}{' '}
                    <span className="text-neutral-500">{getEntityName(log.entidad_tipo)}</span>
                  </p>
                  
                  {log.detalles && (
                    <div className="mt-2 text-xs font-mono bg-neutral-100/50 p-2 rounded text-neutral-600">
                      {log.detalles.monto_pagado && `Monto: $${log.detalles.monto_pagado} ${log.detalles.moneda || 'MXN'} `}
                      {log.detalles.monto_total && `Monto Venta: $${log.detalles.monto_total} ${log.detalles.moneda || 'MXN'} `}
                      {log.detalles.metodo_pago && `| Método: ${log.detalles.metodo_pago} `}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
