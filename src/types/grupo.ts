export interface GrupoConsorcio {
  id: string;
  nome_grupo: string;
  numero_grupo: number;
  nome_bem: string;
  valor_bem: number;
  quantidade_cotas: number;
  valor_parcela: number;
  data_inicio: string;
  status_grupo: 'ATIVO' | 'ARQUIVADO';
  sorteios_realizados: number;
  sorteios_restantes: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGrupoData {
  nome_grupo: string;
  numero_grupo: number;
  nome_bem: string;
  valor_bem: number;
  quantidade_cotas: number;
  valor_parcela: number;
  data_inicio: string;
  sorteios_restantes: number;
}