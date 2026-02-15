import pdf from 'pdf-parse'

// PDF magic bytes
const PDF_MAGIC_BYTES = Buffer.from('%PDF')

export function validatePdfMagicBytes(buffer: Buffer): boolean {
  return buffer.slice(0, 4).equals(PDF_MAGIC_BYTES)
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer)
  return data.text
}
