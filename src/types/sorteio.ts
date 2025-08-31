export interface CotaGanhadora {
  numero: string;
  membroId: string;
  nomeGanhador: string;
}

export interface HistoricoSorteio {
  etapa: 1 | 2 | 3;
  numeroSorteado: number;
  timestamp: Date;
  tipo: "teste" | "oficial";
}

export interface SorteioData {
  id: string;
  grupoId: string;
  nomeGrupo: string;
  dataHora: Date;
  numeroSorteado?: number; // 1-60
  cotaGanhadora?: CotaGanhadora;
  cotasParticipantes: CotaParticipante[];
  historico: HistoricoSorteio[];
  status: "em_andamento" | "concluido";
}

export interface CreateSorteioData {
  grupoId: string;
  nomeGrupo: string;
  cotasParticipantes: CotaParticipante[];
}