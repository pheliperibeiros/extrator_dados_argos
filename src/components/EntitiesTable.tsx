import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Check, 
  Copy, 
  Users, 
  Building2, 
  UserCheck, 
  HelpCircle,
  X
} from 'lucide-react';
import type { EntidadeRow, DuvidaRevisao } from '../types/gaeco.ts';
import { ENTIDADES_COLUMNS, formatDocumento } from '../utils/rules.ts';

interface EntitiesTableProps {
  entidades: EntidadeRow[];
  duvidas: DuvidaRevisao[];
  onUpdateEntidade: (id: string, updated: Partial<EntidadeRow>) => void;
  onDeleteEntidade: (id: string) => void;
  onAddEntidade: () => void;
  onOpenDuvidaForTarget?: (targetName: string, field?: string) => void;
}

export const EntitiesTable: React.FC<EntitiesTableProps> = ({
  entidades,
  duvidas,
  onUpdateEntidade,
  onDeleteEntidade,
  onAddEntidade,
  onOpenDuvidaForTarget,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [papelFilter, setPapelFilter] = useState<string>('all');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Filtered rows
  const filtered = entidades.filter(e => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      e.Nome.toLowerCase().includes(term) ||
      e.Documento.toLowerCase().includes(term) ||
      e.Vulgo.toLowerCase().includes(term) ||
      e.Faccao.toLowerCase().includes(term) ||
      e.Observacoes.toLowerCase().includes(term);

    const matchesPapel = papelFilter === 'all' || e.Papel === papelFilter;
    return matchesSearch && matchesPapel;
  });

  const getPapelBadgeClass = (papel: string) => {
    switch (papel) {
      case 'Liderança':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Gerencia':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Operacional':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Facilitador':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'Facilitador e Laranja':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleCopyRow = (e: EntidadeRow) => {
    const values = ENTIDADES_COLUMNS.map(col => e[col] ?? '');
    navigator.clipboard.writeText(values.join('\t'));
    setCopiedRowId(e.id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, CPF, vulgo, facção ou notas..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={papelFilter}
            onChange={e => setPapelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos os Papéis ({entidades.length})</option>
            <option value="Liderança">Liderança</option>
            <option value="Gerencia">Gerencia</option>
            <option value="Operacional">Operacional</option>
            <option value="Facilitador">Facilitador</option>
            <option value="Facilitador e Laranja">Facilitador e Laranja</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddEntidade}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Adicionar Alvo / Entidade
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[650px] shadow-inner bg-slate-950">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/95 sticky top-0 z-20 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
            <tr>
              <th className="p-3 w-10 text-center bg-slate-950/95 border-r border-slate-800">#</th>
              <th className="p-3 w-16 bg-slate-950/95 border-r border-slate-800">Tipo</th>
              <th className="p-3 min-w-[220px] bg-slate-950/95 border-r border-slate-800 text-slate-200">
                Nome (Alvo)
              </th>
              <th className="p-3 min-w-[140px] bg-slate-950/95 border-r border-slate-800">Documento (CPF)</th>
              <th className="p-3 min-w-[90px] bg-slate-950/95 border-r border-slate-800">Facção</th>
              <th className="p-3 min-w-[90px] bg-slate-950/95 border-r border-slate-800 text-slate-600">
                Vínculos (Em Branco)
              </th>
              <th className="p-3 min-w-[130px] bg-slate-950/95 border-r border-slate-800">Vulgo</th>
              <th className="p-3 min-w-[110px] bg-slate-950/95 border-r border-slate-800">Nascimento</th>
              <th className="p-3 min-w-[180px] bg-slate-950/95 border-r border-slate-800">Nome Pai</th>
              <th className="p-3 min-w-[180px] bg-slate-950/95 border-r border-slate-800">Nome Mãe</th>
              <th className="p-3 min-w-[160px] bg-slate-950/95 border-r border-slate-800">Papel</th>
              <th className="p-3 min-w-[280px] bg-slate-950/95 border-r border-slate-800">Observações</th>
              <th className="p-3 min-w-[200px] bg-slate-950/95 border-r border-slate-800">Razão Social (PJ)</th>
              <th className="p-3 min-w-[100px] bg-slate-950/95 border-r border-slate-800">Abertura</th>
              <th className="p-3 min-w-[100px] bg-slate-950/95 border-r border-slate-800">Situação</th>
              <th className="p-3 min-w-[130px] bg-slate-950/95 border-r border-slate-800">Capital Social</th>
              <th className="p-3 min-w-[260px] bg-slate-950/95 border-r border-slate-800">Endereços</th>
              <th className="p-3 min-w-[200px] bg-slate-950/95 border-r border-slate-800">Sócios</th>
              <th className="p-3 w-20 text-center bg-slate-950/95">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={19} className="p-8 text-center text-slate-500">
                  Nenhuma entidade encontrada para os filtros aplicados.
                </td>
              </tr>
            ) : (
              filtered.map((e, index) => {
                const targetDuvidas = duvidas.filter(
                  d => !d.resolved && d.targetName.toLowerCase() === e.Nome.toLowerCase()
                );
                const hasDoubt = targetDuvidas.length > 0;

                return (
                  <tr
                    key={e.id}
                    className={`hover:bg-slate-900/80 transition-colors ${
                      hasDoubt ? 'bg-amber-950/15' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2.5 text-center font-mono text-[11px] text-slate-500 border-r border-slate-800/80">
                      {index + 1}
                    </td>

                    {/* Tipo Entidade */}
                    <td className="p-2.5 border-r border-slate-800/80">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          e.Tipo_Entidade === 'PJ'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {e.Tipo_Entidade === 'PJ' ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {e.Tipo_Entidade}
                      </span>
                    </td>

                    {/* Nome */}
                    <td className="p-2.5 font-semibold text-slate-100 border-r border-slate-800/80">
                      <div className="flex items-center justify-between gap-1">
                        <span>{e.Nome || '—'}</span>
                        {hasDoubt && (
                          <button
                            type="button"
                            onClick={() => onOpenDuvidaForTarget?.(e.Nome)}
                            className="text-amber-400 hover:text-amber-300 p-0.5"
                            title={`${targetDuvidas.length} dúvida(s) de IA pendente(s) de revisão`}
                          >
                            <AlertCircle className="w-4 h-4 animate-pulse text-amber-400" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Documento */}
                    <td className="p-2.5 font-mono text-slate-300 border-r border-slate-800/80">
                      {e.Documento || '—'}
                    </td>

                    {/* Facção */}
                    <td className="p-2.5 border-r border-slate-800/80">
                      {e.Faccao ? (
                        <span className="font-bold text-rose-400 bg-rose-950/40 border border-rose-800/50 px-2 py-0.5 rounded text-[11px]">
                          {e.Faccao}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Vinculos (SEMPRE EM BRANCO) */}
                    <td className="p-2.5 text-slate-600 font-mono text-center border-r border-slate-800/80 bg-slate-950/60">
                      —
                    </td>

                    {/* Vulgo */}
                    <td className="p-2.5 font-medium text-amber-300/90 border-r border-slate-800/80">
                      {e.Vulgo || '—'}
                    </td>

                    {/* Nascimento */}
                    <td className="p-2.5 font-mono text-slate-300 border-r border-slate-800/80">
                      {e.Nascimento || '—'}
                    </td>

                    {/* Pai */}
                    <td className="p-2.5 text-slate-300 border-r border-slate-800/80">
                      {e.Nome_Pai || '—'}
                    </td>

                    {/* Mãe */}
                    <td className="p-2.5 text-slate-300 border-r border-slate-800/80">
                      {e.Nome_Mae || '—'}
                    </td>

                    {/* Papel */}
                    <td className="p-2.5 border-r border-slate-800/80">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getPapelBadgeClass(
                          e.Papel
                        )}`}
                      >
                        {e.Papel}
                      </span>
                    </td>

                    {/* Observações */}
                    <td className="p-2.5 text-slate-400 text-xs border-r border-slate-800/80 max-w-xs truncate" title={e.Observacoes}>
                      {e.Observacoes || '—'}
                    </td>

                    {/* Razao Social */}
                    <td className="p-2.5 text-slate-300 border-r border-slate-800/80">
                      {e.Razao_Social || '—'}
                    </td>

                    {/* Abertura */}
                    <td className="p-2.5 font-mono text-slate-300 border-r border-slate-800/80">
                      {e.Abertura || '—'}
                    </td>

                    {/* Situacao */}
                    <td className="p-2.5 text-slate-300 border-r border-slate-800/80">
                      {e.Situacao || '—'}
                    </td>

                    {/* Capital Social */}
                    <td className="p-2.5 font-mono text-slate-300 border-r border-slate-800/80">
                      {e.Capital_Social || '—'}
                    </td>

                    {/* Endereços */}
                    <td className="p-2.5 text-slate-300 border-r border-slate-800/80 max-w-xs truncate" title={e.Enderecos}>
                      {e.Enderecos || '—'}
                    </td>

                    {/* Sócios */}
                    <td className="p-2.5 text-slate-300 border-r border-slate-800/80">
                      {e.Socios || '—'}
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyRow(e)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Copiar linha para área de transferência"
                        >
                          {copiedRowId === e.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEntidade(e.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                          title="Excluir alvo da planilha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Exibindo {filtered.length} de {entidades.length} entidades cadastradas</span>
        <span className="italic">Colunas ordenadas estritamente de acordo com o padrão ministerial GAECO</span>
      </div>
    </div>
  );
};
