import React from 'react';
import { Download, CheckCircle, X } from 'lucide-react';

interface MembrosAcoesLoteProps {
  selectedCount: number;
  onExportSelected: () => void;
  onMarkAsEmDia: () => void;
  onClearSelection: () => void;
  isVisible: boolean;
}

export function MembrosAcoesLote({
  selectedCount,
  onExportSelected,
  onMarkAsEmDia,
  onClearSelection,
  isVisible
}: MembrosAcoesLoteProps) {
  if (!isVisible) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center">
          <span className="text-sm text-blue-700 font-medium">
            {selectedCount} membro{selectedCount !== 1 ? 's' : ''} selecionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClearSelection}
            className="ml-2 text-blue-600 hover:text-blue-800"
            title="Limpar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={onExportSelected}
            className="inline-flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Selecionados
          </button>
          <button
            onClick={onMarkAsEmDia}
            className="inline-flex items-center justify-center bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marcar como Em Dia
          </button>
        </div>
      </div>
    </div>
  );
}