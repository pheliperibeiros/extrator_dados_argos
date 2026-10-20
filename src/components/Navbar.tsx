import React from 'react';
import { ShieldAlert, FileSpreadsheet, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  hasData: boolean;
  onReset: () => void;
  pendingDuvidasCount: number;
  onOpenDuvidas: () => void;
  activeTab: 'entidades' | 'caso';
  setActiveTab: (tab: 'entidades' | 'caso') => void;
  entidadesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasData,
  onReset,
  pendingDuvidasCount,
  onOpenDuvidas,
  activeTab,
  setActiveTab,
  entidadesCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-red-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">GAECO</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Ministério Público
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" /> IA Ativa
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Extrator de Denúncias Ministeriais • Entidades & Caso
            </p>
          </div>
        </div>

        {/* Tab & Status Controls if data present */}
        {hasData && (
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('entidades')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'entidades'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Planilha Entidades
                <span className="bg-black/30 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {entidadesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('caso')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'caso'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Planilha Caso
              </button>
            </div>

            {pendingDuvidasCount > 0 ? (
              <button
                type="button"
                onClick={onOpenDuvidas}
                className="flex items-center gap-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 px-3 py-1.5 rounded-lg transition-all animate-pulse"
                title="Abrir modal de dúvidas para revisão humana"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Revisar Dúvidas ({pendingDuvidasCount})
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenDuvidas}
                className="flex items-center gap-1.5 text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-3 py-1.5 rounded-lg hover:bg-emerald-950/70 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Dúvidas Revisadas
              </button>
            )}

            <button
              type="button"
              onClick={onReset}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
              title="Nova extração / Limpar dados"
              aria-label="Nova extração"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
