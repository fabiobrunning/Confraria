import React from 'react';
import { Calendar, DollarSign, Users, Target, Edit, Trash2 } from 'lucide-react';
import { GrupoConsorcio } from '../types/grupo';

interface GrupoCardProps {
  grupo: GrupoConsorcio;
  onEdit: (grupo: GrupoConsorcio) => void;
  onDelete: (id: string) => void;
}

export function GrupoCard({ grupo, onEdit, onDelete }: GrupoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AGUARDANDO_SORTEIOS':
        return 'bg-blue-100 text-blue-800';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-800';
      case 'FINALIZADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, sorteiosRealizados: number) => {
    switch (status) {
      case 'AGUARDANDO_SORTEIOS':
        return 'Aguardando sorteios';
      case 'EM_ANDAMENTO':
        return `Em andamento - ${sorteiosRealizados} sorteios realizados`;
      case 'FINALIZADO':
        return 'Finalizado';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
            {grupo.nome_grupo}
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-0">Grupo #{grupo.numero_grupo}</p>
        </div>
        <div className="flex space-x-1 md:space-x-2 self-end md:self-start">
          <button
            onClick={() => onEdit(grupo)}
            className="p-2 text-gray-400 hover:text-yellow-600 transition-colors touch-manipulation"
            title="Editar grupo"
          >
            <Edit className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => onDelete(grupo.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors touch-manipulation"
            title="Excluir grupo"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(grupo.status_grupo)}`}>
          {getStatusText(grupo.status_grupo, grupo.sorteios_realizados)}
        </span>
      </div>

      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center text-sm md:text-base text-gray-600">
          <Target className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="font-medium">{grupo.nome_bem}</span>
        </div>

        <div className="flex items-center text-sm md:text-base text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span>Valor: {formatCurrency(grupo.valor_bem)}</span>
        </div>

        <div className="flex items-center text-sm md:text-base text-gray-600">
          <Users className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span>{grupo.quantidade_cotas} cotas - {formatCurrency(grupo.valor_parcela)}/mês</span>
        </div>

        <div className="flex items-center text-sm md:text-base text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span>Início: {formatDate(grupo.data_inicio)}</span>
        </div>
      </div>

      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
          <div className="flex justify-between">
          <span className="text-gray-600">Sorteios realizados:</span>
          <span className="font-medium text-gray-900">{grupo.sorteios_realizados}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sorteios restantes:</span>
            <span className="font-medium text-gray-900">{grupo.sorteios_restantes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}