import React from 'react';
import { Search, Filter } from 'lucide-react';
import { GrupoConsorcio } from '../types/grupo';

interface MembrosFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  grupos: GrupoConsorcio[];
  filtroGrupo: string;
  onFiltroGrupoChange: (value: string) => void;
  filtroStatusPagamento: string;
  onFiltroStatusPagamentoChange: (value: string) => void;
  filtroStatusCota: string;
  onFiltroStatusCotaChange: (value: string) => void;
  filtroStatusMembro: string;
  onFiltroStatusMembroChange: (value: string) => void;
  ordenacao: string;
  onOrdenacaoChange: (value: string) => void;
}

export function MembrosFilters({
  searchTerm,
  onSearchChange,
  grupos,
  filtroGrupo,
  onFiltroGrupoChange,
  filtroStatusPagamento,
  onFiltroStatusPagamentoChange,
  filtroStatusCota,
  onFiltroStatusCotaChange,
  filtroStatusMembro,
  onFiltroStatusMembroChange,
  ordenacao,
  onOrdenacaoChange
}: MembrosFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
      <div className="flex flex-col space-y-4">
        {/* Primeira linha: Busca e Ordenação */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Campo de busca */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Ordenação */}
          <select
            value={ordenacao}
            onChange={(e) => onOrdenacaoChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="nome_asc">Nome (A-Z)</option>
            <option value="nome_desc">Nome (Z-A)</option>
            <option value="data_cadastro_desc">Mais recentes</option>
            <option value="data_cadastro_asc">Mais antigos</option>
            <option value="status_pagamento">Status de pagamento</option>
            <option value="grupos_count">Número de grupos</option>
          </select>
        </div>

        {/* Segunda linha: Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtro por grupo */}
          <select
            value={filtroGrupo}
            onChange={(e) => onFiltroGrupoChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os grupos</option>
            {grupos.map(grupo => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome_grupo}
              </option>
            ))}
          </select>
          
          {/* Filtro por status de membro */}
          <select
            value={filtroStatusMembro}
            onChange={(e) => onFiltroStatusMembroChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Status do membro</option>
            <option value="PRE_CADASTRO">Pré-cadastro</option>
            <option value="CADASTRO_COMPLETO">Cadastro completo</option>
          </select>
          
          {/* Filtro por status de pagamento */}
          <select
            value={filtroStatusPagamento}
            onChange={(e) => onFiltroStatusPagamentoChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Status pagamento</option>
            <option value="em_dia">Em dia</option>
            <option value="atencao">Atenção</option>
            <option value="atrasado">Em atraso</option>
            <option value="inadimplente">Inadimplente</option>
          </select>
          
          {/* Filtro por status da cota */}
          <select
            value={filtroStatusCota}
            onChange={(e) => onFiltroStatusCotaChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Status da cota</option>
            <option value="nao_contemplado">Não contemplado</option>
            <option value="contemplado">Contemplado</option>
          </select>
        </div>
      </div>
    </div>
  );
}