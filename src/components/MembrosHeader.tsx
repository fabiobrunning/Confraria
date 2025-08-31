import React from 'react';
import { Users, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';

interface MembrosHeaderProps {
  stats: {
    total: number;
    emDia: number;
    emAtraso: number;
    contemplados: number;
  };
}

export function MembrosHeader({ stats }: MembrosHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Membros da Confraria
      </h1>
      
      {/* Resumo estatístico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total de Membros</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Em Dia</p>
              <p className="text-2xl font-bold text-green-900">{stats.emDia}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Em Atraso</p>
              <p className="text-2xl font-bold text-red-900">{stats.emAtraso}</p>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Contemplados</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.contemplados}</p>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}