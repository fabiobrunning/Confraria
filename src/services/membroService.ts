import { supabase } from '../lib/supabase';
import { Membro, PreCadastroData, CadastroCompletoData, CotaParticipante } from '../types/membro';
import { StatusMembroGrupo } from '../types/pagamento';

export class MembroService {
  static async getAll(): Promise<Membro[]> {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select(`
          *,
          endereco:enderecos(*),
          empresas(*),
          cotas(*, grupos_consorcio(nome_grupo))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar membros:', error);
        throw new Error('Erro ao carregar membros: ' + error.message);
      }

      // Transformar os dados para o formato esperado
      const membros: Membro[] = (data || []).map((membro: any) => ({
        id: membro.id,
        nome: membro.nome,
        nome_completo: membro.nome_completo,
        telefone: membro.telefone,
        cpf: membro.cpf,
        status_membro: membro.status_membro,
        created_at: membro.created_at,
        updated_at: membro.updated_at,
        endereco: membro.endereco?.[0] || null, // Pega o primeiro endereço (relação 1:1)
        empresas: membro.empresas || [],
        cotas: (membro.cotas || []).map((cota: any) => ({
          ...cota,
          nome_grupo: cota.grupos_consorcio?.nome_grupo
        }))
      }));

      return membros;
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      throw error;
    }
  }

  static async createPreCadastro(data: PreCadastroData): Promise<Membro> {
    try {
      const { data: novoMembro, error } = await supabase
        .from('membros')
        .insert([{
          nome: data.nome,
          telefone: data.telefone,
          status_membro: 'PRE_CADASTRO'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pré-cadastro:', error);
        throw new Error('Erro ao criar pré-cadastro: ' + error.message);
      }

      return {
        id: novoMembro.id,
        nome: novoMembro.nome,
        nome_completo: novoMembro.nome_completo,
        telefone: novoMembro.telefone,
        cpf: novoMembro.cpf,
        status_membro: novoMembro.status_membro,
        created_at: novoMembro.created_at,
        updated_at: novoMembro.updated_at,
        endereco: null,
        empresas: [],
        cotas: []
      };
    } catch (error) {
      console.error('Erro ao criar pré-cadastro:', error);
      throw error;
    }
  }

  static async completarCadastro(id: string, data: CadastroCompletoData): Promise<Membro> {
    try {
      // Iniciar uma transação usando o cliente do Supabase
      const { data: membroAtualizado, error: membroError } = await supabase
        .from('membros')
        .update({
          nome_completo: data.nome_completo,
          cpf: data.cpf,
          status_membro: 'CADASTRO_COMPLETO'
        })
        .eq('id', id)
        .select()
        .single();

      if (membroError) {
        throw new Error('Erro ao atualizar membro: ' + membroError.message);
      }

      // Inserir ou atualizar endereço
      if (data.endereco) {
        // Primeiro, verificar se já existe um endereço
        let enderecoExistente = null;
        try {
          const { data } = await supabase
            .from('enderecos')
            .select('id')
            .eq('membro_id', id)
            .single();
          enderecoExistente = data;
        } catch (error: any) {
          // Se o erro for PGRST116 (nenhum registro encontrado), é normal
          if (error.code !== 'PGRST116') {
            // Se for outro erro, relançar
            throw error;
          }
          // Se for PGRST116, enderecoExistente permanece null
        }

        if (enderecoExistente) {
          // Atualizar endereço existente
          const { error: enderecoError } = await supabase
            .from('enderecos')
            .update({
              cep: data.endereco.cep,
              rua: data.endereco.rua,
              numero: data.endereco.numero,
              complemento: data.endereco.complemento,
              bairro: data.endereco.bairro,
              cidade: data.endereco.cidade,
              estado: data.endereco.estado
            })
            .eq('membro_id', id);

          if (enderecoError) {
            console.error('Erro ao atualizar endereço:', enderecoError);
          }
        } else {
          // Inserir novo endereço
          const { error: enderecoError } = await supabase
            .from('enderecos')
            .insert([{
              membro_id: id,
              cep: data.endereco.cep,
              rua: data.endereco.rua,
              numero: data.endereco.numero,
              complemento: data.endereco.complemento,
              bairro: data.endereco.bairro,
              cidade: data.endereco.cidade,
              estado: data.endereco.estado
            }]);

          if (enderecoError) {
            console.error('Erro ao inserir endereço:', enderecoError);
          }
        }
      }

      // Remover empresas existentes e inserir novas
      await supabase
        .from('empresas')
        .delete()
        .eq('membro_id', id);

      if (data.empresas && data.empresas.length > 0) {
        const empresasParaInserir = data.empresas.map(empresa => ({
          membro_id: id,
          nome_empresa: empresa.nome_empresa,
          ramo_atuacao: empresa.ramo_atuacao,
          telefone_contato: empresa.telefone_contato
        }));

        const { error: empresasError } = await supabase
          .from('empresas')
          .insert(empresasParaInserir);

        if (empresasError) {
          console.error('Erro ao inserir empresas:', empresasError);
        }
      }

      // Remover cotas existentes e inserir novas
      await supabase
        .from('cotas')
        .delete()
        .eq('membro_id', id);

      if (data.cotas && data.cotas.length > 0) {
        const cotasParaInserir = data.cotas.map(cota => ({
          membro_id: id,
          grupo_id: cota.grupo_id,
          numero_cota: cota.numero_cota,
          status_cota: cota.status_cota
        }));

        const { error: cotasError } = await supabase
          .from('cotas')
          .insert(cotasParaInserir);

        if (cotasError) {
          console.error('Erro ao inserir cotas:', cotasError);
        }
      }

      // Buscar o membro completo atualizado
      const membroCompleto = await this.getById(id);
      if (!membroCompleto) {
        throw new Error('Erro ao buscar membro atualizado');
      }

      return membroCompleto;
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Membro | null> {
    try {
      const { data, error } = await supabase
        .from('membros')
        .select(`
          *,
          endereco:enderecos(*),
          empresas(*),
          cotas(*, grupos_consorcio(nome_grupo))
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não encontrado
          return null;
        }
        console.error('Erro ao buscar membro:', error);
        throw new Error('Erro ao buscar membro: ' + error.message);
      }

      return {
        id: data.id,
        nome: data.nome,
        nome_completo: data.nome_completo,
        telefone: data.telefone,
        cpf: data.cpf,
        status_membro: data.status_membro,
        created_at: data.created_at,
        updated_at: data.updated_at,
        endereco: data.endereco?.[0] || null,
        empresas: data.empresas || [],
        cotas: (data.cotas || []).map((cota: any) => ({
          ...cota,
          nome_grupo: cota.grupos_consorcio?.nome_grupo
        }))
      };
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('membros')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar membro:', error);
        throw new Error('Erro ao deletar membro: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      // Buscar todos os membros para calcular estatísticas
      const { data: membros, error } = await supabase
        .from('membros')
        .select(`
          status_membro,
          cotas(status_cota)
        `);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw new Error('Erro ao carregar estatísticas: ' + error.message);
      }

      const stats = {
        total: membros?.length || 0,
        preCadastro: membros?.filter(m => m.status_membro === 'PRE_CADASTRO').length || 0,
        cadastroCompleto: membros?.filter(m => m.status_membro === 'CADASTRO_COMPLETO').length || 0,
        contemplados: membros?.filter(m => 
          m.cotas && m.cotas.some((c: any) => c.status_cota === 'CONTEMPLADA')
        ).length || 0
      };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  static async getCotasParticipantes(grupoId: string): Promise<CotaParticipante[]> {
    try {
      const { data, error } = await supabase
        .from('cotas')
        .select(`
          numero_cota,
          membro_id,
          status_cota,
          membros(nome, nome_completo)
        `)
        .eq('grupo_id', grupoId)
        .eq('status_cota', 'ATIVA');

      if (error) {
        console.error('Erro ao buscar cotas participantes:', error);
        throw new Error('Erro ao carregar cotas participantes: ' + error.message);
      }

      return (data || []).map((cota: any) => ({
        numero: cota.numero_cota,
        membroId: cota.membro_id,
        nomeMembro: cota.membros?.nome_completo || cota.membros?.nome || 'Membro não encontrado',
        status: 'participando' as const
      }));
    } catch (error) {
      console.error('Erro ao buscar cotas participantes:', error);
      throw error;
    }
  }

  // Buscar status de pagamentos dos membros
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
}