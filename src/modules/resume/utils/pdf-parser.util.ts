import { PDFParse } from 'pdf-parse';
import { sanitizeTextForDatabase } from '../../../common/utils/text-sanitizer.util.js';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty or missing');
  }

  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    
    // Sanitize the extracted text using the common utility
    const sanitizedText = sanitizeTextForDatabase(result.text);

    if (!sanitizedText || sanitizedText.length < 50) {
      throw new Error('Could not extract enough text from the PDF');
    }

    return sanitizedText;
  } catch (err: any) {
    console.error('PDF parsing error internal:', err);
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
}
