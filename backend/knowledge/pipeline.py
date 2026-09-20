"""Document text extraction + cleaning + chunking. Pure functions — easy to test."""

from __future__ import annotations

import csv
import io
import re

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120


def clean_text(text: str) -> str:
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' +\n', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def extract_text(file_path: str, file_type: str) -> tuple[str, int]:
    """Returns (text, page_count). Raises ValueError on unreadable content."""
    if file_type == 'TXT':
        with open(file_path, encoding='utf-8', errors='ignore') as f:
            text = f.read()
        return text, max(1, len(text) // 3000 + 1)
    if file_type == 'CSV':
        rows: list[str] = []
        with open(file_path, newline='', encoding='utf-8', errors='ignore') as f:
            for row in csv.reader(f):
                rows.append(' | '.join(row))
        text = '\n'.join(rows)
        return text, max(1, len(rows) // 50 + 1)
    if file_type == 'PDF':
        from pypdf import PdfReader

        reader = PdfReader(file_path)
        parts = [(i + 1, (page.extract_text() or '')) for i, page in enumerate(reader.pages)]
        return '\n\n'.join(p[1] for p in parts), len(parts)
    if file_type == 'DOCX':
        from docx import Document as DocxDocument

        doc = DocxDocument(file_path)
        text = '\n'.join(p.text for p in doc.paragraphs)
        return text, max(1, len(text) // 3000 + 1)
    raise ValueError(f'Unsupported file type: {file_type}')


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Paragraph-aware sliding-window chunking over cleaned text."""
    text = clean_text(text)
    if not text:
        return []
    paras = [p for p in text.split('\n') if p.strip()]
    chunks: list[str] = []
    buf = ''
    for para in paras:
        if len(buf) + len(para) + 1 <= size:
            buf = f'{buf}\n{para}'.strip()
        else:
            if buf:
                chunks.append(buf)
                buf = buf[-overlap:] if len(buf) > overlap else ''
            while len(para) > size:
                chunks.append(para[:size])
                para = para[size - overlap:]
            buf = f'{buf}\n{para}'.strip() if buf else para
    if buf.strip():
        chunks.append(buf.strip())
    return chunks
