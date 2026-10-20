import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { FileUpload } from './components/FileUpload.tsx';
import { EntitiesTable } from './components/EntitiesTable.tsx';
import { CaseTable } from './components/CaseTable.tsx';
import { HumanReviewModal } from './components/HumanReviewModal.tsx';
import { EditEntityModal } from './components/EditEntityModal.tsx';
import { ExportToolbar } from './components/ExportToolbar.tsx';
import type { ExtractionResult, EntidadeRow, CasoRow, DuvidaRevisao } from './types/gaeco.ts';
import { sanitizeEntidadeRow, sanitizeCasoRow } from './utils/rules.ts';
import { AlertTriangle, FileSpreadsheet, Sparkles, CheckCircle2, ChevronRight, Scale } from 'lucide-react';

export default function App() {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'entidades' | 'caso'>('entidades');
  
  // Modals state
  const [isDuvidasModalOpen, setIsDuvidasModalOpen] = useState(false);
  const [editingEntidade, setEditingEntidade] = useState<EntidadeRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Call backend extraction
  const handleExtract = async (payload: {
    filename?: string;
    fileBase64?: string;
    mimeType?: string;
    rawText?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Falha ao processar a denúncia com IA.');
      }

      const result: ExtractionResult = resData.data;
      setExtractionResult(result);

      // Rule: "Se houver dúvida, o sistema deve abrir um modal de revisão humana exibindo o trecho e pequeno contexto para confirmação."
      if (result.duvidas && result.duvidas.length > 0) {
        setIsDuvidasModalOpen(true);
      }
    } catch (err: any) {
      console.error('Erro na extração:', err);
      setError(err.message || 'Erro inesperado na extração dos dados.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve doubt from Human Review Modal
  const handleResolveDuvida = (duvidaId: string, finalValue: string) => {
    if (!extractionResult) return;

    setExtractionResult(prev => {
      if (!prev) return prev;

      const targetDuvida = prev.duvidas.find(d => d.id === duvidaId);
      if (!targetDuvida) return prev;

      let updatedEntidades = [...prev.entidades];
      let updatedCaso = { ...prev.caso };

      if (targetDuvida.targetType === 'entidade') {
        updatedEntidades = updatedEntidades.map(ent => {
          if (ent.Nome.toLowerCase() === targetDuvida.targetName.toLowerCase() || ent.id === targetDuvida.targetId) {
            return {
              ...ent,
              [targetDuvida.field]: finalValue,
            };
          }
          return ent;
        });
      } else {
        updatedCaso = {
          ...updatedCaso,
          [targetDuvida.field]: finalValue,
        };
      }

      const updatedDuvidas = prev.duvidas.map(d =>
        d.id === duvidaId ? { ...d, currentValue: finalValue, resolved: true } : d
      );

      return {
        ...prev,
        entidades: updatedEntidades,
        caso: updatedCaso,
        duvidas: updatedDuvidas,
      };
    });
  };

  // Entidades CRUD
  const handleUpdateEntidade = (id: string, updated: Partial<EntidadeRow>) => {
    if (!extractionResult) return;
    setExtractionResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        entidades: prev.entidades.map(e => (e.id === id ? sanitizeEntidadeRow({ ...e, ...updated }) : e)),
      };
    });
  };

  const handleDeleteEntidade = (id: string) => {
    if (!extractionResult) return;
    if (confirm('Tem certeza que deseja remover este alvo da planilha?')) {
      setExtractionResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          entidades: prev.entidades.filter(e => e.id !== id),
        };
      });
    }
  };

  const handleAddEntidade = () => {
    const newTarget = sanitizeEntidadeRow({
      Nome: 'Novo Investigado',
      Tipo_Entidade: 'PF',
      Papel: 'Operacional',
    });
    setEditingEntidade(newTarget);
    setIsEditModalOpen(true);
  };

  const handleSaveModalEntidade = (saved: EntidadeRow) => {
    if (!extractionResult) return;
    setExtractionResult(prev => {
      if (!prev) return prev;
      const exists = prev.entidades.some(e => e.id === saved.id);
      return {
        ...prev,
        entidades: exists
          ? prev.entidades.map(e => (e.id === saved.id ? saved : e))
          : [...prev.entidades, saved],
      };
    });
  };

  // Caso Update
  const handleUpdateCaso = (updated: Partial<CasoRow>) => {
    if (!extractionResult) return;
    setExtractionResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        caso: sanitizeCasoRow({ ...prev.caso, ...updated }),
      };
    });
  };

  const handleReset = () => {
    if (confirm('Deseja iniciar uma nova extração? Os dados atuais não salvos serão descartados.')) {
      setExtractionResult(null);
      setError(null);
      setActiveTab('entidades');
    }
  };

  const pendingDuvidas = extractionResult?.duvidas.filter(d => !d.resolved) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        hasData={Boolean(extractionResult)}
        onReset={handleReset}
        pendingDuvidasCount={pendingDuvidas.length}
        onOpenDuvidas={() => setIsDuvidasModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        entidadesCount={extractionResult?.entidades.length || 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {!extractionResult ? (
          <FileUpload onExtract={handleExtract} isLoading={isLoading} error={error} />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Investigation header badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-extrabold text-white">
                      {extractionResult.documentTitle || 'Denúncia GAECO'}
                    </h1>
                    {extractionResult.caso.Codinome && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                        {extractionResult.caso.Codinome}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Tipo: <span className="text-slate-200 font-medium">{extractionResult.caso.Tipo}</span> • 
                    Eproc Investigação: <span className="font-mono text-slate-200">{extractionResult.caso.Eproc_Investigacao || 'Não informado'}</span> • 
                    Integrar-e: <span className="font-mono text-slate-200">{extractionResult.caso.Numero_IntegrarE || 'Não informado'}</span>
                  </p>
                </div>
              </div>

              {pendingDuvidas.length > 0 ? (
                <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-800/60 px-3.5 py-2 rounded-xl text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span>
                    <strong>{pendingDuvidas.length} dúvida(s)</strong> identificada(s) pela IA.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDuvidasModalOpen(true)}
                    className="font-bold underline hover:text-white transition-colors"
                  >
                    Revisar trechos &rarr;
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-2 rounded-xl text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Todos os dados revisados e confirmados.</span>
                </div>
              )}
            </div>

            {/* Export Toolbar */}
            <ExportToolbar
              entidades={extractionResult.entidades}
              caso={extractionResult.caso}
              duvidas={extractionResult.duvidas}
              onOpenDuvidas={() => setIsDuvidasModalOpen(true)}
              activeTab={activeTab}
            />

            {/* Tab Navigation */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('entidades')}
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'entidades'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Planilha 1: Entidades ({extractionResult.entidades.length} Alvos)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('caso')}
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                  activeTab === 'caso'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Planilha 2: Caso Geral
              </button>
            </div>

            {/* Active Table View */}
            {activeTab === 'entidades' ? (
              <EntitiesTable
                entidades={extractionResult.entidades}
                duvidas={extractionResult.duvidas}
                onUpdateEntidade={handleUpdateEntidade}
                onDeleteEntidade={handleDeleteEntidade}
                onAddEntidade={handleAddEntidade}
                onOpenDuvidaForTarget={() => setIsDuvidasModalOpen(true)}
              />
            ) : (
              <CaseTable
                caso={extractionResult.caso}
                duvidas={extractionResult.duvidas}
                onUpdateCaso={handleUpdateCaso}
                onOpenDuvidas={() => setIsDuvidasModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Human Review Modal (Revisão Humana de Dúvidas) */}
      {extractionResult && (
        <HumanReviewModal
          isOpen={isDuvidasModalOpen}
          onClose={() => setIsDuvidasModalOpen(false)}
          duvidas={extractionResult.duvidas}
          onResolveDuvida={handleResolveDuvida}
        />
      )}

      {/* Edit / Add Entity Modal */}
      <EditEntityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entidade={editingEntidade}
        onSave={handleSaveModalEntidade}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        GAECO • Ministério Público do Estado do Tocantins • Sistema Integrador Eproc / Integrar-e
      </footer>
    </div>
  );
}
