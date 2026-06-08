import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle size={20} />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <button 
            onClick={onCancel} 
            className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-neutral-600 text-base">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 bg-neutral-50/80 border-t border-neutral-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200 bg-neutral-100 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
