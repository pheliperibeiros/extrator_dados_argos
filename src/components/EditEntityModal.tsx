import React, { useState } from 'react';
import { X, Save, UserCheck, Building2 } from 'lucide-react';
import type { EntidadeRow, PapelInvestigado } from '../types/gaeco.ts';
import { formatDocumento, formatDataNascimento } from '../utils/rules.ts';

interface EditEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  entidade: EntidadeRow | null;
  onSave: (saved: EntidadeRow) => void;
}

export const EditEntityModal: React.FC<EditEntityModalProps> = ({
  isOpen,
  onClose,
  entidade,
  onSave,
}) => {
  if (!isOpen || !entidade) return null;

  const [formData, setFormData] = useState<EntidadeRow>({ ...entidade });

  const handleDocumentoChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      Documento: formatDocumento(val, prev.Tipo_Entidade),
    }));
  };

  const handleNascimentoChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      Nascimento: formatDataNascimento(val),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              {formData.Tipo_Entidade === 'PJ' ? <Building2 className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Editar Alvo / Entidade
              </h2>
              <p className="text-xs text-slate-400">
                Padrão GAECO • Campos obrigatórios e vínculos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Tipo de Entidade</label>
              <select
                value={formData.Tipo_Entidade}
                onChange={e => setFormData({ ...formData, Tipo_Entidade: e.target.value as 'PF' | 'PJ' })}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="PF">PF (Pessoa Física)</option>
                <option value="PJ">PJ (Pessoa Jurídica)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
              <input
                type="text"
                required
                value={formData.Nome}
                onChange={e => setFormData({ ...formData, Nome: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">
                Documento ({formData.Tipo_Entidade === 'PJ' ? 'CNPJ' : 'CPF'})
              </label>
              <input
                type="text"
                value={formData.Documento}
                onChange={e => handleDocumentoChange(e.target.value)}
                placeholder={formData.Tipo_Entidade === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Facção Criminosa</label>
              <input
                type="text"
                value={formData.Faccao}
                onChange={e => setFormData({ ...formData, Faccao: e.target.value })}
                placeholder="PCC, ADE, CV, TCP..."
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Vulgo / Apelido</label>
              <input
                type="text"
                value={formData.Vulgo}
                onChange={e => setFormData({ ...formData, Vulgo: e.target.value })}
                placeholder="Ex: Pezão, Doutor"
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Data de Nascimento (dd/mm/aaaa)</label>
              <input
                type="text"
                value={formData.Nascimento}
                onChange={e => handleNascimentoChange(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Nome do Pai</label>
              <input
                type="text"
                value={formData.Nome_Pai}
                onChange={e => setFormData({ ...formData, Nome_Pai: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Nome da Mãe</label>
              <input
                type="text"
                value={formData.Nome_Mae}
                onChange={e => setFormData({ ...formData, Nome_Mae: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Papel na Organização</label>
              <select
                value={formData.Papel}
                onChange={e => setFormData({ ...formData, Papel: e.target.value as PapelInvestigado })}
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="Liderança">Liderança</option>
                <option value="Gerencia">Gerencia</option>
                <option value="Operacional">Operacional</option>
                <option value="Facilitador">Facilitador</option>
                <option value="Facilitador e Laranja">Facilitador e Laranja</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Vínculos (Regra GAECO)</label>
              <input
                type="text"
                disabled
                value=""
                placeholder="Permanecerá sempre em branco"
                className="mt-1 w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Endereços / Domicílio</label>
            <textarea
              rows={2}
              value={formData.Enderecos}
              onChange={e => setFormData({ ...formData, Enderecos: e.target.value })}
              placeholder="Endereço residencial ou comercial completo..."
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Observações Apontadas no Documento</label>
            <textarea
              rows={3}
              value={formData.Observacoes}
              onChange={e => setFormData({ ...formData, Observacoes: e.target.value })}
              placeholder="Mandados, bens apreendidos, interceptações, histórico criminal..."
              className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          {/* PJ specific fields */}
          {formData.Tipo_Entidade === 'PJ' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-900/40 space-y-4">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                Dados Complementares de Pessoa Jurídica
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Razão Social</label>
                  <input
                    type="text"
                    value={formData.Razao_Social}
                    onChange={e => setFormData({ ...formData, Razao_Social: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Data de Abertura</label>
                  <input
                    type="text"
                    value={formData.Abertura}
                    onChange={e => setFormData({ ...formData, Abertura: e.target.value })}
                    placeholder="dd/mm/aaaa"
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Situação Cadastral</label>
                  <input
                    type="text"
                    value={formData.Situacao}
                    onChange={e => setFormData({ ...formData, Situacao: e.target.value })}
                    placeholder="Ativa, Baixada..."
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Capital Social</label>
                  <input
                    type="text"
                    value={formData.Capital_Social}
                    onChange={e => setFormData({ ...formData, Capital_Social: e.target.value })}
                    placeholder="R$ 100.000,00"
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Sócios / Administradores</label>
                  <input
                    type="text"
                    value={formData.Socios}
                    onChange={e => setFormData({ ...formData, Socios: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-950"
            >
              <Save className="w-4 h-4" />
              Salvar Entidade
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
