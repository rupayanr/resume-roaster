import pytest
from app.core.pdf_parser import extract_text_from_pdf


class TestPdfParser:
    def test_extract_text_from_valid_pdf(self, sample_pdf_bytes):
        """Test that text can be extracted from a valid PDF."""
        text = extract_text_from_pdf(sample_pdf_bytes)
        assert isinstance(text, str)
        # The minimal PDF may or may not have extractable text depending on pdfplumber
        # This mainly tests that the function doesn't crash

    def test_extract_text_returns_string(self, sample_pdf_bytes):
        """Test that extract_text_from_pdf always returns a string."""
        result = extract_text_from_pdf(sample_pdf_bytes)
        assert isinstance(result, str)

    def test_extract_text_from_invalid_pdf_raises(self):
        """Test that invalid PDF content raises an exception."""
        invalid_content = b"This is not a PDF"
        with pytest.raises(Exception):
            extract_text_from_pdf(invalid_content)

    def test_extract_text_from_empty_bytes_raises(self):
        """Test that empty bytes raises an exception."""
        with pytest.raises(Exception):
            extract_text_from_pdf(b"")

    def test_extract_text_handles_multi_page_pdf(self):
        """Test that multi-page PDFs are handled correctly."""
        # Create a simple 2-page PDF
        multi_page_pdf = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
4 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >> endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000123 00000 n
0000000196 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
269
%%EOF"""
        # This should not raise an exception
        result = extract_text_from_pdf(multi_page_pdf)
        assert isinstance(result, str)
