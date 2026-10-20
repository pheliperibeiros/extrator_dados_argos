import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, X, FileText, Sparkles, HelpCircle } from 'lucide-react';
import type { DuvidaRevisao } from '../types/gaeco.ts';

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  duvidas: DuvidaRevisao[];
  onResolveDuvida: (duvidaId: string, finalValue: string) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  onClose,
  duvidas,
  onResolveDuvida,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customValue, setCustomValue] = useState('');

  if (!isOpen || duvidas.length === 0) return null;

  const currentDuvida = duvidas[currentIndex] || duvidas[0];
  const pendingCount = duvidas.filter(d => !d.resolved).length;

  const handleApplyValue = (val: string) => {
    onResolveDuvida(currentDuvida.id, val);
    // advance to next pending
    if (currentIndex < duvidas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    setCustomValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Revisão Humana de Dúvida da IA
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentIndex + 1} de {duvidas.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Confirmação de trecho e contexto da denúncia ministerial
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar modal de revisão"
            aria-label="Fechar modal de revisão"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target & Field Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Alvo / Objeto em Análise
              </span>
              <p className="text-sm font-bold text-amber-400">
                {currentDuvida.targetName}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Campo Afetado
              </span>
              <p className="text-sm font-mono font-semibold text-slate-200">
                {currentDuvida.field}
              </p>
            </div>
          </div>

          {/* Question from IA */}
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Ponto de Dúvida Apontado pela IA
              </p>
              <p className="text-sm font-medium text-slate-100 mt-1">
                {currentDuvida.question}
              </p>
            </div>
          </div>

          {/* Snippet from Document (Trecho Exato) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              Trecho Exato da Denúncia:
            </label>
            <div className="p-3.5 bg-amber-950/20 border-l-4 border-amber-500 rounded-r-xl text-amber-100/95 text-sm font-mono leading-relaxed select-text">
              &ldquo;{currentDuvida.snippet || currentDuvida.context}&rdquo;
            </div>
          </div>

          {/* Context around snippet */}
          {currentDuvida.context && currentDuvida.context !== currentDuvida.snippet && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                Contexto ao Redor do Trecho:
              </label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono leading-relaxed max-h-36 overflow-y-auto select-text">
                {currentDuvida.context}
              </div>
            </div>
          )}

          {/* Suggested options if available */}
          {currentDuvida.suggestedOptions && currentDuvida.suggestedOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Selecione uma opção sugerida para confirmar:
              </label>
              <div className="flex flex-wrap gap-2">
                {currentDuvida.suggestedOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyValue(opt)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-200 border border-slate-700 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom value input / override */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label htmlFor="custom-val-input" className="text-xs font-semibold text-slate-300">
              Ou confirme / digite o valor correto para este campo:
            </label>
            <div className="flex gap-2">
              <input
                id="custom-val-input"
                type="text"
                defaultValue={currentDuvida.currentValue}
                value={customValue !== '' ? customValue : currentDuvida.currentValue}
                onChange={e => setCustomValue(e.target.value)}
                placeholder="Digite o valor confirmado..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleApplyValue(customValue !== '' ? customValue : currentDuvida.currentValue)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800"
              title="Dúvida anterior"
              aria-label="Dúvida anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={currentIndex === duvidas.length - 1}
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800"
              title="Próxima dúvida"
              aria-label="Próxima dúvida"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 ml-2">
              {pendingCount > 0 ? `${pendingCount} pendente(s)` : 'Todas revisadas!'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Concluir Revisão
          </button>
        </div>

      </div>
    </div>
  );
};
