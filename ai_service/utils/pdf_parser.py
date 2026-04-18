from pypdf import PdfReader
from typing import BinaryIO

def parse_pdf(stream: BinaryIO) -> str:
    """Extracts text from a PDF file stream."""
    try:
        reader = PdfReader(stream)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        return text
    except Exception as e:
        print(f"PDF Parsing Error: {e}")
        return ""
