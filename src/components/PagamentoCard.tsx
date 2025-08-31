import React from 'react';
import { Calendar, DollarSign, CheckCircle, Clock, AlertTriangle, FileText, Eye, Upload, X } from 'lucide-react';
import { Pagamento } from '../types/pagamento';

interface PagamentoCardProps {
  pagamento: Pagamento;
  onUploadComprovante?: (pagamento: Pagamento) => void;
  onVisualizarComprovante?: (pagamento: Pagamento) => void;
  isAdmin?: boolean;
}

export function PagamentoCard({ 
  pagamento, 
  onUploadComprovante, 
  onVisualizarComprovante,
  isAdmin = false 
}: PagamentoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'isento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="w-4 h-4" />;
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'atrasado':
        return <AlertTriangle className="w-4 h-4" />;
      case 'isento':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'pendente':
        return 'Pendente';
      case 'atrasado':
        return 'Em Atraso';
      case 'isento':
        return 'Isento';
      default:
        return status;
    }
  };

  const getTipoPagamentoText = (tipo: string) => {
    switch (tipo) {
      case 'pix':
        return 'PIX';
      case 'dinheiro':
        return 'Dinheiro';
      case 'transferencia':
        return 'Transferência';
      case 'cartao':
        return 'Cartão';
      default:
        return tipo;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatMesReferencia = (mesRef: string) => {
    const [ano, mes] = mesRef.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  };

  const getComprovanteStatus = () => {
    if (!pagamento.comprovante) return null;
    
    if (pagamento.validadoPor) {
      return pagamento.statusPagamento === 'pago' ? 'validado' : 'rejeitado';
    }
    return 'pendente';
  };

  const comprovanteStatus = getComprovanteStatus();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
            {formatMesReferencia(pagamento.mesReferencia)}
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-0">Cota {pagamento.numeroCota}</p>
        </div>
        
        <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border self-start ${getStatusColor(pagamento.statusPagamento)}`}>
          {getStatusIcon(pagamento.statusPagamento)}
          <span className="ml-1">{getStatusText(pagamento.statusPagamento)}</span>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        <div className="flex items-center text-sm md:text-base text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span className="font-medium">{formatCurrency(pagamento.valorParcela)}</span>
          <span className="ml-2 text-gray-500">({getTipoPagamentoText(pagamento.tipoPagamento)})</span>
        </div>

        {pagamento.dataPagamento && (
          <div className="flex items-center text-sm md:text-base text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>Pago em: {formatDate(pagamento.dataPagamento)}</span>
          </div>
        )}

        {pagamento.observacoes && (
          <div className="text-sm md:text-base text-gray-600">
            <p className="italic">"{pagamento.observacoes}"</p>
          </div>
        )}
      </div>

      {/* Status do Comprovante */}
      {pagamento.comprovante && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center text-sm md:text-base">
              <FileText className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Comprovante:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs md:text-sm font-medium ${
                comprovanteStatus === 'validado' 
                  ? 'bg-green-100 text-green-800'
                  : comprovanteStatus === 'rejeitado'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {comprovanteStatus === 'validado' ? 'Validado' : 
                 comprovanteStatus === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
              </span>
            </div>
            
            {onVisualizarComprovante && (
              <button
                onClick={() => onVisualizarComprovante(pagamento)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors touch-manipulation self-start md:self-auto"
                title="Visualizar comprovante"
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>

          {pagamento.dataValidacao && (
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              Validado em: {formatDate(pagamento.dataValidacao)}
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div className="text-xs md:text-sm text-gray-500">
            Criado em: {formatDate(new Date(pagamento.created_at))}
          </div>
          
          {!isAdmin && pagamento.statusPagamento === 'pendente' && !pagamento.comprovante && onUploadComprovante && (
            <button
              onClick={() => onUploadComprovante(pagamento)}
              className="inline-flex items-center justify-center px-3 py-2 text-sm md:text-base bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors touch-manipulation"
            >
              <Upload className="w-4 h-4 mr-2" />
              Enviar Comprovante
            </button>
          )}
        </div>
      </div>
    </div>
  );
}