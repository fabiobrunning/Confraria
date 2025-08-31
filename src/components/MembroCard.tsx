import React from 'react';
import { User, Phone, FileText, Building, MapPin, Edit, Trash2, CheckCircle, Clock, Trophy } from 'lucide-react';
import { Membro } from '../types/membro';
import { StatusBadge } from './StatusBadge';

interface MembroCardProps {
  membro: Membro;
  statusPagamentos?: { [grupoId: string]: 'em_dia' | 'atrasado' | 'inadimplente' | 'atencao' };
  onEdit: (membro: Membro) => void;
  onDelete: (id: string) => void;
  onCompleteCadastro: (id: string) => void;
  onViewDetails?: (membro: Membro) => void;
}

export function MembroCard({ 
  membro, 
  statusPagamentos, 
  onEdit, 
  onDelete, 
  onCompleteCadastro,
  onViewDetails 
}: MembroCardProps) {
  const formatTelefone = (telefone: string) => {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getStatusGeralPagamento = () => {
    if (!statusPagamentos || Object.keys(statusPagamentos).length === 0) {
      return 'em_dia';
    }
    
    const statuses = Object.values(statusPagamentos);
    if (statuses.some(s => s === 'inadimplente')) return 'inadimplente';
    if (statuses.some(s => s === 'atrasado')) return 'atrasado';
    if (statuses.some(s => s === 'atencao')) return 'atencao';
    return 'em_dia';
  };

  const getStatusGeralTexto = (status: string) => {
    switch (status) {
      case 'em_dia': return 'Em dia';
      case 'atencao': return 'Atenção';
      case 'atrasado': return 'Em atraso';
      case 'inadimplente': return 'Inadimplente';
      default: return 'Em dia';
    }
  };

  const getStatusGeralCor = (status: string) => {
    switch (status) {
      case 'em_dia': return 'bg-green-500';
      case 'atencao': return 'bg-yellow-500';
      case 'atrasado': return 'bg-orange-500';
      case 'inadimplente': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  const statusGeral = getStatusGeralPagamento();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header com nome, telefone e status geral */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
            {membro.nome_completo || membro.nome}
          </h3>
          <p className="text-gray-600 text-sm md:text-base flex items-center">
            <Phone className="w-4 h-4 mr-1 flex-shrink-0" />
            {formatTelefone(membro.telefone.replace(/\D/g, ''))}
          </p>
        </div>
        
        {/* Status geral de pagamento */}
        <div className="flex items-center ml-4">
          <span className={`w-3 h-3 ${getStatusGeralCor(statusGeral)} rounded-full mr-2 flex-shrink-0`}></span>
          <span className="text-sm text-gray-700 whitespace-nowrap">{getStatusGeralTexto(statusGeral)}</span>
        </div>
      </div>

      {/* Status do membro */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            membro.status_membro === 'PRE_CADASTRO' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {membro.status_membro === 'PRE_CADASTRO' ? 'Pré-cadastro' : 'Cadastro completo'}
          </span>
          
          {membro.cotas?.some(cota => cota.status_cota === 'CONTEMPLADA') && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <Trophy className="w-3 h-3 mr-1 flex-shrink-0" />
              Contemplado
            </span>
          )}
        </div>
      </div>

      {/* Grupos e status */}
      {membro.cotas && membro.cotas.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-sm font-medium text-gray-700">Grupos:</h4>
          
          {membro.cotas.map((cota, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 block truncate">
                    {cota.nome_grupo || `Grupo ${cota.grupo_id.slice(0, 8)}`}
                  </span>
                  <span className="text-sm text-gray-600">Cota: {cota.numero_cota}</span>
                </div>
                
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {/* Status da cota - QUADRADO */}
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-sm mr-1 flex-shrink-0 ${
                      cota.status_cota === 'CONTEMPLADA' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-xs whitespace-nowrap ${
                      cota.status_cota === 'CONTEMPLADA' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {cota.status_cota === 'CONTEMPLADA' ? 'Contemplado' : 'Não contemplado'}
                    </span>
                  </div>
                  
                  {/* Status de pagamento - CÍRCULO */}
                  {statusPagamentos && statusPagamentos[cota.grupo_id] && (
                    <div className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-1 flex-shrink-0 ${
                        getStatusGeralCor(statusPagamentos[cota.grupo_id])
                      }`}></span>
                      <span className={`text-xs whitespace-nowrap ${
                        statusPagamentos[cota.grupo_id] === 'em_dia' ? 'text-green-700' :
                        statusPagamentos[cota.grupo_id] === 'atencao' ? 'text-yellow-700' :
                        statusPagamentos[cota.grupo_id] === 'atrasado' ? 'text-orange-700' :
                        'text-red-700'
                      }`}>
                        {getStatusGeralTexto(statusPagamentos[cota.grupo_id])}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Informações adicionais */}
      {(membro.cpf || membro.endereco || (membro.empresas && membro.empresas.length > 0)) && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            {membro.cpf && (
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>CPF: {membro.cpf}</span>
              </div>
            )}
            
            {membro.endereco && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{membro.endereco.cidade}, {membro.endereco.estado}</span>
              </div>
            )}
            
            {membro.empresas && membro.empresas.length > 0 && (
              <div className="flex items-center md:col-span-2">
                <Building className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{membro.empresas.length} empresa{membro.empresas.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col md:flex-row gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => onViewDetails && onViewDetails(membro)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Ver Detalhes
        </button>
        <button
          onClick={() => onEdit(membro)}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
        >
          Editar
        </button>
        
        {/* Ações adicionais em dropdown ou botões menores */}
        <div className="flex gap-1 md:gap-2">
          {membro.status_membro === 'PRE_CADASTRO' && (
            <button
              onClick={() => onCompleteCadastro(membro.id)}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
              title="Completar cadastro"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(membro.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Excluir membro"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}