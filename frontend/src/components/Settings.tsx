import React, { useState, useEffect } from 'react';
import { Building2, Gavel, RefreshCw, AlertTriangle, Map, Plus, Users, UserPlus, CheckCircle2, Save, Loader2, Layers, X } from 'lucide-react';
import { api, type Parcela, type Usuario } from '../lib/api';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'equipo'>('general');
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [newParcelaName, setNewParcelaName] = useState('');
  const [newParcelaDesc, setNewParcelaDesc] = useState('');
  const [loadingParcela, setLoadingParcela] = useState(false);

  // Estado general de configuración
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Perfil de Empresa
  const [razonSocial, setRazonSocial] = useState('Loterra');
  const [rfc, setRfc] = useState('LOTT-2023-XYZ');
  const [direccionFiscal, setDireccionFiscal] = useState('124 Golden Dune Blvd, Suite 400');
  const [emailSoporte, setEmailSoporte] = useState('admin@saharalands.com');
  const [telefonoContacto, setTelefonoContacto] = useState('+1 (555) 019-2834');
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [perfilMsg, setPerfilMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reglas de Negocio
  const [porcentajeMora, setPorcentajeMora] = useState('15.0');
  const [permitirDiasGracia, setPermitirDiasGracia] = useState(true);
  const [savingReglas, setSavingReglas] = useState(false);
  const [reglasMsg, setReglasMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Comisiones por Parcela
  const [parcelasComisiones, setParcelasComisiones] = useState<Record<string, string>>({});
  const [savingParcelaId, setSavingParcelaId] = useState<string | null>(null);
  const [parcelasMsg, setParcelasMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
  const [newParcelaComision, setNewParcelaComision] = useState('6.75');

  // Tipo de Cambio
  const [tipoCambioUsd, setTipoCambioUsd] = useState('18.50');
  const [tipoCambioActualizadoAt, setTipoCambioActualizadoAt] = useState('');
  const [savingTipoCambio, setSavingTipoCambio] = useState(false);
  const [tipoCambioMsg, setTipoCambioMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Equipo
  const [equipo, setEquipo] = useState<Usuario[]>([]);
  const [loadingEquipo, setLoadingEquipo] = useState(false);
  const [showNewVendedorModal, setShowNewVendedorModal] = useState(false);

  // Nuevo Vendedor
  const [nvNombre, setNvNombre] = useState('');
  const [nvEmail, setNvEmail] = useState('');
  const [nvPassword, setNvPassword] = useState('');
  const [nvRol, setNvRol] = useState('vendedor');
  const [nvParcelaIds, setNvParcelaIds] = useState<string[]>([]);
  const [nvLoading, setNvLoading] = useState(false);
  const [nvError, setNvError] = useState('');
  const [nvSuccess, setNvSuccess] = useState(false);

  // Asignación de Parcelas a Vendedor
  const [assignModalUser, setAssignModalUser] = useState<Usuario | null>(null);
  const [selectedParcelasForUser, setSelectedParcelasForUser] = useState<string[]>([]);
  const [savingParcelasAssignment, setSavingParcelasAssignment] = useState(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadParcelas();
    loadConfiguracion();
    if (activeTab === 'equipo') {
      loadEquipo();
    }
  }, [activeTab]);

  const fetchLiveExchangeRate = async (): Promise<number> => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data?.rates?.MXN) {
          return Number(data.rates.MXN);
        }
      }
    } catch (err) {
      console.warn('Fallo exchangerate-api, usando fallback...', err);
    }
    const resFallback = await fetch('https://open.er-api.com/v6/latest/USD');
    const dataFallback = await resFallback.json();
    if (dataFallback?.rates?.MXN) {
      return Number(dataFallback.rates.MXN);
    }
    throw new Error('No se pudo obtener el tipo de cambio del mercado');
  };

  const syncTipoCambioHoy = async (forceNotify = false) => {
    setSavingTipoCambio(true);
    if (forceNotify) setTipoCambioMsg(null);
    try {
      const liveRate = await fetchLiveExchangeRate();
      const formattedRate = liveRate.toFixed(2);
      setTipoCambioUsd(formattedRate);

      const updated = await api.configuracion.update({
        tipo_cambio_usd: Number(formattedRate),
      });
      const updatedDate = updated?.tipo_cambio_actualizado_at || new Date().toISOString();
      setTipoCambioActualizadoAt(updatedDate);

      if (forceNotify) {
        setTipoCambioMsg({
          type: 'success',
          text: `¡Tipo de cambio actualizado automáticamente con el mercado de hoy ($${formattedRate} MXN)!`
        });
        setTimeout(() => setTipoCambioMsg(null), 4000);
      }
      return Number(formattedRate);
    } catch (err: any) {
      console.error('Error al sincronizar tipo de cambio:', err);
      if (forceNotify) {
        setTipoCambioMsg({
          type: 'error',
          text: err.message || 'No fue posible consultar el tipo de cambio de hoy'
        });
      }
    } finally {
      setSavingTipoCambio(false);
    }
  };

  const loadConfiguracion = async () => {
    try {
      setLoadingConfig(true);
      const data = await api.configuracion.get();
      if (data) {
        setRazonSocial(data.razon_social || '');
        setRfc(data.rfc || '');
        setDireccionFiscal(data.direccion_fiscal || '');
        setEmailSoporte(data.email_soporte || '');
        setTelefonoContacto(data.telefono_contacto || '');
        setPorcentajeMora(data.porcentaje_mora !== undefined ? String(data.porcentaje_mora) : '15.0');
        setPermitirDiasGracia(data.permitir_dias_gracia ?? true);

        if (data.tipo_cambio_usd !== undefined) {
          setTipoCambioUsd(String(data.tipo_cambio_usd));
        }
        if (data.tipo_cambio_actualizado_at) {
          setTipoCambioActualizadoAt(data.tipo_cambio_actualizado_at);
        }

        if (data.razon_social) {
          localStorage.setItem('company_name', data.razon_social);
        }

        // Si no se ha actualizado hoy o no existe valor, sincronizar automáticamente
        const hoyStr = new Date().toISOString().split('T')[0];
        const lastUpdatedDateStr = data.tipo_cambio_actualizado_at
          ? new Date(data.tipo_cambio_actualizado_at).toISOString().split('T')[0]
          : '';

        if (lastUpdatedDateStr !== hoyStr || !data.tipo_cambio_usd) {
          syncTipoCambioHoy(false);
        }
      } else {
        syncTipoCambioHoy(false);
      }
    } catch (err: any) {
      console.error('Error cargando configuración:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const loadParcelas = async () => {
    try {
      const data = await api.parcelas.getAll();
      setParcelas(data);
      const comMap: Record<string, string> = {};
      (data || []).forEach(p => {
        comMap[p.id] = p.comision_base !== undefined ? String(p.comision_base) : '6.75';
      });
      setParcelasComisiones(comMap);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateParcelaComision = async (parcelaId: string) => {
    const val = parseFloat(parcelasComisiones[parcelaId]);
    if (isNaN(val) || val < 0) {
      alert('Ingresa una comisión válida (mayor o igual a 0%)');
      return;
    }
    const target = parcelas.find(p => p.id === parcelaId);
    if (!target) return;

    try {
      setSavingParcelaId(parcelaId);
      setParcelasMsg(null);
      await api.parcelas.update(parcelaId, {
        nombre: target.nombre,
        descripcion: target.descripcion,
        comision_base: val,
      });
      setParcelasMsg({ id: parcelaId, type: 'success', text: '¡Comisión actualizada!' });
      setTimeout(() => setParcelasMsg(null), 3000);
      await loadParcelas();
    } catch (err: any) {
      setParcelasMsg({ id: parcelaId, type: 'error', text: err.message || 'Error al guardar comisión' });
    } finally {
      setSavingParcelaId(null);
    }
  };

  const loadEquipo = async () => {
    try {
      setLoadingEquipo(true);
      const data = await api.usuarios.getAll();
      setEquipo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEquipo(false);
    }
  };

  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPerfil(true);
    setPerfilMsg(null);
    try {
      const updated = await api.configuracion.update({
        razon_social: razonSocial,
        rfc: rfc,
        direccion_fiscal: direccionFiscal,
        email_soporte: emailSoporte,
        telefono_contacto: telefonoContacto,
      });
      localStorage.setItem('company_name', updated.razon_social);
      window.dispatchEvent(new CustomEvent('company_updated', { detail: updated.razon_social }));
      setPerfilMsg({ type: 'success', text: '¡Perfil guardado correctamente!' });
      setTimeout(() => setPerfilMsg(null), 4000);
    } catch (err: any) {
      setPerfilMsg({ type: 'error', text: err.message || 'Error al guardar perfil' });
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleSaveReglas = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReglas(true);
    setReglasMsg(null);
    try {
      await api.configuracion.update({
        porcentaje_mora: parseFloat(porcentajeMora) || 0,
        permitir_dias_gracia: permitirDiasGracia,
      });
      setReglasMsg({ type: 'success', text: '¡Reglas de negocio actualizadas!' });
      setTimeout(() => setReglasMsg(null), 4000);
    } catch (err: any) {
      setReglasMsg({ type: 'error', text: err.message || 'Error al guardar reglas' });
    } finally {
      setSavingReglas(false);
    }
  };

  const handleCreateParcela = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParcelaName) return;
    setLoadingParcela(true);
    try {
      const comVal = parseFloat(newParcelaComision);
      await api.parcelas.create({
        nombre: newParcelaName,
        descripcion: newParcelaDesc,
        comision_base: isNaN(comVal) ? 6.75 : comVal
      });
      setNewParcelaName('');
      setNewParcelaDesc('');
      setNewParcelaComision('6.75');
      await loadParcelas();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingParcela(false);
    }
  };

  const handleCreateVendedor = async (e: React.FormEvent) => {
    e.preventDefault();
    setNvError('');
    setNvSuccess(false);
    setNvLoading(true);
    try {
      await api.usuarios.createVendedor({
        nombre: nvNombre,
        email: nvEmail,
        password: nvPassword,
        rol: nvRol,
        parcela_ids: nvRol === 'vendedor' ? nvParcelaIds : [],
      });
      setNvSuccess(true);
      setNvNombre('');
      setNvEmail('');
      setNvPassword('');
      setNvParcelaIds([]);
      await loadEquipo();
      setTimeout(() => {
        setShowNewVendedorModal(false);
        setNvSuccess(false);
      }, 2000);
    } catch (err: any) {
      setNvError(err.message || 'Error al crear el vendedor');
    } finally {
      setNvLoading(false);
    }
  };

  const handleOpenAssignModal = (u: Usuario) => {
    setAssignModalUser(u);
    setSelectedParcelasForUser(u.parcelas_asignadas || []);
    setAssignSuccessMsg(null);
  };

  const toggleParcelaForUser = (pId: string) => {
    setSelectedParcelasForUser(prev =>
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  const toggleSelectAllParcelas = () => {
    if (selectedParcelasForUser.length === parcelas.length) {
      setSelectedParcelasForUser([]);
    } else {
      setSelectedParcelasForUser(parcelas.map(p => p.id));
    }
  };

  const handleSaveUserParcelas = async () => {
    if (!assignModalUser) return;
    setSavingParcelasAssignment(true);
    try {
      await api.usuarios.assignParcelas(assignModalUser.id, selectedParcelasForUser);
      setAssignSuccessMsg('¡Parcelas asignadas correctamente!');
      await loadEquipo();
      setTimeout(() => {
        setAssignModalUser(null);
        setAssignSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error al guardar asignación');
    } finally {
      setSavingParcelasAssignment(false);
    }
  };

  const toggleNvParcela = (pId: string) => {
    setNvParcelaIds(prev =>
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  const formatFechaTipoCambio = (dateStr: string) => {
    if (!dateStr) return 'Pendiente de sincronizar';
    try {
      const d = new Date(dateStr);
      const hoy = new Date();
      const isHoy = d.toDateString() === hoy.toDateString();
      const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      if (isHoy) {
        return `Hoy a las ${hora}`;
      }
      return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="settings-container">
      <div className="settings-header">
        <h2 className="settings-title">Configuración del Sistema</h2>
        <p className="settings-subtitle">Administra los detalles de la organización, reglas de negocio y equipo de ventas.</p>
      </div>

      <div className="flex border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general' ? 'border-orange-500 text-orange-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
        >
          Ajustes Generales
        </button>
        <button
          onClick={() => setActiveTab('equipo')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'equipo' ? 'border-orange-500 text-orange-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
        >
          <Users size={16} />
          Equipo de Ventas
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="settings-content">
          <div className="settings-left-column">
            {/* Company Profile Card */}
            <div className="card settings-card">
              <div className="card-header">
                <Building2 size={20} className="card-icon" />
                <h3 className="card-title">Perfil de Empresa</h3>
              </div>

              <form onSubmit={handleSavePerfil}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Razón Social</label>
                    <input
                      type="text"
                      value={razonSocial}
                      onChange={e => setRazonSocial(e.target.value)}
                      className="form-input"
                      placeholder="Nombre de la empresa"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tax ID / RFC</label>
                    <input
                      type="text"
                      value={rfc}
                      onChange={e => setRfc(e.target.value)}
                      className="form-input"
                      placeholder="RFC o Tax ID"
                    />
                  </div>
                </div>

                <div className="form-group mt-4">
                  <label>Dirección Fiscal</label>
                  <input
                    type="text"
                    value={direccionFiscal}
                    onChange={e => setDireccionFiscal(e.target.value)}
                    className="form-input"
                    placeholder="Dirección fiscal completa"
                  />
                </div>

                <div className="form-grid mt-4">
                  <div className="form-group">
                    <label>Email de Soporte</label>
                    <input
                      type="email"
                      value={emailSoporte}
                      onChange={e => setEmailSoporte(e.target.value)}
                      className="form-input"
                      placeholder="correo@empresa.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={telefonoContacto}
                      onChange={e => setTelefonoContacto(e.target.value)}
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {perfilMsg && (
                  <div className={`feedback-msg mt-4 ${perfilMsg.type}`}>
                    {perfilMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{perfilMsg.text}</span>
                  </div>
                )}

                <div className="form-actions mt-6">
                  <button type="submit" className="btn-primary" disabled={savingPerfil || loadingConfig}>
                    {savingPerfil ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Guardar Perfil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Business Rules Card */}
            <div className="card settings-card">
              <div className="card-header">
                <Gavel size={20} className="card-icon" />
                <div>
                  <h3 className="card-title">Reglas de Negocio y Comisiones</h3>
                  <p className="card-desc mb-0">Configura comisiones personalizadas por parcela y penalizaciones de mora.</p>
                </div>
              </div>

              {/* Comisiones por Parcela */}
              <div className="mb-6 p-4 bg-orange-50/40 rounded-xl border border-orange-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Comisión de Ventas por Parcela
                    </span>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Define el porcentaje de comisión para asesores y reportes aplicable a cada desarrollo individualmente.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {parcelas.map(p => {
                    const currentVal = parcelasComisiones[p.id] ?? (p.comision_base !== undefined ? String(p.comision_base) : '6.75');
                    const isSavingThis = savingParcelaId === p.id;
                    const thisMsg = parcelasMsg?.id === p.id ? parcelasMsg : null;
                    return (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-neutral-200 shadow-xs">
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 text-sm truncate">{p.nombre}</p>
                          <p className="text-xs text-neutral-400 truncate">{p.descripcion || 'Sin descripción'}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                            <span className="text-xs text-neutral-500 font-medium">Comisión:</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={currentVal}
                              onChange={e => setParcelasComisiones(prev => ({ ...prev, [p.id]: e.target.value }))}
                              className="w-16 text-right font-bold text-neutral-900 outline-none text-sm bg-transparent"
                            />
                            <span className="text-xs font-semibold text-neutral-500">%</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateParcelaComision(p.id)}
                            disabled={isSavingThis}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                          >
                            {isSavingThis ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Save size={13} />
                            )}
                            <span>{isSavingThis ? 'Guardando...' : 'Guardar'}</span>
                          </button>
                        </div>
                        {thisMsg && (
                          <div className={`text-xs flex items-center gap-1 mt-1 sm:mt-0 ${thisMsg.type === 'success' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}`}>
                            {thisMsg.type === 'success' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                            <span>{thisMsg.text}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {parcelas.length === 0 && (
                    <p className="text-xs text-neutral-500 italic p-3 bg-white rounded-lg border border-dashed border-neutral-200 text-center">
                      No hay parcelas creadas todavía. Regístralas en la sección de Gestión de Parcelas.
                    </p>
                  )}
                </div>
              </div>

              {/* Mora y Días de Gracia */}
              <form onSubmit={handleSaveReglas}>
                <div className="rules-grid">
                  <div className="rule-box">
                    <div className="rule-header">
                      <span className="rule-title">Porcentaje de Mora</span>
                      <AlertTriangle size={14} className="text-alert" />
                    </div>
                    <p className="rule-desc">Tasa de penalización aplicada a pagos vencidos.</p>
                    <div className="rule-input-wrapper">
                      <input
                        type="number"
                        step="0.01"
                        value={porcentajeMora}
                        onChange={e => setPorcentajeMora(e.target.value)}
                        className="rule-input"
                        required
                      />
                      <span className="rule-suffix">%</span>
                    </div>
                  </div>

                  <div className="rule-box">
                    <div className="rule-header">
                      <span className="rule-title">Días de Gracia</span>
                      <span className="rule-symbol">Días</span>
                    </div>
                    <p className="rule-desc">Margen de tolerancia antes de computar recargos por mora.</p>
                    <div className="rule-input-wrapper">
                      <span className="text-sm font-semibold text-neutral-700">5 días hábiles</span>
                    </div>
                  </div>
                </div>

                <div className="toggle-row mt-6">
                  <div className="toggle-info">
                    <span className="toggle-title">Permitir Días de Gracia</span>
                    <span className="toggle-desc">Habilitar un periodo de gracia estándar de 5 días antes de aplicar mora.</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={permitirDiasGracia}
                      onChange={e => setPermitirDiasGracia(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {reglasMsg && (
                  <div className={`feedback-msg mt-4 ${reglasMsg.type}`}>
                    {reglasMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    <span>{reglasMsg.text}</span>
                  </div>
                )}

                <div className="form-actions mt-6">
                  <button type="submit" className="btn-primary" disabled={savingReglas || loadingConfig}>
                    {savingReglas ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Guardar Reglas de Mora</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="settings-right-column">
            {/* Exchange Rate Card (Automático) */}
            <div className="card settings-card">
              <div className="card-header">
                <RefreshCw size={20} className="card-icon" />
                <div>
                  <h3 className="card-title">Tipo de Cambio Automático</h3>
                  <p className="card-desc mb-0">
                    Sincronizado automáticamente al día de hoy según el mercado internacional de divisas (USD / MXN).
                  </p>
                </div>
              </div>

              <div className="exchange-wrapper">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Tasa Oficial del Día
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Automático (Hoy)
                  </span>
                </div>

                <div className="exchange-box">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-neutral-500">1 USD =</span>
                    <span className="text-2xl font-bold text-neutral-900 tracking-tight">
                      ${tipoCambioUsd || '18.73'}
                    </span>
                    <span className="text-sm font-semibold text-neutral-500">MXN</span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full text-xs text-neutral-500 px-1">
                  <span>Última sincronización:</span>
                  <span className="font-medium text-neutral-700">
                    {formatFechaTipoCambio(tipoCambioActualizadoAt)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => syncTipoCambioHoy(true)}
                  disabled={savingTipoCambio || loadingConfig}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                  <RefreshCw size={15} className={savingTipoCambio ? 'animate-spin' : ''} />
                  <span>{savingTipoCambio ? 'Sincronizando con el mercado...' : 'Sincronizar tipo de cambio ahora'}</span>
                </button>

                {tipoCambioMsg && (
                  <div className={`feedback-msg w-full ${tipoCambioMsg.type}`}>
                    {tipoCambioMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <span>{tipoCambioMsg.text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parcelas Card */}
            <div className="card settings-card">
              <div className="card-header">
                <Map size={20} className="card-icon" />
                <h3 className="card-title">Gestión de Parcelas</h3>
              </div>
              <p className="card-desc mb-4">Administra las parcelas donde se agrupan los terrenos y ventas.</p>

              <div className="space-y-3 mb-6">
                {parcelas.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-neutral-900 text-sm">{p.nombre}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                          {p.comision_base !== undefined ? p.comision_base : 6.75}% com.
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">{p.descripcion || 'Sin descripción'}</p>
                    </div>
                    <span className="text-xs font-medium text-neutral-400">ID: {p.id.split('-')[0]}...</span>
                  </div>
                ))}
                {parcelas.length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-2">No hay parcelas creadas.</p>
                )}
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <h4 className="text-sm font-medium text-neutral-900 mb-3">Registrar Nueva Parcela</h4>
                <form onSubmit={handleCreateParcela} className="space-y-3">
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Nombre de la parcela (Ej. Villa del Sol)"
                      className="form-input"
                      value={newParcelaName}
                      onChange={e => setNewParcelaName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      className="form-input"
                      value={newParcelaDesc}
                      onChange={e => setNewParcelaDesc(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-xs text-neutral-500 font-medium mb-1 block">Comisión Base para esta Parcela (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="6.75"
                      className="form-input"
                      value={newParcelaComision}
                      onChange={e => setNewParcelaComision(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingParcela || !newParcelaName}
                    className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl font-medium transition-colors border border-orange-200 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    <span>{loadingParcela ? 'Creando...' : 'Crear Parcela'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'equipo' && (
        <div className="card settings-card max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="card-header mb-0">
              <Users size={20} className="card-icon" />
              <h3 className="card-title">Directorio del Equipo</h3>
            </div>
            <button
              onClick={() => setShowNewVendedorModal(true)}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              Añadir Usuario
            </button>
          </div>

          <p className="card-desc mb-6">
            Los usuarios que añadas aquí podrán iniciar sesión en la plataforma. Los Administradores tienen acceso total, y los Vendedores solo a los terrenos asignados.
          </p>

          {loadingEquipo ? (
            <p className="text-sm text-neutral-500 py-4 text-center">Cargando directorio...</p>
          ) : equipo.filter(u => u.rol === 'vendedor').length === 0 ? (
            <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-100">
              <Users size={32} className="mx-auto text-neutral-300 mb-3" />
              <h4 className="text-neutral-700 font-medium mb-1">Aún no hay vendedores</h4>
              <p className="text-neutral-500 text-sm">Haz clic en Añadir Usuario para crear la primera cuenta.</p>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nombre Completo</th>
                    <th className="px-4 py-3 font-medium">Correo Electrónico</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Parcelas Asignadas</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {equipo.map(u => {
                    const assignedParcelas = parcelas.filter(p => (u.parcelas_asignadas || []).includes(p.id));
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium text-neutral-900">{u.nombre_completo || u.nombre}</td>
                        <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${u.rol === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                            {u.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.rol === 'admin' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              Todas las parcelas (Admin)
                            </span>
                          ) : assignedParcelas.length === 0 ? (
                            <span className="text-xs text-neutral-400 italic">Sin parcelas asignadas</span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {assignedParcelas.map(p => (
                                <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                  {p.nombre}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Activo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.rol === 'vendedor' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white transition-colors shadow-sm"
                              title="Asignar Parcelas a este vendedor"
                            >
                              <Layers size={13} />
                              <span>Asignar Parcelas</span>
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal para Nuevo Vendedor */}
      {showNewVendedorModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="text-xl font-bold text-neutral-900">Añadir Usuario</h3>
              <p className="text-sm text-neutral-500 mt-1">Crea una cuenta nueva para tu equipo.</p>
            </div>

            <form onSubmit={handleCreateVendedor} className="p-6 space-y-4">
              {nvError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {nvError}
                </div>
              )}
              {nvSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Usuario creado correctamente. Redirigiendo...
                </div>
              )}

              <div className="form-group">
                <label>Rol en el sistema</label>
                <select
                  value={nvRol}
                  onChange={(e) => setNvRol(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  <option value="vendedor">Vendedor (Acceso restringido)</option>
                  <option value="admin">Administrador (Acceso total)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nvNombre}
                  onChange={(e) => setNvNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={nvEmail}
                  onChange={(e) => setNvEmail(e.target.value)}
                  placeholder="juan@empresa.com"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="form-group">
                <label>Contraseña Temporal</label>
                <input
                  type="password"
                  required
                  value={nvPassword}
                  onChange={(e) => setNvPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <p className="text-xs text-neutral-500 mt-1">Comparte esta contraseña con el usuario para que pueda iniciar sesión.</p>
              </div>

              {nvRol === 'vendedor' && (
                <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/70">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider block">
                      Asignar Parcelas ({nvParcelaIds.length} seleccionadas)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (nvParcelaIds.length === parcelas.length) {
                          setNvParcelaIds([]);
                        } else {
                          setNvParcelaIds(parcelas.map(p => p.id));
                        }
                      }}
                      className="text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      {nvParcelaIds.length === parcelas.length ? 'Deseleccionar todas' : 'Todas'}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">
                    El vendedor solo podrá ver y operar en las parcelas marcadas:
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {parcelas.map(p => {
                      const isChecked = nvParcelaIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleNvParcela(p.id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${isChecked ? 'bg-white border-orange-500 text-neutral-900 font-medium shadow-xs' : 'bg-white/60 border-neutral-200 text-neutral-600 hover:bg-white'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => { }}
                            className="w-3.5 h-3.5 text-orange-600 rounded border-neutral-300 focus:ring-orange-500 pointer-events-none"
                          />
                          <span className="flex-1">{p.nombre}</span>
                          <span className="text-[10px] text-neutral-400">{p.comision_base ?? 6.75}%</span>
                        </div>
                      );
                    })}
                    {parcelas.length === 0 && (
                      <p className="text-xs text-neutral-400 italic">No hay parcelas creadas aún.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowNewVendedorModal(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={nvLoading || nvSuccess}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {nvLoading ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Asignar Parcelas a Vendedor */}
      {assignModalUser && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Layers className="text-orange-600" size={20} />
                  Asignar Parcelas
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Vendedor: <strong className="text-neutral-800">{assignModalUser.nombre_completo || assignModalUser.nombre || assignModalUser.email}</strong>
                </p>
              </div>
              <button
                onClick={() => setAssignModalUser(null)}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Parcelas Disponibles ({selectedParcelasForUser.length} de {parcelas.length} seleccionadas)
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAllParcelas}
                  className="text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  {selectedParcelasForUser.length === parcelas.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>

              <p className="text-xs text-neutral-500 mb-4">
                El vendedor solo podrá ver y trabajar en las parcelas que le asignes. Dentro de las parcelas asignadas, podrá consultar todos los terrenos.
              </p>

              {parcelas.length === 0 ? (
                <p className="text-sm text-neutral-400 py-4 text-center">No hay parcelas creadas en el sistema.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {parcelas.map(p => {
                    const isChecked = selectedParcelasForUser.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleParcelaForUser(p.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isChecked
                          ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                          : 'border-neutral-200 hover:bg-neutral-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => { }}
                            className="w-4 h-4 text-orange-600 rounded border-neutral-300 focus:ring-orange-500 pointer-events-none"
                          />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{p.nombre}</p>
                            <p className="text-xs text-neutral-500">{p.descripcion || 'Sin descripción'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                          {p.comision_base ?? 6.75}% com.
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {assignSuccessMsg && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {assignSuccessMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setAssignModalUser(null)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingParcelasAssignment}
                  onClick={handleSaveUserParcelas}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {savingParcelasAssignment ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Guardar Asignación</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
