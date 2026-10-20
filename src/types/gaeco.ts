export type TipoEntidade = 'PF' | 'PJ';

export type PapelInvestigado = 
  | 'Liderança'
  | 'Gerencia'
  | 'Operacional'
  | 'Facilitador'
  | 'Facilitador e Laranja'
  | string;

export interface EntidadeRow {
  id: string;
  Tipo_Entidade: 'PF' | 'PJ';
  Nome: string;
  Documento: string; // CPF format nnn.nnn.nnn-nn or CNPJ
  Faccao: string; // PCC, ADE, CV, etc.
  Vinculos: string; // SEMPRE EM BRANCO
  Vulgo: string;
  Nascimento: string; // dd/mm/aaaa
  Nome_Pai: string;
  Nome_Mae: string;
  Papel: PapelInvestigado;
  Observacoes: string;
  Razao_Social: string;
  Abertura: string;
  Situacao: string;
  Capital_Social: string;
  Enderecos: string;
  Socios: string;
}

export type TipoCaso = 'Inquérito Policial' | 'PIC' | 'Ação Penal' | string;

export interface CasoRow {
  id: string;
  Tipo: TipoCaso;
  Status: string; // Sempre em Branco
  Numero_Eproc: string; // Sempre em Branco
  Numero_IntegrarE: string; // Numero do Integrar-e no MP
  Tags: string; // Ex: "organização-criminosa, tráfico-de-drogas, lavagem-de-capitais"
  Data_Criacao: string; // Em branco
  Criado_Por: string; // Em branco
  Eproc_Investigacao: string; // Eproc da investigação (PIC ou Inquérito Policial)
  Codinome: string; // Nome da Investigação
}

export interface DuvidaRevisao {
  id: string;
  targetType: 'entidade' | 'caso';
  targetId: string; // id da linha ou do caso
  targetName: string; // ex: "João da Silva" ou "Caso Geral"
  field: string; // ex: "Papel", "Documento", "Faccao", "Vulgo"
  currentValue: string;
  question: string;
  snippet: string; // Trecho exato da denúncia
  context: string; // Pequeno contexto ao redor do trecho
  suggestedOptions?: string[];
  resolved: boolean;
}

export interface ExtractionResult {
  caso: CasoRow;
  entidades: EntidadeRow[];
  duvidas: DuvidaRevisao[];
  rawTextPreview?: string;
  documentTitle?: string;
}
