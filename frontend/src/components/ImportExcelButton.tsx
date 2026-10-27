import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

interface ImportExcelButtonProps {
  parcelaId?: string;
  onSuccess?: () => void;
}

export default function ImportExcelButton({ parcelaId, onSuccess }: ImportExcelButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    const activeParcelaId = parcelaId || localStorage.getItem('selected_parcela') || '';
    if (activeParcelaId) {
      formData.append("parcela_id", activeParcelaId);
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      if (activeParcelaId) {
        headers['X-Parcela-Id'] = activeParcelaId;
      }
      
      const endpoint = activeParcelaId 
        ? `${API_URL}/api/v1/parcelas/${activeParcelaId}/import/excel`
        : `${API_URL}/api/v1/import/excel`;
        
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: formData,
      });
      
      const result = await response.json();
      if (response.ok) {
        alert("¡Excel importado correctamente!\n" + (result.message || ''));
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload(); 
        }
      } else {
        alert("Error al importar: " + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error("Error en la subida:", error);
      alert("Hubo un error de conexión al subir el archivo.");
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button 
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 bg-white border border-orange-200 text-orange-600 px-5 py-2.5 rounded-xl font-medium hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Upload size={18} />
        )}
        <span>{isLoading ? "Subiendo..." : "Importar Excel"}</span>
      </button>
    </div>
  );
}
