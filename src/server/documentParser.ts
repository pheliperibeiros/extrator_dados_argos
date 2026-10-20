import mammoth from 'mammoth';
import JSZip from 'jszip';

// Use dynamic or safe import for pdf-parse to handle CJS/ESM interop
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfModule = await import('pdf-parse');
    const pdfParse = (pdfModule as any).default || pdfModule;
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err: any) {
    console.error('Erro ao processar PDF com pdf-parse:', err);
    throw new Error(`Falha na extração do texto do PDF: ${err.message || 'Formato incompatível'}`);
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (err: any) {
    console.error('Erro ao processar DOCX com mammoth:', err);
    throw new Error(`Falha na extração do DOCX: ${err.message || 'Arquivo corrompido'}`);
  }
}

async function extractOdtText(buffer: Buffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const contentXmlFile = zip.file('content.xml');
    if (!contentXmlFile) {
      throw new Error('Arquivo content.xml não encontrado no arquivo ODT');
    }
    const contentXml = await contentXmlFile.async('text');
    const text = contentXml
      .replace(/<text:tab\/>/g, '\t')
      .replace(/<text:line-break\/>/g, '\n')
      .replace(/<\/text:p>/g, '\n')
      .replace(/<\/text:h>/g, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return text;
  } catch (err: any) {
    console.error('Erro ao processar ODT:', err);
    throw new Error(`Falha na extração do ODT: ${err.message || 'Arquivo inválido'}`);
  }
}

export async function extractTextFromFile(
  filename: string,
  buffer: Buffer,
  mimeType?: string
): Promise<string> {
  const ext = (filename.split('.').pop() || '').toLowerCase();

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return await extractPdfText(buffer);
  }

  if (
    ext === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return await extractDocxText(buffer);
  }

  if (
    ext === 'odt' ||
    mimeType === 'application/vnd.oasis.opendocument.text'
  ) {
    return await extractOdtText(buffer);
  }

  if (['txt', 'md', 'text', 'log'].includes(ext) || mimeType?.startsWith('text/')) {
    return buffer.toString('utf-8');
  }

  // Fallback: try reading as text
  return buffer.toString('utf-8');
}
