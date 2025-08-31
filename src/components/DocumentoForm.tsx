import React, { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, Tag, Globe, Lock } from 'lucide-react';
import { CreateDocumentoData, CATEGORIAS_DOCUMENTO } from '../types/documento';
import { GrupoConsorcio } from '../types/grupo';
import { GrupoService } from '../services/grupoService';

interface DocumentoFormProps {
  onSubmit: (data: CreateDocumentoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DocumentoForm({ onSubmit, onCancel, isLoading }: DocumentoFormProps) {
  const [grupos, setGrupos] = useState<GrupoConsorcio[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [erro, setErro] = useState('');
  
  const [formData, setFormData] = useState<Omit<CreateDocumentoData, 'arquivo'>>({
    nome: '',
    descricao: '',
    categoria: 'outros',
    grupoId: null,
    versao: '1.0',
    status: 'ativo',
    acessoPublico: true,
    tags: []
  });

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      const data = await GrupoService.getAll();
      setGrupos(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const validarArquivo = (file: File): string | null => {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB

    if (!tiposPermitidos.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.';
    }

    if (file.size > tamanhoMaximo) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB.';
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

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!arquivo) {
      setErro('Selecione um arquivo para enviar.');
      return;
    }

    if (!formData.nome.trim()) {
      setErro('Nome do documento é obrigatório.');
      return;
    }

    onSubmit({
      ...formData,
      arquivo
    });
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Novo Documento</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo do Documento *
            </label>
            
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragOver 
                  ? 'border-blue-400 bg-blue-50' 
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
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                        clique para selecionar
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG até 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {erro && (
              <p className="mt-2 text-sm text-red-600">{erro}</p>
            )}
          </div>

          {/* Informações do Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Documento *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
                placeholder="Ex: Regulamento do Grupo Auto 2024-A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                rows={3}
                placeholder="Descreva o conteúdo e propósito do documento..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as any }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                {Object.entries(CATEGORIAS_DOCUMENTO).map(([key, categoria]) => (
                  <option key={key} value={key}>
                    {categoria.icone} {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grupo Relacionado
              </label>
              <select
                value={formData.grupoId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, grupoId: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                <option value="">Documento Geral da Confraria</option>
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome_grupo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versão
              </label>
              <input
                type="text"
                value={formData.versao}
                onChange={(e) => setFormData(prev => ({ ...prev, versao: e.target.value }))}
                placeholder="Ex: 1.0, 2.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              >
                <option value="ativo">Ativo</option>
                <option value="rascunho">Rascunho</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Ex: regulamento, normas, grupo, auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
              />
            </div>
          </div>

          {/* Configurações de Acesso */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Configurações de Acesso</h3>
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="acesso"
                  checked={formData.acessoPublico}
                  onChange={() => setFormData(prev => ({ ...prev, acessoPublico: true }))}
                  className="mr-2"
                />
                <Globe className="w-4 h-4 mr-1 text-green-500" />
                <span className="text-sm">Público (todos podem visualizar)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="acesso"
                  checked={!formData.acessoPublico}
                  onChange={() => setFormData(prev => ({ ...prev, acessoPublico: false }))}
                  className="mr-2"
                />
                <Lock className="w-4 h-4 mr-1 text-red-500" />
                <span className="text-sm">Privado (apenas administradores)</span>
              </label>
            </div>
          </div>

          {/* Botões */}
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
              disabled={!arquivo || !formData.nome.trim() || isLoading}
              className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}