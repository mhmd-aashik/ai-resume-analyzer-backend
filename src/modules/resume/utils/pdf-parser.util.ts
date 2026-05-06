import * as pdf from 'pdf-parse';

type PdfParser = (dataBuffer: Buffer) => Promise<{ text: string }>;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await (pdf as unknown as PdfParser)(buffer);

  const text = result.text.replace(/\s+/g, ' ').trim();

  if (!text || text.length < 50) {
    throw new Error('Could not extract enough text from the PDF');
  }

  return text;
}
