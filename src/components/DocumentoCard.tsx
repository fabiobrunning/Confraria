import React from 'react';
import { Download, Eye, Edit, Trash2, FileText, Image, File, Calendar, Tag, Globe, Lock } from 'lucide-react';
import { Documento, CATEGORIAS_DOCUMENTO, STATUS_DOCUMENTO } from '../types/documento';
import { DocumentoService } from '../services/documentoService';

interface DocumentoCardProps {
  documento: Documento;
  isAdmin?: boolean;
  onEdit?: (documento: Documento) => void;
  onDelete?: (id: string) => void;
  onView?: (documento: Documento) => void;
}

export function DocumentoCard({ documento, isAdmin = false, onEdit, onDelete, onView }: DocumentoCardProps) {
  const categoria = CATEGORIAS_DOCUMENTO[documento.categoria];
  const status = STATUS_DOCUMENTO[documento.status];

  const getFileIcon = (tipoArquivo: string) => {
    if (tipoArquivo === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (tipoArquivo.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
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
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
        <div className="flex items-start space-x-3 mb-3 md:mb-0 flex-1 min-w-0">
          <div className="bg-gray-50 p-2 rounded-lg flex-shrink-0">
            {getFileIcon(documento.arquivo.tipoArquivo)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">
              {documento.nome}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-lg">{categoria.icone}</span>
              <span className="text-sm md:text-base text-gray-600">{categoria.nome}</span>
              {isAdmin && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium ${status.cor}`}>
                  {status.nome}
                </span>
              )}
            </div>
            {documento.descricao && (
              <p className="text-sm md:text-base text-gray-600 mb-2 line-clamp-2">
                {documento.descricao}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 self-start">
          {documento.acessoPublico ? (
            <Globe className="w-4 h-4 md:w-5 md:h-5 text-green-500" title="Público" />
          ) : (
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-red-500" title="Privado" />
          )}
        </div>
      </div>

      {/* Informações do documento */}
      <div className="space-y-2 md:space-y-3 mb-4">
        {documento.nomeGrupo ? (
          <div className="flex items-center text-sm md:text-base text-gray-600">
            <Tag className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>{documento.nomeGrupo}</span>
          </div>
        ) : (
          <div className="flex items-center text-sm md:text-base text-gray-600">
            <Tag className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>Documento Geral da Confraria</span>
          </div>
        )}

        <div className="flex items-center text-sm md:text-base text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <span>Enviado em {formatDate(documento.dataUpload)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between text-sm md:text-base text-gray-600 gap-1">
          <span>Versão {documento.versao}</span>
          <span>{DocumentoService.formatFileSize(documento.arquivo.tamanhoArquivo)}</span>
        </div>
      </div>

      {/* Tags */}
      {documento.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {documento.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {documento.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{documento.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Histórico de versões */}
      {documento.historicoVersoes.length > 0 && (
        <div className="mb-4 p-3 md:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs md:text-sm text-gray-600 mb-1">
            {documento.historicoVersoes.length} versão{documento.historicoVersoes.length > 1 ? 'ões' : ''} anterior{documento.historicoVersoes.length > 1 ? 'es' : ''}
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            Última atualização: {formatDate(documento.dataAtualizacao)}
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pt-3 md:pt-4 border-t border-gray-100 gap-3">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <button
            onClick={() => onView && onView(documento)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors touch-manipulation"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center px-4 py-2 text-sm md:text-base bg-gold-600 text-white rounded-md hover:bg-gold-700 transition-colors touch-manipulation"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </button>
        </div>

        {isAdmin && (
          <div className="flex space-x-1 md:space-x-2 self-end md:self-auto">
            <button
              onClick={() => onEdit && onEdit(documento)}
              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors touch-manipulation"
              title="Editar documento"
            >
              <Edit className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => onDelete && onDelete(documento.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors touch-manipulation"
              title="Excluir documento"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}