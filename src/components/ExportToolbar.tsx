import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Copy, 
  Check, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import type { EntidadeRow, CasoRow, DuvidaRevisao } from '../types/gaeco.ts';
import { exportToExcelWorkbook, downloadCSV } from '../utils/excelExport.ts';
import { generateEntidadesCSV, generateCasoCSV, generateTableTSV, ENTIDADES_COLUMNS, CASO_COLUMNS } from '../utils/rules.ts';

interface ExportToolbarProps {
  entidades: EntidadeRow[];
  caso: CasoRow;
  duvidas: DuvidaRevisao[];
  onOpenDuvidas: () => void;
  activeTab: 'entidades' | 'caso';
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  entidades,
  caso,
  duvidas,
  onOpenDuvidas,
  activeTab,
}) => {
  const [copiedTSV, setCopiedTSV] = useState(false);
  const pendingDuvidas = duvidas.filter(d => !d.resolved);

  const handleExportExcel = () => {
    const filename = caso.Codinome
      ? `GAECO_${caso.Codinome.replace(/\s+/g, '_')}_Dados.xlsx`
      : 'GAECO_Extracao_Denuncia.xlsx';
    exportToExcelWorkbook(entidades, caso, filename);
  };

  const handleExportCSVEntidades = () => {
    const csv = generateEntidadesCSV(entidades);
    downloadCSV(csv, 'GAECO_Planilha_Entidades.csv');
  };

  const handleExportCSVCaso = () => {
    const csv = generateCasoCSV(caso);
    downloadCSV(csv, 'GAECO_Planilha_Caso.csv');
  };

  const handleCopyActiveTSV = () => {
    if (activeTab === 'entidades') {
      const tsv = generateTableTSV(ENTIDADES_COLUMNS as string[], entidades);
      navigator.clipboard.writeText(tsv);
    } else {
      const tsv = generateTableTSV(CASO_COLUMNS as string[], [caso]);
      navigator.clipboard.writeText(tsv);
    }
    setCopiedTSV(true);
    setTimeout(() => setCopiedTSV(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Layers className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Exportação Oficial GAECO
            <span className="text-[11px] font-normal text-slate-400">
              ({entidades.length} alvos cadastrados)
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Arquivos formatados de acordo com os padrões dos sistemas MPTO / Integrar-e / Eproc
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {pendingDuvidas.length > 0 && (
          <button
            type="button"
            onClick={onOpenDuvidas}
            className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Revisar {pendingDuvidas.length} Dúvida(s)
          </button>
        )}

        <button
          type="button"
          onClick={handleCopyActiveTSV}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          title="Copiar aba ativa no formato de colar direto no Excel ou Google Sheets"
        >
          {copiedTSV ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copiedTSV ? 'Copiado para Área de Transferência!' : `Copiar ${activeTab === 'entidades' ? 'Entidades' : 'Caso'} (TSV)`}
        </button>

        <button
          type="button"
          onClick={activeTab === 'entidades' ? handleExportCSVEntidades : handleExportCSVCaso}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <FileText className="w-4 h-4 text-sky-400" />
          Exportar CSV ({activeTab === 'entidades' ? 'Entidades' : 'Caso'})
        </button>

        <button
          type="button"
          onClick={handleExportExcel}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-950 active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Baixar Excel Completo (.xlsx)
        </button>
      </div>
    </div>
  );
};
