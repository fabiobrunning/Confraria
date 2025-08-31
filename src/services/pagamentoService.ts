import { supabase } from '../lib/supabase';
import { Pagamento, CreatePagamentoData, UploadComprovanteData, ValidacaoComprovante, StatusMembroGrupo, RelatorioPagamentos, FiltrosPagamento } from '../types/pagamento';

export class PagamentoService {
  // Buscar pagamentos de um membro específico
  static async getPagamentosMembro(membroId: string, grupoId?: string): Promise<Pagamento[]> {
    try {
      let query = supabase
        .from('pagamentos')
        .select(`
          *,
          grupos_consorcio(nome_grupo)
        `)
        .eq('membro_id', membroId)
        .order('mes_referencia', { ascending: false });

      if (grupoId) {
        query = query.eq('grupo_id', grupoId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw new Error('Erro ao carregar pagamentos: ' + error.message);
      }

      return (data || []).map(this.transformPagamento);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }

  // Buscar todos os pagamentos (admin)
  static async getAllPagamentos(filtros?: FiltrosPagamento): Promise<Pagamento[]> {
    try {
      let query = supabase
        .from('pagamentos')
        .select(`
          *,
          membros(nome, nome_completo),
          grupos_consorcio(nome_grupo)
        `)
        .order('created_at', { ascending: false });

      if (filtros?.grupoId) {
        query = query.eq('grupo_id', filtros.grupoId);
      }
      if (filtros?.mesReferencia) {
        query = query.eq('mes_referencia', filtros.mesReferencia);
      }
      if (filtros?.statusPagamento) {
        query = query.eq('status_pagamento', filtros.statusPagamento);
      }
      if (filtros?.membroId) {
        query = query.eq('membro_id', filtros.membroId);
      }
      if (filtros?.validacao === 'pendente') {
        query = query.not('comprovante', 'is', null).is('validado_por', null);
      }
      if (filtros?.validacao === 'validado') {
        query = query.not('validado_por', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        throw new Error('Erro ao carregar pagamentos: ' + error.message);
      }

      return (data || []).map(this.transformPagamento);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }

  // Criar novo pagamento
  static async create(data: CreatePagamentoData): Promise<Pagamento> {
    try {
      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .insert([{
          membro_id: data.membroId,
          grupo_id: data.grupoId,
          numero_cota: data.numeroCota,
          mes_referencia: data.mesReferencia,
          valor_parcela: data.valorParcela,
          tipo_pagamento: data.tipoPagamento,
          status_pagamento: data.tipoPagamento === 'dinheiro' ? 'pago' : 'pendente',
          data_pagamento: data.tipoPagamento === 'dinheiro' ? new Date().toISOString() : null,
          observacoes: data.observacoes || '',
          validado_por: data.tipoPagamento === 'dinheiro' ? 'admin' : null,
          data_validacao: data.tipoPagamento === 'dinheiro' ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pagamento:', error);
        throw new Error('Erro ao criar pagamento: ' + error.message);
      }

      return this.transformPagamento(pagamento);
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  // Upload de comprovante
  static async uploadComprovante(data: UploadComprovanteData): Promise<Pagamento> {
    try {
      // Validar arquivo
      const arquivo = data.arquivo;
      const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
      const tamanhoMaximo = 5 * 1024 * 1024; // 5MB

      if (!tiposPermitidos.includes(arquivo.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
      }

      if (arquivo.size > tamanhoMaximo) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB.');
      }

      // Converter arquivo para base64
      const base64 = await this.fileToBase64(arquivo);
      
      const comprovante = {
        nome_arquivo: arquivo.name,
        tipo_arquivo: arquivo.type,
        tamanho_arquivo: arquivo.size,
        url_arquivo: base64,
        data_upload: new Date().toISOString()
      };

      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .update({
          comprovante: comprovante,
          status_pagamento: 'pago',
          data_pagamento: new Date().toISOString(),
          observacoes: data.observacoes || ''
        })
        .eq('id', data.pagamentoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao fazer upload:', error);
        throw new Error('Erro ao fazer upload: ' + error.message);
      }

      return this.transformPagamento(pagamento);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  // Validar comprovante (admin)
  static async validarComprovante(data: ValidacaoComprovante): Promise<Pagamento> {
    try {
      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .update({
          validado_por: data.validadoPor,
          data_validacao: new Date().toISOString(),
          status_pagamento: data.aprovado ? 'pago' : 'pendente',
          observacoes: data.observacoes
        })
        .eq('id', data.pagamentoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao validar comprovante:', error);
        throw new Error('Erro ao validar comprovante: ' + error.message);
      }

      return this.transformPagamento(pagamento);
    } catch (error) {
      console.error('Erro ao validar comprovante:', error);
      throw error;
    }
  }

  // Buscar status dos membros por grupo
  static async getStatusMembrosGrupos(grupoId?: string): Promise<StatusMembroGrupo[]> {
    try {
      let query = supabase
        .from('status_membros_grupos')
        .select('*')
        .order('status_geral', { ascending: false });

      if (grupoId) {
        query = query.eq('grupo_id', grupoId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar status:', error);
        throw new Error('Erro ao carregar status: ' + error.message);
      }

      return (data || []).map((item: any) => ({
        membroId: item.membro_id,
        grupoId: item.grupo_id,
        nome: item.nome,
        nomeCompleto: item.nome_completo,
        nomeGrupo: item.nome_grupo,
        statusGeral: item.status_geral,
        ultimoPagamento: item.ultimo_pagamento ? new Date(item.ultimo_pagamento) : null,
        proximoVencimento: new Date(item.proximo_vencimento),
        totalPago: parseFloat(item.total_pago) || 0,
        parcelasAtrasadas: item.parcelas_atrasadas || 0,
        comprovantesPendentes: item.comprovantes_pendentes || 0
      }));
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      throw error;
    }
  }

  // Buscar comprovantes pendentes de validação
  static async getComprovantesPendentes(): Promise<Pagamento[]> {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          membros(nome, nome_completo),
          grupos_consorcio(nome_grupo)
        `)
        .not('comprovante', 'is', null)
        .is('validado_por', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar comprovantes pendentes:', error);
        throw new Error('Erro ao carregar comprovantes pendentes: ' + error.message);
      }

      return (data || []).map(this.transformPagamento);
    } catch (error) {
      console.error('Erro ao buscar comprovantes pendentes:', error);
      throw error;
    }
  }

  // Gerar relatório de pagamentos
  static async gerarRelatorio(grupoId?: string, mesReferencia?: string): Promise<RelatorioPagamentos> {
    try {
      let query = supabase
        .from('pagamentos')
        .select('*');

      if (grupoId) {
        query = query.eq('grupo_id', grupoId);
      }
      if (mesReferencia) {
        query = query.eq('mes_referencia', mesReferencia);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao gerar relatório:', error);
        throw new Error('Erro ao gerar relatório: ' + error.message);
      }

      const pagamentos = data || [];
      const totalArrecadado = pagamentos
        .filter(p => p.status_pagamento === 'pago')
        .reduce((sum, p) => sum + parseFloat(p.valor_parcela), 0);

      // Agrupar por membro para calcular status
      const membrosPorStatus = new Map();
      pagamentos.forEach(p => {
        const key = `${p.membro_id}-${p.grupo_id}`;
        if (!membrosPorStatus.has(key)) {
          membrosPorStatus.set(key, []);
        }
        membrosPorStatus.get(key).push(p);
      });

      let membrosEmDia = 0;
      let membrosAtrasados = 0;
      let membrosInadimplentes = 0;

      for (const [, pagamentosMembro] of membrosPorStatus) {
        const atrasados = pagamentosMembro.filter(p => p.status_pagamento === 'atrasado').length;
        if (atrasados >= 3) {
          membrosInadimplentes++;
        } else if (atrasados > 0) {
          membrosAtrasados++;
        } else {
          membrosEmDia++;
        }
      }

      const comprovantesValidados = pagamentos.filter(p => 
        p.comprovante && p.validado_por
      ).length;

      const comprovantesRejeitados = pagamentos.filter(p => 
        p.comprovante && p.validado_por && p.status_pagamento !== 'pago'
      ).length;

      const totalMembros = membrosPorStatus.size;
      const taxaAdimplencia = totalMembros > 0 ? (membrosEmDia / totalMembros) * 100 : 0;

      return {
        totalArrecadado,
        membrosEmDia,
        membrosAtrasados,
        membrosInadimplentes,
        comprovantesValidados,
        comprovantesRejeitados,
        taxaAdimplencia
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  // Atualizar status de pagamentos em atraso
  static async atualizarStatusAtrasados(): Promise<void> {
    try {
      const { error } = await supabase.rpc('atualizar_status_atrasados');

      if (error) {
        console.error('Erro ao atualizar status:', error);
        throw new Error('Erro ao atualizar status: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Marcar pagamento em dinheiro (admin)
  static async marcarPagamentoDinheiro(data: CreatePagamentoData): Promise<Pagamento> {
    try {
      const pagamentoData = {
        ...data,
        tipoPagamento: 'dinheiro' as const
      };

      return await this.create(pagamentoData);
    } catch (error) {
      console.error('Erro ao marcar pagamento em dinheiro:', error);
      throw error;
    }
  }

  // Gerar pagamentos mensais para um grupo
  static async gerarPagamentosMensais(grupoId: string, mesReferencia: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('gerar_pagamentos_mensais', {
        p_grupo_id: grupoId,
        p_mes_referencia: mesReferencia
      });

      if (error) {
        console.error('Erro ao gerar pagamentos:', error);
        throw new Error('Erro ao gerar pagamentos: ' + error.message);
      }

      return data || 0;
    } catch (error) {
      console.error('Erro ao gerar pagamentos:', error);
      throw error;
    }
  }

  // Buscar relatório de inadimplência
  static async getRelatorioInadimplencia(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('calcular_inadimplencia');

      if (error) {
        console.error('Erro ao buscar inadimplência:', error);
        throw new Error('Erro ao carregar relatório: ' + error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar inadimplência:', error);
      throw error;
    }
  }

  // Utilitários
  private static transformPagamento(data: any): Pagamento {
    return {
      id: data.id,
      membroId: data.membro_id,
      grupoId: data.grupo_id,
      numeroCota: data.numero_cota,
      mesReferencia: data.mes_referencia,
      valorParcela: parseFloat(data.valor_parcela) || 0,
      dataPagamento: data.data_pagamento ? new Date(data.data_pagamento) : null,
      tipoPagamento: data.tipo_pagamento,
      statusPagamento: data.status_pagamento,
      comprovante: data.comprovante ? {
        nomeArquivo: data.comprovante.nome_arquivo,
        tipoArquivo: data.comprovante.tipo_arquivo,
        tamanhoArquivo: data.comprovante.tamanho_arquivo,
        urlArquivo: data.comprovante.url_arquivo,
        dataUpload: new Date(data.comprovante.data_upload)
      } : null,
      validadoPor: data.validado_por,
      dataValidacao: data.data_validacao ? new Date(data.data_validacao) : null,
      observacoes: data.observacoes || '',
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
}