import * as XLSX from 'xlsx';
import type { EntidadeRow, CasoRow } from '../types/gaeco.ts';
import { ENTIDADES_COLUMNS, CASO_COLUMNS } from './rules.ts';

/**
 * Exports both spreadsheets ("Entidades" and "Caso") in a single Excel .xlsx workbook
 * preserving the exact order of columns specified by the GAECO guidelines.
 */
export function exportToExcelWorkbook(
  entidades: EntidadeRow[],
  caso: CasoRow,
  filename = 'GAECO_Extracao_Denuncia.xlsx'
) {
  const wb = XLSX.utils.book_new();

  // 1. Prepare Entidades sheet
  const entidadesData = entidades.map(row => {
    const obj: Record<string, string> = {};
    for (const col of ENTIDADES_COLUMNS) {
      obj[col] = (row[col] ?? '').toString();
    }
    return obj;
  });

  const wsEntidades = XLSX.utils.json_to_sheet(entidadesData, {
    header: ENTIDADES_COLUMNS as string[],
  });

  // Set column widths for readability
  wsEntidades['!cols'] = [
    { wch: 14 }, // Tipo_Entidade
    { wch: 32 }, // Nome
    { wch: 18 }, // Documento
    { wch: 12 }, // Faccao
    { wch: 10 }, // Vinculos
    { wch: 18 }, // Vulgo
    { wch: 14 }, // Nascimento
    { wch: 28 }, // Nome_Pai
    { wch: 28 }, // Nome_Mae
    { wch: 20 }, // Papel
    { wch: 45 }, // Observacoes
    { wch: 28 }, // Razao_Social
    { wch: 14 }, // Abertura
    { wch: 14 }, // Situacao
    { wch: 18 }, // Capital_Social
    { wch: 40 }, // Enderecos
    { wch: 30 }, // Socios
  ];

  XLSX.utils.book_append_sheet(wb, wsEntidades, 'Entidades');

  // 2. Prepare Caso sheet
  const casoData = [
    (() => {
      const obj: Record<string, string> = {};
      for (const col of CASO_COLUMNS) {
        obj[col] = (caso[col] ?? '').toString();
      }
      return obj;
    })(),
  ];

  const wsCaso = XLSX.utils.json_to_sheet(casoData, {
    header: CASO_COLUMNS as string[],
  });

  wsCaso['!cols'] = [
    { wch: 20 }, // Tipo
    { wch: 10 }, // Status
    { wch: 14 }, // Numero_Eproc
    { wch: 22 }, // Numero_IntegrarE
    { wch: 40 }, // Tags
    { wch: 14 }, // Data_Criacao
    { wch: 14 }, // Criado_Por
    { wch: 26 }, // Eproc_Investigacao
    { wch: 28 }, // Codinome
  ];

  XLSX.utils.book_append_sheet(wb, wsCaso, 'Caso');

  // 3. Trigger download
  XLSX.writeFile(wb, filename);
}

/**
 * Downloads a string as a CSV file with BOM for Microsoft Excel compatibility with UTF-8 Portuguese characters.
 */
export function downloadCSV(csvContent: string, filename: string) {
  // \uFEFF BOM allows Excel to open UTF-8 CSV with special Portuguese characters (ç, ã, é) correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
