import React, { useState, useEffect } from 'react';
import { ArrowLeft, Banknote, Calendar, CheckCircle2, AlertTriangle, ExternalLink, Loader2, PlusCircle, Upload } from 'lucide-react';
import { api, type Terreno, type PlanPago, type Abono } from '../lib/api';
import NewPaymentModal from './NewPaymentModal';
import ErrorBoundary from './ErrorBoundary';

interface TerrenoDetailProps {
  terrenoId: string;
  onBack: () => void;
}

const TerrenoDetail: React.FC<TerrenoDetailProps> = ({ terrenoId, onBack }) => {
  const [terreno, setTerreno] = useState<Terreno | null>(null);
  const [plan, setPlan] = useState<PlanPago | null>(null);
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [uploadingAbonoId, setUploadingAbonoId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, abonoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAbonoId(abonoId);
      const url = await api.abonos.uploadComprobante(file);
      await api.abonos.updateComprobante(abonoId, url);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al subir el comprobante');
    } finally {
      setUploadingAbonoId(null);
    }
  };

  const autoGeneratePlan = async () => {
    if (!terreno?.propietario) {
      alert("Para generar un plan automáticamente, el terreno debe tener un propietario asignado.");
      return;
    }
    
    try {
      setLoading(true);
      const clientes = await api.clientes.getAll();
      const cliente = clientes.find(c => c.nombre_completo === terreno.propietario);
      if (!cliente) {
        throw new Error(`No se encontró el cliente "${terreno.propietario}". Debes asignar un cliente válido.`);
      }

      // Regla: 40 plazos fijos para cualquier terreno
      const plazos = 40;

      const input = {
        terreno_id: terreno.id,
        cliente_id: cliente.id,
        monto_total: terreno.precio_lista,
        enganche: 0,
        plazos: plazos,
        tasa_interes: 0,
        fecha_inicio: new Date().toISOString(),
        moneda: 'MXN',
      };

      await api.planesPago.create(input);
      
      await fetchData();
      setIsPaymentModalOpen(true);

    } catch (err: any) {
      alert(err.message || "Error al generar el plan de pagos");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
      try {
        setLoading(true);
        const [terrenosData, planesData] = await Promise.all([
          api.terrenos.getAll(),
          api.planesPago.getAll()
        ]);

        const currentTerreno = terrenosData.find(t => t.id === terrenoId);
        if (!currentTerreno) throw new Error('Terreno no encontrado');
        setTerreno(currentTerreno);

        const currentPlan = planesData.find(p => p.terreno_id === terrenoId);
        if (currentPlan) {
          setPlan(currentPlan);
          
          // Get periodos to know which abonos belong to this plan
          const periodosData = await api.planesPago.getPeriodos(currentPlan.id);
          
          // Fetch abonos para cada periodo individualmente
          const abonosPromises = periodosData.map(p => api.abonos.getByPeriodo(p.id));
          const abonosResults = await Promise.all(abonosPromises);
          
          // Flatten, filter nulls, and sort
          const filteredAbonos = abonosResults.flat().filter(a => a != null);
          filteredAbonos.sort((a, b) => (a.numero_abono || 0) - (b.numero_abono || 0));
          setAbonos(filteredAbonos);
        }

      } catch (err: any) {
        setError(err.message || 'Error al cargar los detalles del terreno.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [terrenoId]);

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
        <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
        <p className="font-medium text-lg">Cargando detalles...</p>
      </div>
    );
  }

  if (error || !terreno) {
    return (
      <div className="p-10 max-w-3xl mx-auto text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex flex-col items-center">
          <AlertTriangle size={32} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Ups, ocurrió un problema</h2>
          <p>{error || 'No se pudo cargar el terreno.'}</p>
          <button 
            onClick={onBack}
            className="mt-6 px-6 py-2 bg-white text-neutral-700 rounded-lg shadow-sm border border-neutral-200 font-medium hover:bg-neutral-50 transition-colors"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const totalPagado = abonos.reduce((sum, a) => sum + (Number(a.monto_pagado) || 0), 0);
  const enganchePlan = plan ? Number(plan.enganche) || 0 : 0;
  
  // Enganche Dinámico (Solo para visualización en la tarjeta de enganche)
  const primerAbono = abonos.length > 0 ? abonos[0] : null;
  const engancheMostrado = enganchePlan > 0 ? enganchePlan : (primerAbono ? Number(primerAbono.monto_pagado) || 0 : 0);
  
  // Total Pagado muestra TODO el dinero ingresado
  const totalPagadoMostrado = enganchePlan > 0 ? totalPagado + enganchePlan : totalPagado;

  // Calculamos la deuda basándonos en el precio de lista para que empate con lo mostrado arriba
  const baseDeuda = terreno ? Number(terreno.precio_lista) || 0 : (plan ? Number(plan.monto_total) || 0 : 0);
  const totalRestante = Math.max(0, baseDeuda - totalPagadoMostrado);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto min-h-[calc(100vh-4rem)]">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-orange-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span>Regresar al catálogo</span>
      </button>

      {/* Cabecera del Terreno */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
            terreno.estado.toLowerCase() === 'vendido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            terreno.estado.toLowerCase() === 'apartado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              terreno.estado.toLowerCase() === 'vendido' ? 'bg-emerald-500' : 
              terreno.estado.toLowerCase() === 'apartado' ? 'bg-amber-500' : 'bg-blue-500'
            }`}></span>
            {terreno.estado.toUpperCase()}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Lote {terreno.clave}</h1>
        {terreno.nombre && <p className="text-lg text-neutral-500 mb-6">{terreno.nombre}</p>}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-neutral-100">
          <div>
            <span className="block text-sm font-medium text-neutral-400 mb-1">Superficie</span>
            <span className="text-lg font-semibold text-neutral-800">{Number(terreno.superficie_m2).toFixed(2)} m²</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-neutral-400 mb-1">Precio de Lista</span>
            <span className="text-lg font-semibold text-emerald-600">${terreno.precio_lista.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-neutral-400 mb-1">Propietario Actual</span>
            <span className="text-lg font-semibold text-neutral-800">{terreno.propietario || 'Sin asignar'}</span>
          </div>
        </div>
      </div>

      {/* Resumen Financiero (Solo si está vendido/tiene plan) */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <span className="text-sm font-medium text-neutral-500 mb-2 block">Total Pagado</span>
            <span className="text-3xl font-bold text-emerald-600">
              ${totalPagadoMostrado.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <span className="text-sm font-medium text-neutral-500 mb-2 block">Deuda Restante</span>
            <span className="text-3xl font-bold text-orange-600">
              ${totalRestante.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <span className="text-sm font-medium text-neutral-500 mb-2 block">Enganche Inicial</span>
            <span className="text-3xl font-bold text-neutral-800">
              ${engancheMostrado.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </span>
          </div>
        </div>
      )}

      {/* Historial de Abonos */}
      {(plan || terreno.estado !== 'disponible') ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
            <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <Banknote size={20} className="text-orange-500" />
              Historial de Abonos
            </h3>
            <button 
              onClick={() => {
                if (!plan) {
                  autoGeneratePlan();
                  return;
                }
                setIsPaymentModalOpen(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-sm hover:shadow"
            >
              <PlusCircle size={16} />
              <span>Registrar Abono</span>
            </button>
          </div>
          
          {abonos.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Calendar size={48} className="text-neutral-200 mb-4" />
              <p className="text-lg font-medium text-neutral-600">Aún no hay abonos registrados</p>
              <p className="text-sm text-neutral-400 mt-1">Los pagos aparecerán aquí una vez que se registren en la sección de Pagos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Fecha de Pago</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Monto ($)</th>
                    <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {abonos.map((a) => (
                    <tr key={a.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-neutral-800">
                        {(plan?.enganche === 0 && a.id === primerAbono?.id) 
                          ? 'Enganche (Primer Pago)' 
                          : `Abono ${String(a.numero_abono || 1).padStart(2, '0')}`}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">
                        {new Date(a.fecha_pago).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        ${a.monto_pagado.toLocaleString('es-MX', {minimumFractionDigits: 2})} {a.moneda || 'MXN'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {a.comprobante_url ? (
                          <a 
                            href={a.comprobante_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                          >
                            Ver archivo <ExternalLink size={14} />
                          </a>
                        ) : (
                          <div className="flex justify-end items-center gap-2">
                            <span className="text-sm text-neutral-400 italic mr-2">Sin comprobante</span>
                            {uploadingAbonoId === a.id ? (
                              <Loader2 size={16} className="animate-spin text-orange-500" />
                            ) : (
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1.5 bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-orange-600 rounded-lg text-xs font-medium transition-colors">
                                <Upload size={14} />
                                Subir
                                <input 
                                  type="file" 
                                  accept="image/*,.pdf" 
                                  className="hidden" 
                                  onChange={(e) => handleFileUpload(e, a.id)}
                                />
                              </label>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 flex flex-col items-center justify-center text-center">
          <CheckCircle2 size={48} className="text-neutral-200 mb-4" />
          <h3 className="text-xl font-bold text-neutral-700 mb-2">Terreno sin ventas registradas</h3>
          <p className="text-neutral-500 max-w-md">Este terreno actualmente está libre y no cuenta con un plan de pagos activo ni un historial de abonos.</p>
        </div>
      )}

      {isPaymentModalOpen && plan && (
        <ErrorBoundary>
          <NewPaymentModal 
            onClose={() => setIsPaymentModalOpen(false)} 
            onSuccess={handlePaymentSuccess}
            initialPlanId={plan.id}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default TerrenoDetail;
