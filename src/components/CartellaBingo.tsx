import React from 'react';
import { CotaParticipante } from '../types/membro';

interface CartellaBingoProps {
  cotasParticipantes: CotaParticipante[];
  numeroSorteado?: number | null;
}

export function CartellaBingo({ cotasParticipantes, numeroSorteado }: CartellaBingoProps) {
  // Criar uma grade de 60 números (1-60)
  const numeros = Array.from({ length: 60 }, (_, i) => i + 1);
  
  // Verificar se um número tem cota participante
  const temCotaParticipante = (numero: number) => {
    return cotasParticipantes.some(cota => 
      parseInt(cota.numero) === numero && cota.status === 'participando'
    );
  };

  // Obter informações da cota para um número
  const getCotaInfo = (numero: number) => {
    return cotasParticipantes.find(cota => 
      parseInt(cota.numero) === numero && cota.status === 'participando'
    );
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-3 md:p-6">
      <div className="text-center mb-4">
        <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">CARTELA DE SORTEIO</h4>
        <p className="text-xs md:text-sm text-gray-600 px-2">
          Números destacados representam cotas participantes
        </p>
      </div>

      <div className="grid grid-cols-10 gap-1 md:gap-2 max-w-full md:max-w-4xl mx-auto">
        {numeros.map(numero => {
          const temCota = temCotaParticipante(numero);
          const cotaInfo = getCotaInfo(numero);
          const foiSorteado = numeroSorteado === numero;
          
          return (
            <div
              key={numero}
              className={`
                relative aspect-square flex items-center justify-center text-xs md:text-sm font-bold rounded border-2 md:rounded-lg transition-all duration-300
                ${foiSorteado 
                  ? 'bg-red-500 text-white border-red-600 shadow-lg scale-110 animate-pulse' 
                  : temCota 
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' 
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }
              `}
              title={cotaInfo ? `Cota ${cotaInfo.numero} - ${cotaInfo.nomeMembro}` : undefined}
            >
              <span className="text-center">
                {numero.toString().padStart(2, '0')}
              </span>
              
              {foiSorteado && (
                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full animate-ping"></div>
              )}
              
              {temCota && !foiSorteado && (
                <div className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 md:mt-4 flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-6 text-xs md:text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-100 border border-yellow-300 rounded mr-2 flex-shrink-0"></div>
          <span className="text-gray-600">Cotas Participantes</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-100 border border-gray-200 rounded mr-2 flex-shrink-0"></div>
          <span className="text-gray-600">Números Disponíveis</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded mr-2 flex-shrink-0"></div>
          <span className="text-gray-600">Número Sorteado</span>
        </div>
      </div>
    </div>
  );
}