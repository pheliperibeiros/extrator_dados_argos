import React, { useState } from 'react';
import { 
  Briefcase, 
  Tag, 
  Hash, 
  FileCheck, 
  Edit3, 
  Save, 
  Copy, 
  Check, 
  Info,
  ShieldCheck 
} from 'lucide-react';
import type { CasoRow, DuvidaRevisao } from '../types/gaeco.ts';
import { CASO_COLUMNS } from '../utils/rules.ts';

interface CaseTableProps {
  caso: CasoRow;
  duvidas: DuvidaRevisao[];
  onUpdateCaso: (updated: Partial<CasoRow>) => void;
  onOpenDuvidas?: () => void;
}

export const CaseTable: React.FC<CaseTableProps> = ({
  caso,
  duvidas,
  onUpdateCaso,
  onOpenDuvidas,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<CasoRow>({ ...caso });

  const handleSave = () => {
    onUpdateCaso(formData);
    setIsEditing(false);
  };

  const handleCopyRow = () => {
    const values = CASO_COLUMNS.map(col => caso[col] ?? '');
    navigator.clipboard.writeText(values.join('\t'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tagsList = caso.Tags ? caso.Tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Planilha do Caso
                {caso.Codinome && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {caso.Codinome}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Dados consolidados da denúncia ministerial e investigação de origem
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyRow}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar Linha TSV'}
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Alterações
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFormData({ ...caso });
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Dados do Caso
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Representation */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl shadow-inner bg-slate-950">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-3 min-w-[140px] border-r border-slate-800">Tipo</th>
              <th className="p-3 min-w-[100px] border-r border-slate-800 text-slate-600">
                Status (Em Branco)
              </th>
              <th className="p-3 min-w-[130px] border-r border-slate-800 text-slate-600">
                Numero_Eproc (Em Branco)
              </th>
              <th className="p-3 min-w-[160px] border-r border-slate-800 text-slate-200">
                Numero_IntegrarE
              </th>
              <th className="p-3 min-w-[280px] border-r border-slate-800 text-slate-200">Tags</th>
              <th className="p-3 min-w-[120px] border-r border-slate-800 text-slate-600">
                Data_Criacao (Em Branco)
              </th>
              <th className="p-3 min-w-[120px] border-r border-slate-800 text-slate-600">
                Criado_Por (Em Branco)
              </th>
              <th className="p-3 min-w-[200px] border-r border-slate-800 text-slate-200">
                Eproc_Investigacao
              </th>
              <th className="p-3 min-w-[180px] text-slate-200">Codinome</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-900/40">
              {/* Tipo */}
              <td className="p-3 border-r border-slate-800 font-semibold text-slate-200">
                {isEditing ? (
                  <select
                    value={formData.Tipo}
                    onChange={e => setFormData({ ...formData, Tipo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    <option value="Ação Penal">Ação Penal</option>
                    <option value="PIC">PIC</option>
                    <option value="Inquérito Policial">Inquérito Policial</option>
                  </select>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold inline-block">
                    {caso.Tipo || 'Ação Penal'}
                  </span>
                )}
              </td>

              {/* Status (Sempre em Branco) */}
              <td className="p-3 border-r border-slate-800 font-mono text-center text-slate-600 bg-slate-950/70">
                —
              </td>

              {/* Numero_Eproc (Sempre em Branco) */}
              <td className="p-3 border-r border-slate-800 font-mono text-center text-slate-600 bg-slate-950/70">
                —
              </td>

              {/* Numero_IntegrarE */}
              <td className="p-3 border-r border-slate-800 font-mono text-amber-300">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Numero_IntegrarE}
                    onChange={e => setFormData({ ...formData, Numero_IntegrarE: e.target.value })}
                    placeholder="Ex: MPTO-2024/008472-G"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                  />
                ) : (
                  caso.Numero_IntegrarE || '—'
                )}
              </td>

              {/* Tags */}
              <td className="p-3 border-r border-slate-800">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Tags}
                    onChange={e => setFormData({ ...formData, Tags: e.target.value })}
                    placeholder="organização-criminosa, tráfico-de-drogas, lavagem-de-capitais"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {tagsList.length > 0 ? (
                      tagsList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                )}
              </td>

              {/* Data_Criacao (Em branco) */}
              <td className="p-3 border-r border-slate-800 font-mono text-center text-slate-600 bg-slate-950/70">
                —
              </td>

              {/* Criado_Por (Em branco) */}
              <td className="p-3 border-r border-slate-800 font-mono text-center text-slate-600 bg-slate-950/70">
                —
              </td>

              {/* Eproc_Investigacao */}
              <td className="p-3 border-r border-slate-800 font-mono text-slate-200">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Eproc_Investigacao}
                    onChange={e => setFormData({ ...formData, Eproc_Investigacao: e.target.value })}
                    placeholder="Ex: 5002148-32.2024.8.27.2700"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono"
                  />
                ) : (
                  caso.Eproc_Investigacao || '—'
                )}
              </td>

              {/* Codinome */}
              <td className="p-3 font-semibold text-amber-400">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.Codinome}
                    onChange={e => setFormData({ ...formData, Codinome: e.target.value })}
                    placeholder="Ex: Operação Tempestade de Areia"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  />
                ) : (
                  caso.Codinome || '—'
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Field explanations for GAECO compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
            <Info className="w-4 h-4 text-amber-400" />
            Eproc da Investigação
          </div>
          <p className="text-xs text-slate-400">
            Representa o número do procedimento de origem (se PIC, o eproc do PIC; se IP, o eproc do Inquérito Policial).
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
            <Tag className="w-4 h-4 text-emerald-400" />
            Tags Padronizadas
          </div>
          <p className="text-xs text-slate-400">
            Identificam os crimes denunciados e peculiaridades (ex: organização-criminosa, tráfico-de-drogas, lavagem-de-capitais).
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Campos em Branco Obrigatórios
          </div>
          <p className="text-xs text-slate-400">
            Por determinação das regras de importação do GAECO, <em>Status</em>, <em>Numero_Eproc</em>, <em>Data_Criacao</em> e <em>Criado_Por</em> permanecem em branco.
          </p>
        </div>
      </div>
    </div>
  );
};
