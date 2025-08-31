import React from 'react';
import { X, Download, Calendar, Tag, Globe, Lock, FileText, Image, File, Clock } from 'lucide-react';
import { Documento, CATEGORIAS_DOCUMENTO, STATUS_DOCUMENTO } from '../types/documento';
import { DocumentoService } from '../services/documentoService';

interface VisualizarDocumentoModalProps {
  documento: Documento;
  onClose: () => void;
}

export function VisualizarDocumentoModal({ documento, onClose }: VisualizarDocumentoModalProps) {
  const categoria = CATEGORIAS_DOCUMENTO[documento.categoria];
  const status = STATUS_DOCUMENTO[documento.status];

  const getFileIcon = (tipoArquivo: string) => {
    if (tipoArquivo === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (tipoArquivo.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documento.arquivo.urlArquivo;
    link.download = documento.arquivo.nomeOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = documento.arquivo.tipoArquivo.startsWith('image/');
  const isPDF = documento.arquivo.tipoArquivo === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getFileIcon(documento.arquivo.tipoArquivo)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{documento.nome}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">{categoria.icone}</span>
                <span className="text-sm text-gray-600">{categoria.nome}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-600">v{documento.versao}</span>
              </div>
            </div>
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
          {/* Informações do Documento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {/* Descrição */}
              {documento.descricao && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">{documento.descricao}</p>
                </div>
              )}

              {/* Tags */}
              {documento.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {documento.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* Informações Técnicas */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900">Informações</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Grupo:</span>
                    <span className="font-medium">
                      {documento.nomeGrupo || 'Documento Geral'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="font-medium">
                      {DocumentoService.formatFileSize(documento.arquivo.tamanhoArquivo)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">
                      {documento.arquivo.tipoArquivo.split('/')[1].toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.cor}`}>
                      {status.nome}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Acesso:</span>
                    <div className="flex items-center">
                      {documento.acessoPublico ? (
                        <>
                          <Globe className="w-3 h-3 mr-1 text-green-500" />
                          <span className="text-green-600 text-xs">Público</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1 text-red-500" />
                          <span className="text-red-600 text-xs">Privado</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-3">Histórico</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600">Enviado em</p>
                      <p className="font-medium">{formatDate(documento.dataUpload)}</p>
                    </div>
                  </div>
                  
                  {documento.dataAtualizacao.getTime() !== documento.dataUpload.getTime() && (
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-gray-600">Atualizado em</p>
                        <p className="font-medium">{formatDate(documento.dataAtualizacao)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Histórico de Versões */}
          {documento.historicoVersoes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Versões</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {documento.historicoVersoes.map((versao, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">v{versao.versao}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(versao.dataVersao)}
                          </span>
                        </div>
                        {versao.observacoes && (
                          <p className="text-sm text-gray-600 mt-1">{versao.observacoes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = versao.arquivoAnterior.urlArquivo;
                          link.download = versao.arquivoAnterior.nomeOriginal;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Baixar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Visualização do Arquivo */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Visualização do Documento</h3>
            </div>
            
            <div className="p-4">
              {isImage ? (
                <img
                  src={documento.arquivo.urlArquivo}
                  alt={documento.nome}
                  className="w-full h-auto max-h-96 object-contain bg-gray-50 rounded"
                />
              ) : isPDF ? (
                <div className="h-96 bg-gray-50 flex items-center justify-center rounded">
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
                <div className="h-96 bg-gray-50 flex items-center justify-center rounded">
                  <div className="text-center">
                    <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
          </div>
        </div>
      </div>
    </div>
  );
}