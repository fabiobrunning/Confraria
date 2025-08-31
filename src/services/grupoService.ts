import { supabase } from '../lib/supabase';
import { GrupoConsorcio, CreateGrupoData } from '../types/grupo';

export class GrupoService {
  static async getAll(): Promise<GrupoConsorcio[]> {
    try {
      const { data, error } = await supabase
        .from('grupos_consorcio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar grupos:', error);
        throw new Error('Erro ao carregar grupos: ' + error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      throw error;
    }
  }

  static async create(grupoData: CreateGrupoData): Promise<GrupoConsorcio> {
    try {
      const { data, error } = await supabase
        .from('grupos_consorcio')
        .insert([{
          nome_grupo: grupoData.nome_grupo,
          numero_grupo: grupoData.numero_grupo,
          nome_bem: grupoData.nome_bem,
          valor_bem: grupoData.valor_bem,
          quantidade_cotas: grupoData.quantidade_cotas,
          valor_parcela: grupoData.valor_parcela,
          data_inicio: grupoData.data_inicio,
          sorteios_restantes: grupoData.sorteios_restantes,
          status_grupo: 'ATIVO'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar grupo:', error);
        throw new Error('Erro ao criar grupo: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<GrupoConsorcio>): Promise<GrupoConsorcio> {
    try {
      const { data, error } = await supabase
        .from('grupos_consorcio')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar grupo:', error);
        throw new Error('Erro ao atualizar grupo: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grupos_consorcio')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar grupo:', error);
        throw new Error('Erro ao deletar grupo: ' + error.message);
      }
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      // Buscar todos os grupos para calcular estatísticas
      const { data: grupos, error } = await supabase
        .from('grupos_consorcio')
        .select('status_grupo, sorteios_realizados, sorteios_restantes, quantidade_cotas');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw new Error('Erro ao carregar estatísticas: ' + error.message);
      }

      const stats = {
        total: grupos?.length || 0,
        aguardando: grupos?.filter(g => g.sorteios_realizados === 0).length || 0,
        andamento: grupos?.filter(g => 
          g.status_grupo === 'ATIVO' && 
          g.sorteios_realizados > 0 && 
          g.sorteios_restantes > 0
        ).length || 0,
        finalizado: grupos?.filter(g => g.sorteios_restantes === 0).length || 0,
        totalCotas: grupos?.reduce((sum, g) => sum + (g.quantidade_cotas || 0), 0) || 0
      };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<GrupoConsorcio | null> {
    try {
      const { data, error } = await supabase
        .from('grupos_consorcio')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não encontrado
          return null;
        }
        console.error('Erro ao buscar grupo:', error);
        throw new Error('Erro ao buscar grupo: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      throw error;
    }
  }
}