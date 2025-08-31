export interface Endereco {
  id?: string;
  membro_id?: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  created_at?: string;
  updated_at?: string;
}

export interface Empresa {
  id?: string;
  membro_id?: string;
  nome_empresa: string;
  ramo_atuacao: string;
  telefone_contato: string;
  created_at?: string;
  updated_at?: string;
}

export interface CotaConsorcio {
  id?: string;
  membro_id?: string;
  grupo_id: string;
  numero_cota: string;
  status_cota: 'ATIVA' | 'CANCELADA' | 'CONTEMPLADA' | 'EM_VERIFICACAO';
  data_contemplacao?: string;
  valor_contemplacao?: number;
  nome_grupo?: string; // Para exibição
  created_at?: string;
  updated_at?: string;
}

export interface Membro {
  id: string;
  nome: string;
  nome_completo?: string;
  telefone: string;
  cpf?: string;
  status_membro: 'PRE_CADASTRO' | 'CADASTRO_COMPLETO';
  endereco?: Endereco;
  empresas?: Empresa[];
  cotas?: CotaConsorcio[];
  created_at: string;
  updated_at: string;
}

export interface PreCadastroData {
  nome: string;
  telefone: string;
}

export interface CadastroCompletoData {
  nome_completo: string;
  cpf: string;
  endereco?: Endereco;
  empresas: Empresa[];
  cotas: CotaConsorcio[];
}

export interface CotaParticipante {
  numero: string; // ex: "025"
  membroId: string;
  nomeMembro: string;
  status: "participando" | "contemplada";
}

export interface Sorteio {
  id: string;
  grupo_id: string;
  cota_id: string;
  numero_sorteio: number;
  data_sorteio: string;
  valor_contemplacao: number;
  observacoes?: string;
  created_at: string;
}