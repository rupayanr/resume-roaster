import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePdfMagicBytes, extractTextFromPdf } from '../pdf'

// Mock pdf-parse module
vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}))

describe('pdf', () => {
  describe('validatePdfMagicBytes', () => {
    it('returns true for valid PDF buffer', () => {
      // %PDF is the magic bytes for PDF files
      const validPdf = Buffer.from('%PDF-1.4 some content here')
      expect(validatePdfMagicBytes(validPdf)).toBe(true)
    })

    it('returns true for PDF with different versions', () => {
      expect(validatePdfMagicBytes(Buffer.from('%PDF-1.0'))).toBe(true)
      expect(validatePdfMagicBytes(Buffer.from('%PDF-1.5'))).toBe(true)
      expect(validatePdfMagicBytes(Buffer.from('%PDF-1.7'))).toBe(true)
      expect(validatePdfMagicBytes(Buffer.from('%PDF-2.0'))).toBe(true)
    })

    it('returns false for non-PDF buffer', () => {
      const notPdf = Buffer.from('This is not a PDF file')
      expect(validatePdfMagicBytes(notPdf)).toBe(false)
    })

    it('returns false for empty buffer', () => {
      const emptyBuffer = Buffer.from('')
      expect(validatePdfMagicBytes(emptyBuffer)).toBe(false)
    })

    it('returns false for buffer with only partial magic bytes', () => {
      expect(validatePdfMagicBytes(Buffer.from('%PD'))).toBe(false)
      expect(validatePdfMagicBytes(Buffer.from('%P'))).toBe(false)
      expect(validatePdfMagicBytes(Buffer.from('%'))).toBe(false)
    })

    it('returns false for PNG file', () => {
      // PNG magic bytes: 89 50 4E 47
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      expect(validatePdfMagicBytes(pngBuffer)).toBe(false)
    })

    it('returns false for JPEG file', () => {
      // JPEG magic bytes: FF D8 FF
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0])
      expect(validatePdfMagicBytes(jpegBuffer)).toBe(false)
    })

    it('returns false for ZIP/DOCX file', () => {
      // ZIP magic bytes: 50 4B 03 04
      const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04])
      expect(validatePdfMagicBytes(zipBuffer)).toBe(false)
    })

    it('returns false for buffer starting with similar but wrong bytes', () => {
      expect(validatePdfMagicBytes(Buffer.from('%pdf'))).toBe(false) // lowercase
      expect(validatePdfMagicBytes(Buffer.from('PDF-'))).toBe(false) // missing %
      expect(validatePdfMagicBytes(Buffer.from(' %PDF'))).toBe(false) // leading space
    })

    it('handles buffer with exactly 4 bytes (minimum valid)', () => {
      expect(validatePdfMagicBytes(Buffer.from('%PDF'))).toBe(true)
    })
  })

  describe('extractTextFromPdf', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('extracts text from PDF buffer', async () => {
      const pdf = await import('pdf-parse')
      const mockPdfParse = pdf.default as ReturnType<typeof vi.fn>
      mockPdfParse.mockResolvedValue({ text: 'Extracted resume text here' })

      const pdfBuffer = Buffer.from('%PDF-1.4 mock content')
      const result = await extractTextFromPdf(pdfBuffer)

      expect(result).toBe('Extracted resume text here')
      expect(mockPdfParse).toHaveBeenCalledWith(pdfBuffer)
    })

    it('returns empty string when PDF has no text', async () => {
      const pdf = await import('pdf-parse')
      const mockPdfParse = pdf.default as ReturnType<typeof vi.fn>
      mockPdfParse.mockResolvedValue({ text: '' })

      const pdfBuffer = Buffer.from('%PDF-1.4')
      const result = await extractTextFromPdf(pdfBuffer)

      expect(result).toBe('')
    })

    it('handles PDF with multiline text', async () => {
      const pdf = await import('pdf-parse')
      const mockPdfParse = pdf.default as ReturnType<typeof vi.fn>
      const multilineText = `John Doe
Software Engineer
john@example.com
Experience:
- Company A
- Company B`
      mockPdfParse.mockResolvedValue({ text: multilineText })

      const pdfBuffer = Buffer.from('%PDF-1.4')
      const result = await extractTextFromPdf(pdfBuffer)

      expect(result).toBe(multilineText)
      expect(result).toContain('John Doe')
      expect(result).toContain('Company A')
    })

    it('propagates errors from pdf-parse', async () => {
      const pdf = await import('pdf-parse')
      const mockPdfParse = pdf.default as ReturnType<typeof vi.fn>
      mockPdfParse.mockRejectedValue(new Error('Invalid PDF structure'))

      const pdfBuffer = Buffer.from('not a valid pdf')

      await expect(extractTextFromPdf(pdfBuffer)).rejects.toThrow('Invalid PDF structure')
    })

    it('handles corrupted PDF', async () => {
      const pdf = await import('pdf-parse')
      const mockPdfParse = pdf.default as ReturnType<typeof vi.fn>
      mockPdfParse.mockRejectedValue(new Error('Unable to parse PDF'))

      const corruptedBuffer = Buffer.from('%PDF-1.4 corrupted content')

      await expect(extractTextFromPdf(corruptedBuffer)).rejects.toThrow('Unable to parse PDF')
    })
  })
})
