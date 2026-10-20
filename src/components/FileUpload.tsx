import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, Loader2, FileCode, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onExtract: (payload: {
    filename?: string;
    fileBase64?: string;
    mimeType?: string;
    rawText?: string;
  }) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onExtract, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.pdf', '.odt', '.docx', '.txt', '.md'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValid) {
      alert('Formato não suportado. Por favor, envie arquivos em PDF, ODT, DOCX, TXT ou MD.');
      return;
    }

    setSelectedFile(file);
  };

  const handleStartExtraction = async () => {
    if (inputMode === 'file' && selectedFile) {
      setStatusMessage('Lendo arquivo e enviando para análise...');
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        await onExtract({
          filename: selectedFile.name,
          fileBase64: base64Data,
          mimeType: selectedFile.type,
        });
      };
      reader.readAsDataURL(selectedFile);
    } else if (inputMode === 'text' && rawText.trim()) {
      setStatusMessage('Processando texto com IA...');
      await onExtract({
        rawText: rawText.trim(),
      });
    }
  };

  const handleLoadSample = () => {
    setInputMode('text');
    const sampleDenuncia = `MINISTÉRIO PÚBLICO DO ESTADO DO TOCANTINS
GRUPO DE ATUAÇÃO ESPECIAL DE COMBATE AO CRIME ORGANIZADO - GAECO
AUTOS DO PIC Nº 5002148-32.2024.8.27.2700 / GAECO
INTEGRAR-E: MPTO-2024/008472-G
OPERAÇÃO TEMPESTADE DE AREIA

EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 1ª VARA CRIMINAL DA COMARCA DE PALMAS/TO

O MINISTÉRIO PÚBLICO DO ESTADO DO TOCANTINS, por intermédio dos Promotores de Justiça integrantes do GAECO, no uso de suas atribuições constitucionais e legais, vem perante Vossa Excelência oferecer a presente

DENÚNCIA (AÇÃO PENAL)

em desfavor de:

1. CARLOS EDUARDO SILVEIRA ALVES, vulgo "Pezão" ou "Doutor", brasileiro, convivente, comerciante, natural de Goiânia/GO, nascido em 14/05/1982, filho de Sebastião Silveira Alves e Maria de Lourdes Alves, portador do RG nº 4587123 SSP/GO e inscrito no CPF sob o nº 489.123.754-00, residente na Quadra 204 Sul, Alameda 12, Lote 05, Plano Diretor Sul, Palmas/TO.
Papel na organização: O investigado exerce expressiva Liderança regional da facção criminosa Primeiro Comando da Capital (PCC) no Estado do Tocantins, responsável direto pelo controle da distribuição de entorpecentes e ordens de execução de rivais da facção Comando Vermelho.
Observações: Foram apreendidas com o denunciado armas de uso restrito, planilhas manuscritas contendo a contabilidade da "Geral do Estado" e registros de dízimo da facção.

2. RAFAEL MENDONÇA DE OLIVEIRA, vulgo "Biel" ou "Menor", brasileiro, solteiro, desempregado, nascido em 22/11/1998, filho de José de Oliveira e Sandra Mendonça, portador do CPF 024.587.111-92, residente na Rua 15, Quadra B, Lote 02, Setor Taquari, Palmas/TO.
Papel na organização: Atua como Gerencia logística e operacional, administrando paióis e pontos de venda de drogas no setor sul da capital sob comando de "Pezão". Não obstante sua função gerencial, relatos de interceptação indicam que por vezes também desempenha tarefas de ponta operacional na distribuição. Vinculado à facção PCC.
Observações: Flagrado com 4kg de cocaína e anotações financeiras; reincidente específico em tráfico interestadual de entorpecentes.

3. LOGÍSTICA & DISTRIBUIÇÃO ALFA LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 38.441.982/0001-50, com sede na Avenida Teotônio Segurado, Sala 402, Palmas/TO, data de abertura em 15/03/2021, situação cadastral Ativa, capital social de R$ 250.000,00, tendo como sócio administrador formal o indivíduo Marcos Vinícius Ribeiro.
Papel na organização: Empresa de fachada utilizada para Facilitador e Laranja no branqueamento de capitais ilícitos auferidos pelo tráfico de drogas e receptação de cargas.
Observações: Não possui empregados registrados nem caminhões em sua frota, movimentando mais de R$ 4.000.000,00 em contas bancárias com depósitos fracionados em espécie.

4. MARCOS VINÍCIUS RIBEIRO, vulgo "Marquinhos", brasileiro, casado, empresário, nascido em 03/09/1989, filho de João Ribeiro da Costa e Ana Maria dos Santos, portador do documento CPF nº 712.984.321-45, residente na Alameda dos Ipês, nº 88, Jardim dos Girassóis, Araguaína/TO.
Papel na organização: Facilitador e Laranja, sócio formal da empresa Logística Alfa LTDA, emprestando seu nome e contas para movimentar recursos da liderança do PCC, muito embora afirme que não sabia da destinação ilícita dos valores.
Observações: Bloqueio cautelar de contas decretado judicialmente nos autos da Medida Cautelar nº 5003312-90.2024.8.27.2700.

Crimes imputados: Organização Criminosa Armada (art. 2º da Lei 12.850/2013), Tráfico Ilícito de Drogas (art. 33 da Lei 11.343/2006) e Lavagem de Dinheiro (art. 1º da Lei 9.613/1998).`;
    setRawText(sampleDenuncia);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Extração Automatizada com IA
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Extrair Dados de Denúncias do GAECO
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Carregue peças ministeriais em PDF, ODT, DOCX, TXT ou MD. A IA estruturará
            automaticamente as planilhas de <strong>Entidades</strong> e <strong>Caso</strong>, abrindo revisão humana para dúvidas.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex border-b border-slate-800 mb-6 justify-center gap-2">
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              inputMode === 'file'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> Enviar Arquivo (PDF, ODT, DOCX, TXT, MD)
          </button>
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all ${
              inputMode === 'text'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" /> Colar Texto da Denúncia
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">Falha na extração</p>
              <p className="text-rose-300/90 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* File Drop Area */}
        {inputMode === 'file' ? (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.odt,.docx,.txt,.md,application/pdf,application/vnd.oasis.opendocument.text,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                onChange={handleChange}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Upload className="w-8 h-8" />
              </div>

              {selectedFile ? (
                <div>
                  <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-3 py-1.5 rounded-lg text-sm font-medium mb-2">
                    <CheckCircle className="w-4 h-4" />
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                  <p className="text-xs text-slate-400">Clique para selecionar outro arquivo</p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-semibold text-slate-200">
                    Arraste o arquivo ou clique para selecionar
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Formatos aceitos: <strong>PDF</strong>, <strong>ODT</strong>, <strong>DOCX</strong>, <strong>TXT</strong> ou <strong>MD</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="denuncia-textarea" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Conteúdo da Denúncia / Relatório Investigativo
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Carregar texto de exemplo para teste rápido
              </button>
            </div>
            <textarea
              id="denuncia-textarea"
              rows={12}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Cole aqui o texto completo ou trecho da denúncia ministerial do GAECO (incluindo qualificação dos investigados, fatos, facção e crimes imputados)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Revisão humana contextualizada ativada para quaisquer inconsistências
          </div>

          <button
            type="button"
            disabled={isLoading || (inputMode === 'file' ? !selectedFile : !rawText.trim())}
            onClick={handleStartExtraction}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
              isLoading || (inputMode === 'file' ? !selectedFile : !rawText.trim())
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processando Denúncia com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Iniciar Extração dos Dados</span>
              </>
            )}
          </button>
        </div>

        {/* Quick test loader for convenience */}
        {inputMode === 'file' && !selectedFile && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Não possui um arquivo no momento? Clique aqui para carregar um modelo de denúncia do GAECO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
