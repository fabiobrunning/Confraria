import { supabase } from '../lib/supabase';
import { SorteioData, CreateSorteioData, HistoricoSorteio, CotaGanhadora } from '../types/sorteio';

export class SorteioService {
  static async create(data: CreateSorteioData): Promise<SorteioData> {
    try {
      const { data: sorteio, error } = await supabase
        .from('sorteios')
        .insert([{
          grupo_id: data.grupoId,
          nome_grupo: data.nomeGrupo,
          status_sorteio: 'EM_ANDAMENTO'
        }])
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao criar sorteio: ' + error.message);
      }

      return {
        id: sorteio.id,
        grupoId: sorteio.grupo_id,
        nomeGrupo: sorteio.nome_grupo,
        dataHora: new Date(sorteio.data_hora),
        cotasParticipantes: data.cotasParticipantes,
        historico: [],
        status: 'em_andamento'
      };
    } catch (error) {
      console.error('Erro ao criar sorteio:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<SorteioData | null> {
    try {
      const { data: sorteio, error } = await supabase
        .from('sorteios')
        .select(`
          *,
          historico_sorteios(*),
          cota_ganhadora:cotas!cota_ganhadora_id(*, membros(nome, nome_completo))
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar sorteio:', error);
        return null;
      }

      // Buscar cotas participantes
      const { data: cotas, error: cotasError } = await supabase
        .from('cotas')
        .select(`
          *,
          membros(nome, nome_completo)
        `)
        .eq('grupo_id', sorteio.grupo_id)
        .eq('status_cota', 'ATIVA');

      if (cotasError) {
        console.error('Erro ao buscar cotas:', cotasError);
      }

      const cotasParticipantes = (cotas || []).map((cota: any) => ({
        numero: cota.numero_cota,
        membroId: cota.membro_id,
        nomeMembro: cota.membros?.nome_completo || cota.membros?.nome || 'Membro não encontrado',
        status: cota.status_cota === 'CONTEMPLADA' ? 'contemplada' as const : 'participando' as const
      }));

      const historico: HistoricoSorteio[] = (sorteio.historico_sorteios || []).map((h: any) => ({
        etapa: h.etapa,
        numeroSorteado: h.numero_sorteado,
        timestamp: new Date(h.timestamp),
        tipo: h.tipo
      }));

      let cotaGanhadora: CotaGanhadora | undefined;
      if (sorteio.cota_ganhadora) {
        cotaGanhadora = {
          numero: sorteio.cota_ganhadora.numero_cota,
          membroId: sorteio.cota_ganhadora.membro_id,
          nomeGanhador: sorteio.cota_ganhadora.membros?.nome_completo || 
                       sorteio.cota_ganhadora.membros?.nome || 
                       'Membro não encontrado'
        };
      }

      return {
        id: sorteio.id,
        grupoId: sorteio.grupo_id,
        nomeGrupo: sorteio.nome_grupo,
        dataHora: new Date(sorteio.data_hora),
        numeroSorteado: sorteio.numero_sorteado,
        cotaGanhadora,
        cotasParticipantes,
        historico,
        status: sorteio.status_sorteio === 'CONCLUIDO' ? 'concluido' : 'em_andamento'
      };
    } catch (error) {
      console.error('Erro ao buscar sorteio:', error);
      return null;
    }
  }

  static async realizarSorteio(
    sorteioId: string, 
    etapa: 1 | 2 | 3, 
    numeroSorteado: number
  ): Promise<SorteioData> {
    try {
      // Buscar sorteio atual
      const sorteioAtual = await this.getById(sorteioId);
      if (!sorteioAtual) {
        throw new Error('Sorteio não encontrado');
      }

      // Usar função do banco para realizar sorteio
      const { error } = await supabase.rpc('realizar_sorteio', {
        p_grupo_id: sorteioAtual.grupoId,
        p_numero_sorteado: numeroSorteado,
        p_etapa: etapa,
        p_tipo: etapa === 3 ? 'oficial' : 'teste'
      });

      if (error) {
        throw new Error('Erro ao realizar sorteio: ' + error.message);
      }

      // Buscar sorteio atualizado
      const sorteioAtualizado = await this.getById(sorteioId);
      if (!sorteioAtualizado) {
        throw new Error('Erro ao buscar sorteio atualizado');
      }

      return sorteioAtualizado;
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      throw error;
    }
  }

  static async confirmarResultado(sorteioId: string): Promise<SorteioData> {
    try {
      const { data, error } = await supabase
        .from('sorteios')
        .update({ status_sorteio: 'CONCLUIDO' })
        .eq('id', sorteioId)
        .select()
        .single();

      if (error) {
        throw new Error('Erro ao confirmar resultado: ' + error.message);
      }

      // Se há cota ganhadora, atualizar status da cota
      if (data.cota_ganhadora_id) {
        const { error: cotaError } = await supabase
          .from('cotas')
          .update({ 
            status_cota: 'CONTEMPLADA',
            data_contemplacao: new Date().toISOString().split('T')[0],
            valor_contemplacao: 0 // Pode ser atualizado depois
          })
          .eq('id', data.cota_ganhadora_id);

        if (cotaError) {
          console.error('Erro ao atualizar cota:', cotaError);
        }

        // Atualizar contador de sorteios do grupo
        const { error: grupoError } = await supabase
          .rpc('increment', {
            table_name: 'grupos_consorcio',
            row_id: data.grupo_id,
            column_name: 'sorteios_realizados'
          });

        if (grupoError) {
          // Fallback manual se a função increment não existir
          const { data: grupo } = await supabase
            .from('grupos_consorcio')
            .select('sorteios_realizados, sorteios_restantes')
            .eq('id', data.grupo_id)
            .single();

          if (grupo) {
            await supabase
              .from('grupos_consorcio')
              .update({
                sorteios_realizados: grupo.sorteios_realizados + 1,
                sorteios_restantes: Math.max(0, grupo.sorteios_restantes - 1)
              })
              .eq('id', data.grupo_id);
          }
        }
      }

      const sorteioFinal = await this.getById(sorteioId);
      if (!sorteioFinal) {
        throw new Error('Erro ao buscar sorteio final');
      }

      return sorteioFinal;
    } catch (error) {
      console.error('Erro ao confirmar resultado:', error);
      throw error;
    }
  }

  static async getAll(): Promise<SorteioData[]> {
    try {
      const { data, error } = await supabase
        .from('sorteios')
        .select(`
          *,
          historico_sorteios(*),
          cota_ganhadora:cotas!cota_ganhadora_id(*, membros(nome, nome_completo))
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sorteios:', error);
        return [];
      }

      const sorteios: SorteioData[] = [];

      for (const sorteio of data || []) {
        // Buscar cotas participantes para cada sorteio
        const { data: cotas } = await supabase
          .from('cotas')
          .select(`
            *,
            membros(nome, nome_completo)
          `)
          .eq('grupo_id', sorteio.grupo_id)
          .eq('status_cota', 'ATIVA');

        const cotasParticipantes = (cotas || []).map((cota: any) => ({
          numero: cota.numero_cota,
          membroId: cota.membro_id,
          nomeMembro: cota.membros?.nome_completo || cota.membros?.nome || 'Membro não encontrado',
          status: 'participando' as const
        }));

        const historico: HistoricoSorteio[] = (sorteio.historico_sorteios || []).map((h: any) => ({
          etapa: h.etapa,
          numeroSorteado: h.numero_sorteado,
          timestamp: new Date(h.timestamp),
          tipo: h.tipo
        }));

        let cotaGanhadora: CotaGanhadora | undefined;
        if (sorteio.cota_ganhadora) {
          cotaGanhadora = {
            numero: sorteio.cota_ganhadora.numero_cota,
            membroId: sorteio.cota_ganhadora.membro_id,
            nomeGanhador: sorteio.cota_ganhadora.membros?.nome_completo || 
                         sorteio.cota_ganhadora.membros?.nome || 
                         'Membro não encontrado'
          };
        }

        sorteios.push({
          id: sorteio.id,
          grupoId: sorteio.grupo_id,
          nomeGrupo: sorteio.nome_grupo,
          dataHora: new Date(sorteio.data_hora),
          numeroSorteado: sorteio.numero_sorteado,
          cotaGanhadora,
          cotasParticipantes,
          historico,
          status: sorteio.status_sorteio === 'CONCLUIDO' ? 'concluido' : 'em_andamento'
        });
      }

      return sorteios;
    } catch (error) {
      console.error('Erro ao buscar sorteios:', error);
      return [];
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sorteios')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error('Erro ao deletar sorteio: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao deletar sorteio:', error);
      throw error;
    }
  }
}