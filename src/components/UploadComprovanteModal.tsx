import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { Pagamento } from '../types/pagamento';

interface UploadComprovanteModalProps {
  pagamento: Pagamento;
  onUpload: (arquivo: File, observacoes: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function UploadComprovanteModal({ 
  pagamento, 
  onUpload, 
  onClose, 
  isLoading 
}: UploadComprovanteModalProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [erro, setErro] = useState('');

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

  const validarArquivo = (file: File): string | null => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use JPG, PNG ou PDF.';
    }

    if (file.size > tamanhoMaximo) {
      return 'Arquivo muito grande. Tamanho máximo: 5MB.';
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const erroValidacao = validarArquivo(file);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setErro('');
    setArquivo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivo) {
      setErro('Selecione um arquivo para enviar.');
      return;
    }

    onUpload(arquivo, observacoes);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Enviar Comprovante</h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatMesReferencia(pagamento.mesReferencia)} - {formatCurrency(pagamento.valorParcela)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Área de Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprovante de Pagamento *
            </label>
            
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragOver 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : arquivo 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              {arquivo ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{arquivo.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(arquivo.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setArquivo(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remover arquivo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Arraste e solte seu arquivo aqui, ou{' '}
                      <label className="text-yellow-600 hover:text-yellow-700 cursor-pointer font-medium">
                        clique para selecionar
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou PDF até 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {erro && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {erro}
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Adicione informações adicionais sobre o pagamento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
            />
          </div>

          {/* Informações do Pagamento */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Detalhes do Pagamento</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Mês de referência:</span>
                <span className="font-medium">{formatMesReferencia(pagamento.mesReferencia)}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor da parcela:</span>
                <span className="font-medium">{formatCurrency(pagamento.valorParcela)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cota:</span>
                <span className="font-medium">{pagamento.numeroCota}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!arquivo || isLoading}
              className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Comprovante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}