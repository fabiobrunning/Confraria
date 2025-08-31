import React from 'react';
import { X, Download, FileText, Image } from 'lucide-react';
import { Pagamento } from '../types/pagamento';

interface VisualizarComprovanteModalProps {
  pagamento: Pagamento;
  onClose: () => void;
}

export function VisualizarComprovanteModal({ pagamento, onClose }: VisualizarComprovanteModalProps) {
  if (!pagamento.comprovante) return null;

  const formatMesReferencia = (mesRef: string) => {
    const [ano, mes] = mesRef.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pagamento.comprovante!.urlArquivo;
    link.download = pagamento.comprovante!.nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = pagamento.comprovante.tipoArquivo.startsWith('image/');
  const isPDF = pagamento.comprovante.tipoArquivo === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Comprovante de Pagamento</h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatMesReferencia(pagamento.mesReferencia)} - {formatCurrency(pagamento.valorParcela)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="Baixar arquivo"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informações do Arquivo */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              {isImage ? (
                <Image className="w-5 h-5 text-blue-500" />
              ) : (
                <FileText className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">{pagamento.comprovante.nomeArquivo}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(pagamento.comprovante.tamanhoArquivo)} • 
                  Enviado em {pagamento.comprovante.dataUpload.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Status de Validação */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Status: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pagamento.validadoPor 
                    ? pagamento.statusPagamento === 'pago'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {pagamento.validadoPor 
                    ? pagamento.statusPagamento === 'pago' ? 'Validado' : 'Rejeitado'
                    : 'Pendente de Validação'
                  }
                </span>
              </div>
              
              {pagamento.dataValidacao && (
                <div className="text-sm text-gray-500">
                  Validado em: {pagamento.dataValidacao.toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>

          {/* Visualização do Arquivo */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {isImage ? (
              <img
                src={pagamento.comprovante.urlArquivo}
                alt="Comprovante de pagamento"
                className="w-full h-auto max-h-96 object-contain bg-gray-50"
              />
            ) : isPDF ? (
              <div className="h-96 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Visualização de PDF não disponível</p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-96 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Tipo de arquivo não suportado para visualização</p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Arquivo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          {pagamento.observacoes && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Observações</h3>
              <p className="text-sm text-blue-800">{pagamento.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}