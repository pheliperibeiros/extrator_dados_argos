import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { extractTextFromFile } from './src/server/documentParser.ts';
import { extractGaecoDataWithGemini } from './src/server/aiExtractor.ts';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Endpoint to process document upload or direct text and extract GAECO data
app.post('/api/extract', async (req, res) => {
  try {
    const { filename, fileBase64, mimeType, rawText } = req.body;

    let textToAnalyze = '';

    if (rawText && typeof rawText === 'string' && rawText.trim().length > 0) {
      textToAnalyze = rawText;
    } else if (fileBase64 && filename) {
      const buffer = Buffer.from(fileBase64, 'base64');
      textToAnalyze = await extractTextFromFile(filename, buffer, mimeType);
    } else {
      return res.status(400).json({
        error: 'Nenhum documento ou texto fornecido para extração. Envie um arquivo PDF, ODT, DOCX, TXT ou o texto da denúncia.',
      });
    }

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      return res.status(400).json({
        error: 'Não foi possível extrair texto legível do arquivo fornecido. Verifique se o arquivo não está vazio ou corrompido.',
      });
    }

    const extractionResult = await extractGaecoDataWithGemini(textToAnalyze);
    res.json({
      success: true,
      data: extractionResult,
    });
  } catch (error: any) {
    console.error('Erro na extração GAECO:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao processar a extração com IA.',
    });
  }
});

// Set up Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Extrator GAECO server rodando em http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor Express:', err);
  process.exit(1);
});
