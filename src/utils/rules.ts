import type { EntidadeRow, CasoRow } from '../types/gaeco.ts';

export const ENTIDADES_COLUMNS: (keyof Omit<EntidadeRow, 'id'>)[] = [
  'Tipo_Entidade',
  'Nome',
  'Documento',
  'Faccao',
  'Vinculos',
  'Vulgo',
  'Nascimento',
  'Nome_Pai',
  'Nome_Mae',
  'Papel',
  'Observacoes',
  'Razao_Social',
  'Abertura',
  'Situacao',
  'Capital_Social',
  'Enderecos',
  'Socios',
];

export const CASO_COLUMNS: (keyof Omit<CasoRow, 'id'>)[] = [
  'Tipo',
  'Status',
  'Numero_Eproc',
  'Numero_IntegrarE',
  'Tags',
  'Data_Criacao',
  'Criado_Por',
  'Eproc_Investigacao',
  'Codinome',
];

/**
 * Formats a Brazilian CPF into nnn.nnn.nnn-nn.
 * If CNPJ, formats into nn.nnn.nnn/nnnn-nn.
 * If already formatted or invalid length, cleans and normalizes or returns as is.
 */
export function formatDocumento(doc: string, tipo: 'PF' | 'PJ' = 'PF'): string {
  if (!doc) return '';
  const digits = doc.replace(/\D/g, '');
  
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  return doc.trim();
}

/**
 * Normalizes dates to dd/mm/aaaa format if possible.
 */
export function formatDataNascimento(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();
  
  // yyyy-mm-dd
  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  
  // dd/mm/yyyy
  const brMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (brMatch) {
    const [, d, m, y] = brMatch;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }

  return clean;
}

/**
 * Normalizes crime/case tags into slugified comma-separated list.
 * Ex: "Organização Criminosa, Tráfico de Drogas" -> "organização-criminosa, tráfico-de-drogas"
 */
export function normalizeTags(tagsStr: string): string {
  if (!tagsStr) return '';
  const parts = tagsStr.split(/[,;\n]+/).map(t => t.trim()).filter(Boolean);
  return parts.map(part => {
    return part
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9áàâãéêíóôõúüç\-]/g, '');
  }).join(', ');
}

/**
 * Ensures required blank fields stay blank as mandated by the GAECO specification.
 */
export function sanitizeEntidadeRow(row: Partial<EntidadeRow>): EntidadeRow {
  return {
    id: row.id || `ent_${Math.random().toString(36).slice(2, 9)}`,
    Tipo_Entidade: row.Tipo_Entidade === 'PJ' ? 'PJ' : 'PF',
    Nome: (row.Nome || '').trim(),
    Documento: formatDocumento(row.Documento || '', row.Tipo_Entidade === 'PJ' ? 'PJ' : 'PF'),
    Faccao: (row.Faccao || '').trim(),
    Vinculos: '', // SEMPRE EM BRANCO
    Vulgo: (row.Vulgo || '').trim(),
    Nascimento: formatDataNascimento(row.Nascimento || ''),
    Nome_Pai: (row.Nome_Pai || '').trim(),
    Nome_Mae: (row.Nome_Mae || '').trim(),
    Papel: (row.Papel || 'Operacional').trim(),
    Observacoes: (row.Observacoes || '').trim(),
    Razao_Social: (row.Razao_Social || '').trim(),
    Abertura: (row.Abertura || '').trim(),
    Situacao: (row.Situacao || '').trim(),
    Capital_Social: (row.Capital_Social || '').trim(),
    Enderecos: (row.Enderecos || '').trim(),
    Socios: (row.Socios || '').trim(),
  };
}

/**
 * Ensures required blank fields stay blank as mandated for Caso.
 */
export function sanitizeCasoRow(row: Partial<CasoRow>): CasoRow {
  return {
    id: row.id || `caso_${Math.random().toString(36).slice(2, 9)}`,
    Tipo: row.Tipo || 'Ação Penal',
    Status: '', // Sempre em Branco
    Numero_Eproc: '', // Sempre em Branco
    Numero_IntegrarE: (row.Numero_IntegrarE || '').trim(),
    Tags: normalizeTags(row.Tags || ''),
    Data_Criacao: '', // Em branco
    Criado_Por: '', // Em branco
    Eproc_Investigacao: (row.Eproc_Investigacao || '').trim(),
    Codinome: (row.Codinome || '').trim(),
  };
}

/**
 * Generates CSV string for Entidades according to exact column schema.
 */
export function generateEntidadesCSV(rows: EntidadeRow[]): string {
  const header = ENTIDADES_COLUMNS.join(';');
  const dataLines = rows.map(r => {
    return ENTIDADES_COLUMNS.map(col => {
      const val = (r[col] ?? '').toString().replace(/"/g, '""');
      return `"${val}"`;
    }).join(';');
  });
  return [header, ...dataLines].join('\r\n');
}

/**
 * Generates CSV string for Caso according to exact column schema.
 */
export function generateCasoCSV(caso: CasoRow): string {
  const header = CASO_COLUMNS.join(';');
  const valLine = CASO_COLUMNS.map(col => {
    const val = (caso[col] ?? '').toString().replace(/"/g, '""');
    return `"${val}"`;
  }).join(';');
  return [header, valLine].join('\r\n');
}

/**
 * Generates TSV string for easy copy-paste to Excel or Google Sheets.
 */
export function generateTableTSV<T extends Record<string, any>>(columns: string[], rows: T[]): string {
  const header = columns.join('\t');
  const lines = rows.map(r => {
    return columns.map(c => (r[c] ?? '').toString().replace(/\t|\r?\n/g, ' ')).join('\t');
  });
  return [header, ...lines].join('\n');
}
