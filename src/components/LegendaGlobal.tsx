import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface LegendaItem {
  cor?: string;
  formato?: string;
  simbolo?: string;
  texto: string;
}

interface LegendaSecao {
  titulo: string;
  items: LegendaItem[];
}

interface LegendaGlobalProps {
  pagina: 'membros' | 'grupos' | 'pagamentos' | 'sorteios' | 'documentos';
}

export function LegendaGlobal({ pagina }: LegendaGlobalProps) {
  const [showLegenda, setShowLegenda] = useState(false);

  const getLegendaPorPagina = (): LegendaSecao[] => {
    switch (pagina) {
      case 'membros':
        return [
          {
            titulo: 'Status de Pagamento:',
            items: [
              { cor: 'bg-green-500', formato: 'rounded-full', texto: 'Em dia com todos os pagamentos' },
              { cor: 'bg-yellow-500', formato: 'rounded-full', texto: 'Próximo ao vencimento' },
              { cor: 'bg-orange-500', formato: 'rounded-full', texto: 'Em atraso' },
              { cor: 'bg-red-500', formato: 'rounded-full', texto: 'Inadimplente' }
            ]
          },
          {
            titulo: 'Status da Cota:',
            items: [
              { cor: 'bg-red-500', formato: 'rounded-sm', texto: 'Não contemplado' },
              { cor: 'bg-green-500', formato: 'rounded-sm', texto: 'Contemplado por sorteio' }
            ]
          },
          {
            titulo: 'Elementos Especiais:',
            items: [
              { simbolo: '📱', texto: 'Telefone de contato' },
              { simbolo: '🏢', texto: 'Empresa vinculada' },
              { simbolo: '🏆', texto: 'Membro contemplado' }
            ]
          }
        ];

      case 'sorteios':
        return [
          {
            titulo: 'Status dos Números:',
            items: [
              { cor: 'bg-yellow-100', formato: 'rounded', texto: 'Número com cota participante' },
              { cor: 'bg-gray-100', formato: 'rounded', texto: 'Número disponível' },
              { cor: 'bg-red-500', formato: 'rounded', texto: 'Número sorteado (resultado)' }
            ]
          },
          {
            titulo: 'Elementos Especiais:',
            items: [
              { simbolo: '🎯', texto: 'Sorteio em andamento' },
              { simbolo: '🏆', texto: 'Cota contemplada' },
              { simbolo: '🎲', texto: 'Iniciar sorteio' }
            ]
          }
        ];

      case 'pagamentos':
        return [
          {
            titulo: 'Status de Pagamento:',
            items: [
              { cor: 'bg-green-500', formato: 'rounded-full', texto: 'Pagamento validado' },
              { cor: 'bg-yellow-500', formato: 'rounded-full', texto: 'Pendente de validação' },
              { cor: 'bg-red-500', formato: 'rounded-full', texto: 'Em atraso' }
            ]
          },
          {
            titulo: 'Status do Comprovante:',
            items: [
              { cor: 'bg-blue-500', formato: 'rounded-sm', texto: 'Comprovante validado' },
              { cor: 'bg-orange-500', formato: 'rounded-sm', texto: 'Aguardando validação' },
              { cor: 'bg-red-500', formato: 'rounded-sm', texto: 'Comprovante rejeitado' }
            ]
          },
          {
            titulo: 'Elementos Especiais:',
            items: [
              { simbolo: '📄', texto: 'Comprovante disponível' },
              { simbolo: '💰', texto: 'Pagamento validado' },
              { simbolo: '⏳', texto: 'Aguardando validação' }
            ]
          }
        ];

      case 'documentos':
        return [
          {
            titulo: 'Categorias de Documentos:',
            items: [
              { simbolo: '📝', texto: 'Minutas de reuniões' },
              { simbolo: '📄', texto: 'Contratos de adesão' },
              { simbolo: '📋', texto: 'Regras específicas' },
              { simbolo: '⚖️', texto: 'Regulamentos gerais' },
              { simbolo: '📊', texto: 'Atas de sorteios' }
            ]
          },
          {
            titulo: 'Elementos Especiais:',
            items: [
              { simbolo: '🔒', texto: 'Acesso restrito' },
              { simbolo: '🌍', texto: 'Acesso público' },
              { simbolo: '📥', texto: 'Download disponível' }
            ]
          }
        ];

      default:
        return [
          {
            titulo: 'Elementos Gerais:',
            items: [
              { simbolo: '*', texto: 'Campo obrigatório' },
              { simbolo: '⚠️', texto: 'Atenção necessária' },
              { simbolo: '✅', texto: 'Concluído' }
            ]
          }
        ];
    }
  };

  const legendas = getLegendaPorPagina();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Botão para abrir/fechar legenda */}
      <button
        onClick={() => setShowLegenda(!showLegenda)}
        className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Ver legenda"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Modal/Dropdown da Legenda */}
      {showLegenda && (
        <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-80 max-w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Legenda</h3>
            <button
              onClick={() => setShowLegenda(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {legendas.map((secao, secaoIndex) => (
              <div key={secaoIndex}>
                <h4 className="font-medium text-gray-700 mb-2">{secao.titulo}</h4>
                <div className="space-y-2">
                  {secao.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center">
                      {item.cor ? (
                        <span className={`w-3 h-3 ${item.cor} ${item.formato || 'rounded'} mr-2 flex-shrink-0`}></span>
                      ) : (
                        <span className="mr-2 flex-shrink-0">{item.simbolo}</span>
                      )}
                      <span className="text-gray-700">{item.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}