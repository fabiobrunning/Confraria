export interface Comprovante {
  nomeArquivo: string;
  tipoArquivo: string; // "image/jpeg", "image/png", "application/pdf"
  tamanhoArquivo: number;
  urlArquivo: string; // base64 ou URL
  dataUpload: Date;
}

export interface Pagamento {
  id: string;
  membroId: string;
  grupoId: string;
  numeroCota: string;
  mesReferencia: string; // "2024-08" formato YYYY-MM
  valorParcela: number;
  dataPagamento: Date | null;
  tipoPagamento: "pix" | "dinheiro" | "transferencia" | "cartao";
  statusPagamento: "pendente" | "pago" | "atrasado" | "isento";
  comprovante: Comprovante | null;
  validadoPor: string | null; // ID do admin que validou
  dataValidacao: Date | null;
  observacoes: string;
  created_at: string;
  updated_at: string;
}

export interface StatusMembroGrupo {
  membroId: string;
  grupoId: string;
  nome: string;
  nomeCompleto: string | null;
  nomeGrupo: string;
  statusGeral: "em_dia" | "atrasado" | "inadimplente" | "atencao";
  ultimoPagamento: Date | null;
  proximoVencimento: Date;
  totalPago: number;
  parcelasAtrasadas: number;
  comprovantesPendentes: number;
}

export interface CreatePagamentoData {
  membroId: string;
  grupoId: string;
  numeroCota: string;
  mesReferencia: string;
  valorParcela: number;
  tipoPagamento: "pix" | "dinheiro" | "transferencia" | "cartao";
  observacoes?: string;
}

export interface UploadComprovanteData {
  pagamentoId: string;
  arquivo: File;
  observacoes?: string;
}

export interface ValidacaoComprovante {
  pagamentoId: string;
  aprovado: boolean;
  observacoes: string;
  validadoPor: string;
}

export interface RelatorioPagamentos {
  totalArrecadado: number;
  membrosEmDia: number;
  membrosAtrasados: number;
  membrosInadimplentes: number;
  comprovantesValidados: number;
  comprovantesRejeitados: number;
  taxaAdimplencia: number;
}

export interface FiltrosPagamento {
  grupoId?: string;
  mesReferencia?: string;
  statusPagamento?: string;
  membroId?: string;
  validacao?: 'pendente' | 'validado' | 'rejeitado';
}