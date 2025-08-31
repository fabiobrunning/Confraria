export interface ArquivoDocumento {
  nomeOriginal: string;
  nomeArquivo: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  urlArquivo: string;
  dataUpload: Date;
}

export interface VersaoHistorico {
  versao: string;
  dataVersao: Date;
  alteradoPor: string;
  observacoes: string;
  arquivoAnterior: ArquivoDocumento;
}

export interface Documento {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'minuta' | 'contrato' | 'regras' | 'regulamento' | 'ata' | 'outros';
  grupoId: string | null;
  nomeGrupo?: string;
  arquivo: ArquivoDocumento;
  uploadPor: string;
  dataUpload: Date;
  dataAtualizacao: Date;
  versao: string;
  status: 'ativo' | 'arquivado' | 'rascunho';
  acessoPublico: boolean;
  tags: string[];
  historicoVersoes: VersaoHistorico[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentoData {
  nome: string;
  descricao: string;
  categoria: 'minuta' | 'contrato' | 'regras' | 'regulamento' | 'ata' | 'outros';
  grupoId: string | null;
  arquivo: File;
  versao?: string;
  status?: 'ativo' | 'arquivado' | 'rascunho';
  acessoPublico?: boolean;
  tags?: string[];
  observacoes?: string;
}

export interface UpdateDocumentoData {
  nome?: string;
  descricao?: string;
  categoria?: 'minuta' | 'contrato' | 'regras' | 'regulamento' | 'ata' | 'outros';
  grupoId?: string | null;
  status?: 'ativo' | 'arquivado' | 'rascunho';
  acessoPublico?: boolean;
  tags?: string[];
}

export interface NovaVersaoData {
  arquivo: File;
  versao: string;
  observacoes: string;
}

export interface FiltrosDocumento {
  categoria?: string;
  grupoId?: string;
  status?: string;
  acessoPublico?: boolean;
  termoBusca?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface EstatisticasDocumentos {
  totalDocumentos: number;
  documentosPublicos: number;
  documentosPrivados: number;
  porCategoria: { [key: string]: number };
  porStatus: { [key: string]: number };
  documentosRecentes: number;
}

export const CATEGORIAS_DOCUMENTO = {
  minuta: {
    nome: 'Minutas',
    descricao: 'Minutas de reuniões e assembleias',
    icone: '📝'
  },
  contrato: {
    nome: 'Contratos',
    descricao: 'Contratos de adesão e termos',
    icone: '📄'
  },
  regras: {
    nome: 'Regras',
    descricao: 'Regras específicas dos grupos',
    icone: '📋'
  },
  regulamento: {
    nome: 'Regulamentos',
    descricao: 'Regulamentos gerais da confraria',
    icone: '⚖️'
  },
  ata: {
    nome: 'Atas',
    descricao: 'Atas de sorteios e reuniões',
    icone: '📊'
  },
  outros: {
    nome: 'Outros',
    descricao: 'Outros documentos diversos',
    icone: '📁'
  }
} as const;

export const STATUS_DOCUMENTO = {
  ativo: {
    nome: 'Ativo',
    cor: 'bg-green-100 text-green-800'
  },
  arquivado: {
    nome: 'Arquivado',
    cor: 'bg-gray-100 text-gray-800'
  },
  rascunho: {
    nome: 'Rascunho',
    cor: 'bg-yellow-100 text-yellow-800'
  }
} as const;