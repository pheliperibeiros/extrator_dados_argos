import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { sanitizeCasoRow, sanitizeEntidadeRow } from '../utils/rules.ts';
import type { ExtractionResult } from '../types/gaeco.ts';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `Você é um perito analista de inteligência do GAECO (Grupo de Atuação Especial de Combate ao Crime Organizado do Ministério Público).
Sua missão é ler com extremo rigor denúncias ministeriais, relatórios de investigação e peças acusatórias, extraindo com absoluta fidelidade os dados solicitados para duas planilhas:

1. PLANILHA "Entidades" (Alvos, investigados, denunciados, pessoas físicas ou jurídicas):
- Tipo_Entidade: 'PF' para Pessoa Física ou 'PJ' para pessoa jurídica.
- Nome: Nome completo do alvo.
- Documento: CPF do alvo no formato nnn.nnn.nnn-nn. Se for PJ, CNPJ formatado nn.nnn.nnn/nnnn-nn. Se não constar, deixar vazio.
- Faccao: Sigla ou nome da facção criminosa à qual o indivíduo é vinculado (ex: PCC, ADE, CV, TCP, FDN, Bonde dos 40, etc.). Se não houver menção, deixe em branco.
- Vinculos: Deixar SEMPRE em branco ("").
- Vulgo: Apelido ou alcunha do investigado (ex: "Nem", "Cabeça", "Biel"), se houver.
- Nascimento: Data de nascimento no formato dd/mm/aaaa.
- Nome_Pai: Nome completo do pai, se citado na qualificação.
- Nome_Mae: Nome completo da mãe, se citado na qualificação.
- Papel: Exatamente uma das categorias padronizadas de atuação criminosa:
  * "Liderança"
  * "Gerencia"
  * "Operacional"
  * "Facilitador"
  * "Facilitador e Laranja"
- Observacoes: Observações relevantes contidas no documento (ex: mandados, prisões cautelares, apreensões de armas/drogas, contas bancárias utilizadas, interceptações telefônicas, reincidência).
- Razao_Social: Razão social caso seja PJ.
- Abertura: Data de abertura caso seja PJ.
- Situacao: Situação cadastral se PJ (ex: Ativa, Baixada, Inapta).
- Capital_Social: Capital social se PJ (ex: R$ 50.000,00).
- Enderecos: Endereço residencial, comercial ou domicílio informado na qualificação do investigado.
- Socios: Sócios ou administradores, se for PJ.

2. PLANILHA "Caso" (Informações gerais da investigação / denúncia):
- Tipo: Exatamente um destes: 'Inquérito Policial', 'PIC' (Procedimento Investigatório Criminal) ou 'Ação Penal'.
- Status: SEMPRE em branco ("").
- Numero_Eproc: SEMPRE em branco ("").
- Numero_IntegrarE: Número do processo ou expediente no sistema Integrar-e do Ministério Público (se citado no cabeçalho ou rodapé).
- Tags: Tags para identificar o caso, com particularidades e crimes denunciados em minúsculas separadas por hífen e vírgula (ex: "organização-criminosa, tráfico-de-drogas, lavagem-de-capitais, homicídio, corrupção-passiva").
- Data_Criacao: SEMPRE em branco ("").
- Criado_Por: SEMPRE em branco ("").
- Eproc_Investigacao: Número do Eproc da investigação de origem (ou seja, se for PIC, o número do PIC ou do Inquérito Policial).
- Codinome: Nome ou batismo da Operação/Investigação, se houver (ex: "Operação Sicários", "Operação Tempestade", "Fim da Linha").

3. DÚVIDAS E REVISÃO HUMANA:
O sistema possui um modal de revisão humana obrigatório caso haja qualquer incerteza.
Você DEVE identificar qualquer ponto de ambiguidade ou dúvida no documento, como:
- Alvo cujo papel na organização não está taxativo (ex: se é Liderança ou Gerência, ou se atuou como Facilitador ou Laranja).
- Documento que possa ser RG anotado como CPF ou numeração incompleta.
- Pessoas citadas cuja qualidade de denunciado/alvo vs testemunha/vítima gere margem para dúvida.
- Associação a facção criminosa deduzida por indícios mas não expressa explicitamente.
- Divergência de endereços ou nomes de genitores.
Para cada dúvida, gere um item no array 'duvidas' com:
- targetType: 'entidade' ou 'caso'
- targetName: nome do alvo em questão ou "Geral do Caso"
- field: o campo que requer confirmação humana (ex: 'Papel', 'Documento', 'Faccao', 'Tipo')
- currentValue: o valor que você preencheu preliminarmente
- question: uma pergunta direta e contextualizada para o promotor/analista
4. FORMATO DE SAÍDA OBRIGATÓRIO (JSON estrito):
Você DEVE retornar impreterivelmente um objeto JSON válido no seguinte formato:
{
  "documentTitle": "string com título ou síntese",
  "caso": {
    "Tipo": "Inquérito Policial | PIC | Ação Penal",
    "Numero_IntegrarE": "string",
    "Tags": "crime1, crime2, crime3",
    "Eproc_Investigacao": "string",
    "Codinome": "string"
  },
  "entidades": [
    {
      "Tipo_Entidade": "PF | PJ",
      "Nome": "string",
      "Documento": "nnn.nnn.nnn-nn ou CNPJ formatado",
      "Faccao": "PCC | ADE | CV | etc",
      "Vulgo": "string",
      "Nascimento": "dd/mm/aaaa",
      "Nome_Pai": "string",
      "Nome_Mae": "string",
      "Papel": "Liderança | Gerencia | Operacional | Facilitador | Facilitador e Laranja",
      "Observacoes": "string",
      "Razao_Social": "string (se PJ)",
      "Abertura": "string (se PJ)",
      "Situacao": "string (se PJ)",
      "Capital_Social": "string (se PJ)",
      "Enderecos": "string",
      "Socios": "string (se PJ)"
    }
  ],
  "duvidas": [
    {
      "id": "string",
      "targetType": "entidade | caso",
      "targetName": "string",
      "field": "string",
      "currentValue": "string",
      "question": "string",
      "snippet": "trecho exato citado",
      "context": "pequeno contexto circundante",
      "suggestedOptions": ["opcao1", "opcao2"]
    }
  ]
}`;

export async function extractGaecoDataWithGemini(documentText: string): Promise<ExtractionResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Chave de API do Gemini não configurada (GEMINI_API_KEY).');
  }

  const prompt = `Analise a seguinte denúncia / peça investigativa do GAECO e extraia todos os dados estritamente conforme as diretrizes em formato JSON:\n\n---\n${documentText.slice(0, 150000)}\n---`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  let response: any;
  let lastError: any;

  for (const modelName of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });
      if (response && response.text) {
        break; // success
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Tentativa com modelo ${modelName} falhou:`, err?.message || err);
    }
  }

  if (!response) {
    let msg = lastError?.message || 'Falha na comunicação com a IA.';
    try {
      const parsedErr = JSON.parse(msg);
      if (parsedErr?.error?.message) {
        msg = parsedErr.error.message;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const rawJson = response.text?.trim() || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    console.error('Falha ao parsear JSON retornado pelo Gemini:', rawJson);
    throw new Error('A resposta do modelo não pôde ser interpretada como JSON.');
  }

  const casoRow = sanitizeCasoRow(parsed.caso || {});
  
  const entidadesRows = Array.isArray(parsed.entidades)
    ? parsed.entidades.map((e: any) => sanitizeEntidadeRow(e))
    : [];

  const duvidas = Array.isArray(parsed.duvidas)
    ? parsed.duvidas.map((d: any, idx: number) => ({
        id: d.id || `duvida_${idx}_${Date.now()}`,
        targetType: (d.targetType === 'caso' ? 'caso' : 'entidade') as 'entidade' | 'caso',
        targetId: d.targetId || '',
        targetName: d.targetName || 'Alvo',
        field: d.field || 'Informação',
        currentValue: d.currentValue || '',
        question: d.question || 'Confirme esta informação extraída.',
        snippet: d.snippet || '',
        context: d.context || '',
        suggestedOptions: Array.isArray(d.suggestedOptions) ? d.suggestedOptions : [],
        resolved: false,
      }))
    : [];

  return {
    caso: casoRow,
    entidades: entidadesRows,
    duvidas,
    documentTitle: parsed.documentTitle || 'Denúncia GAECO',
    rawTextPreview: documentText.slice(0, 3000),
  };
}
