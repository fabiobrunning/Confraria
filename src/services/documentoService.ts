import { supabase } from '../lib/supabase';
import { Documento, CreateDocumentoData, UpdateDocumentoData, NovaVersaoData, FiltrosDocumento, EstatisticasDocumentos, ArquivoDocumento, VersaoHistorico } from '../types/documento';

export class DocumentoService {
  // Buscar todos os documentos públicos
  static async getDocumentosPublicos(filtros?: FiltrosDocumento): Promise<Documento[]> {
    try {
      const { data, error } = await supabase.rpc('buscar_documentos', {
        termo_busca: filtros?.termoBusca || '',
        categoria_filtro: filtros?.categoria || null,
        grupo_filtro: filtros?.grupoId || null,
        apenas_publicos: true
      });

      if (error) {
        console.error('Erro ao buscar documentos públicos:', error);
        throw new Error('Erro ao carregar documentos: ' + error.message);
      }

      return (data || []).map(this.transformDocumento);
    } catch (error) {
      console.error('Erro ao buscar documentos públicos:', error);
      throw error;
    }
  }

  // Buscar todos os documentos (admin)
  static async getAllDocumentos(filtros?: FiltrosDocumento): Promise<Documento[]> {
    try {
      let query = supabase
        .from('documentos')
        .select(`
          *,
          grupos_consorcio(nome_grupo)
        `)
        .order('data_upload', { ascending: false });

      if (filtros?.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      if (filtros?.grupoId) {
        query = query.eq('grupo_id', filtros.grupoId);
      }
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.acessoPublico !== undefined) {
        query = query.eq('acesso_publico', filtros.acessoPublico);
      }
      if (filtros?.termoBusca) {
        query = query.or(`nome.ilike.%${filtros.termoBusca}%,descricao.ilike.%${filtros.termoBusca}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar documentos:', error);
        throw new Error('Erro ao carregar documentos: ' + error.message);
      }

      return (data || []).map((doc: any) => this.transformDocumento({
        ...doc,
        nome_grupo: doc.grupos_consorcio?.nome_grupo
      }));
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      throw error;
    }
  }

  // Buscar documento por ID
  static async getById(id: string): Promise<Documento | null> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select(`
          *,
          grupos_consorcio(nome_grupo)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Erro ao buscar documento:', error);
        throw new Error('Erro ao buscar documento: ' + error.message);
      }

      return this.transformDocumento({
        ...data,
        nome_grupo: data.grupos_consorcio?.nome_grupo
      });
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      throw error;
    }
  }

  // Criar novo documento
  static async create(data: CreateDocumentoData): Promise<Documento> {
    try {
      // Validar arquivo
      const arquivo = data.arquivo;
      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      const tamanhoMaximo = 10 * 1024 * 1024; // 10MB

      if (!tiposPermitidos.includes(arquivo.type)) {
        throw new Error('Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.');
      }

      if (arquivo.size > tamanhoMaximo) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
      }

      // Converter arquivo para base64
      const base64 = await this.fileToBase64(arquivo);
      const nomeArquivo = this.gerarNomeUnico(arquivo.name);
      
      const arquivoData: ArquivoDocumento = {
        nomeOriginal: arquivo.name,
        nomeArquivo: nomeArquivo,
        tipoArquivo: arquivo.type,
        tamanhoArquivo: arquivo.size,
        urlArquivo: base64,
        dataUpload: new Date()
      };

      const { data: documento, error } = await supabase
        .from('documentos')
        .insert([{
          nome: data.nome,
          descricao: data.descricao,
          categoria: data.categoria,
          grupo_id: data.grupoId,
          arquivo: arquivoData,
          upload_por: 'admin', // TODO: usar ID do usuário logado
          versao: data.versao || '1.0',
          status: data.status || 'ativo',
          acesso_publico: data.acessoPublico !== false,
          tags: data.tags || [],
          historico_versoes: []
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar documento:', error);
        throw new Error('Erro ao criar documento: ' + error.message);
      }

      return this.transformDocumento(documento);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      throw error;
    }
  }

  // Atualizar documento
  static async update(id: string, updates: UpdateDocumentoData): Promise<Documento> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar documento:', error);
        throw new Error('Erro ao atualizar documento: ' + error.message);
      }

      return this.transformDocumento(data);
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  }

  // Upload de nova versão
  static async uploadNovaVersao(id: string, data: NovaVersaoData): Promise<Documento> {
    try {
      // Buscar documento atual
      const documentoAtual = await this.getById(id);
      if (!documentoAtual) {
        throw new Error('Documento não encontrado');
      }

      // Validar arquivo
      const arquivo = data.arquivo;
      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      const tamanhoMaximo = 10 * 1024 * 1024; // 10MB

      if (!tiposPermitidos.includes(arquivo.type)) {
        throw new Error('Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG ou PNG.');
      }

      if (arquivo.size > tamanhoMaximo) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB.');
      }

      // Converter arquivo para base64
      const base64 = await this.fileToBase64(arquivo);
      const nomeArquivo = this.gerarNomeUnico(arquivo.name);
      
      const novoArquivo: ArquivoDocumento = {
        nomeOriginal: arquivo.name,
        nomeArquivo: nomeArquivo,
        tipoArquivo: arquivo.type,
        tamanhoArquivo: arquivo.size,
        urlArquivo: base64,
        dataUpload: new Date()
      };

      // Criar entrada no histórico
      const novaVersaoHistorico: VersaoHistorico = {
        versao: documentoAtual.versao,
        dataVersao: documentoAtual.dataAtualizacao,
        alteradoPor: documentoAtual.uploadPor,
        observacoes: data.observacoes,
        arquivoAnterior: documentoAtual.arquivo
      };

      const historicoAtualizado = [...documentoAtual.historicoVersoes, novaVersaoHistorico];

      const { data: documentoAtualizado, error } = await supabase
        .from('documentos')
        .update({
          arquivo: novoArquivo,
          versao: data.versao,
          historico_versoes: historicoAtualizado,
          upload_por: 'admin' // TODO: usar ID do usuário logado
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao fazer upload de nova versão:', error);
        throw new Error('Erro ao fazer upload: ' + error.message);
      }

      return this.transformDocumento(documentoAtualizado);
    } catch (error) {
      console.error('Erro ao fazer upload de nova versão:', error);
      throw error;
    }
  }

  // Deletar documento
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documentos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar documento:', error);
        throw new Error('Erro ao deletar documento: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  }

  // Buscar documentos por grupo
  static async getDocumentosPorGrupo(grupoId: string): Promise<Documento[]> {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select(`
          *,
          grupos_consorcio(nome_grupo)
        `)
        .or(`grupo_id.eq.${grupoId},grupo_id.is.null`)
        .eq('status', 'ativo')
        .eq('acesso_publico', true)
        .order('data_upload', { ascending: false });

      if (error) {
        console.error('Erro ao buscar documentos do grupo:', error);
        throw new Error('Erro ao carregar documentos: ' + error.message);
      }

      return (data || []).map((doc: any) => this.transformDocumento({
        ...doc,
        nome_grupo: doc.grupos_consorcio?.nome_grupo
      }));
    } catch (error) {
      console.error('Erro ao buscar documentos do grupo:', error);
      throw error;
    }
  }

  // Buscar estatísticas
  static async getEstatisticas(): Promise<EstatisticasDocumentos> {
    try {
      const { data, error } = await supabase.rpc('obter_estatisticas_documentos');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw new Error('Erro ao carregar estatísticas: ' + error.message);
      }

      return {
        totalDocumentos: data.total_documentos || 0,
        documentosPublicos: data.documentos_publicos || 0,
        documentosPrivados: data.documentos_privados || 0,
        porCategoria: data.por_categoria || {},
        porStatus: data.por_status || {},
        documentosRecentes: data.documentos_recentes || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Busca avançada
  static async buscarDocumentos(
    termoBusca: string,
    categoria?: string,
    grupoId?: string
  ): Promise<Documento[]> {
    try {
      const { data, error } = await supabase.rpc('buscar_documentos', {
        termo_busca: termoBusca,
        categoria_filtro: categoria || null,
        grupo_filtro: grupoId || null,
        apenas_publicos: true
      });

      if (error) {
        console.error('Erro na busca:', error);
        throw new Error('Erro na busca: ' + error.message);
      }

      return (data || []).map(this.transformDocumento);
    } catch (error) {
      console.error('Erro na busca:', error);
      throw error;
    }
  }

  // Utilitários
  private static transformDocumento(data: any): Documento {
    return {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      categoria: data.categoria,
      grupoId: data.grupo_id,
      nomeGrupo: data.nome_grupo,
      arquivo: {
        nomeOriginal: data.arquivo.nome_original || data.arquivo.nomeOriginal,
        nomeArquivo: data.arquivo.nome_arquivo || data.arquivo.nomeArquivo,
        tipoArquivo: data.arquivo.tipo_arquivo || data.arquivo.tipoArquivo,
        tamanhoArquivo: data.arquivo.tamanho_arquivo || data.arquivo.tamanhoArquivo,
        urlArquivo: data.arquivo.url_arquivo || data.arquivo.urlArquivo,
        dataUpload: new Date(data.arquivo.data_upload || data.arquivo.dataUpload)
      },
      uploadPor: data.upload_por,
      dataUpload: new Date(data.data_upload),
      dataAtualizacao: new Date(data.data_atualizacao),
      versao: data.versao,
      status: data.status,
      acessoPublico: data.acesso_publico,
      tags: data.tags || [],
      historicoVersoes: (data.historico_versoes || []).map((v: any) => ({
        versao: v.versao,
        dataVersao: new Date(v.dataVersao || v.data_versao),
        alteradoPor: v.alteradoPor || v.alterado_por,
        observacoes: v.observacoes,
        arquivoAnterior: v.arquivoAnterior || v.arquivo_anterior
      })),
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  private static gerarNomeUnico(nomeOriginal: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extensao = nomeOriginal.split('.').pop();
    return `doc_${timestamp}_${random}.${extensao}`;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}