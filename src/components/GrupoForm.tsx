import React, { useState } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { CreateGrupoData } from '../types/grupo';

interface GrupoFormProps {
  onSubmit: (data: CreateGrupoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GrupoForm({ onSubmit, onCancel, isLoading }: GrupoFormProps) {
  const [formData, setFormData] = useState<CreateGrupoData>({
    nome_grupo: '',
    numero_grupo: 0,
    nome_bem: '',
    valor_bem: 0,
    quantidade_cotas: 0,
    valor_parcela: 0,
    data_inicio: new Date().toISOString().split('T')[0],
    sorteios_restantes: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const calcularParcela = () => {
    if (formData.valor_bem > 0 && formData.quantidade_cotas > 0) {
      const parcela = formData.valor_bem / formData.quantidade_cotas;
      setFormData(prev => ({ ...prev, valor_parcela: parcela }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Grupo de Consórcio</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Grupo *
              </label>
              <input
                type="text"
                name="nome_grupo"
                value={formData.nome_grupo}
                onChange={handleChange}
                required
                placeholder="Ex: Grupo Automóvel 2024-A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Grupo *
              </label>
              <input
                type="number"
                name="numero_grupo"
                value={formData.numero_grupo}
                onChange={handleChange}
                required
                min="1"
                placeholder="Ex: 001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome/Tipo do Bem *
              </label>
              <input
                type="text"
                name="nome_bem"
                value={formData.nome_bem}
                onChange={handleChange}
                required
                placeholder="Ex: Volkswagen Gol, Casa Popular"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Bem (R$) *
              </label>
              <input
                type="number"
                name="valor_bem"
                value={formData.valor_bem}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Ex: 45000.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Cotas *
              </label>
              <input
                type="number"
                name="quantidade_cotas"
                value={formData.quantidade_cotas}
                onChange={handleChange}
                required
                min="1"
                placeholder="Ex: 60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor da Parcela (R$) *
              </label>
              <div className="flex">
                <input
                  type="number"
                  name="valor_parcela"
                  value={formData.valor_parcela}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ex: 750.00"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
                <button
                  type="button"
                  onClick={calcularParcela}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                  title="Calcular automaticamente"
                >
                  <Calculator className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <input
                type="date"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sorteios Restantes *
              </label>
              <input
                type="number"
                name="sorteios_restantes"
                value={formData.sorteios_restantes}
                onChange={handleChange}
                required
                min="0"
                placeholder="Ex: 60"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}