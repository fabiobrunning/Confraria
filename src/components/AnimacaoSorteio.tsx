import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface AnimacaoSorteioProps {
  etapa: 1 | 2 | 3;
}

export function AnimacaoSorteio({ etapa }: AnimacaoSorteioProps) {
  const [numeroAtual, setNumeroAtual] = useState(1);
  const [iconeAtual, setIconeAtual] = useState(0);
  
  const iconesDado = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const IconeDado = iconesDado[iconeAtual];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setNumeroAtual(Math.floor(Math.random() * 60) + 1);
      setIconeAtual(Math.floor(Math.random() * 6));
    }, 100);

    return () => clearInterval(intervalo);
  }, []);

  const getTitulo = () => {
    switch (etapa) {
      case 1:
        return 'PRIMEIRO SORTEIO TESTE';
      case 2:
        return 'SEGUNDO SORTEIO TESTE';
      case 3:
        return 'SORTEIO OFICIAL';
      default:
        return 'SORTEANDO...';
    }
  };

  const getCorFundo = () => {
    switch (etapa) {
      case 1:
        return 'from-blue-400 to-blue-600';
      case 2:
        return 'from-yellow-400 to-yellow-600';
      case 3:
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getCorTexto = () => {
    switch (etapa) {
      case 1:
        return 'text-blue-100';
      case 2:
        return 'text-yellow-100';
      case 3:
        return 'text-green-100';
      default:
        return 'text-gray-100';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getCorFundo()} text-white rounded-lg p-8 text-center`}>
      <div className="animate-bounce mb-4">
        <IconeDado className="w-16 h-16 mx-auto" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4">{getTitulo()}</h3>
      
      <div className="text-6xl font-bold mb-4 animate-pulse">
        {numeroAtual.toString().padStart(2, '0')}
      </div>
      
      <div className="flex justify-center space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      <p className={`mt-4 text-lg opacity-90 ${getCorTexto()}`}>
        {etapa === 3 ? 'Sorteando o número oficial...' : 'Sorteando número de teste...'}
      </p>
    </div>
  );
}