"""Explicit provider adapters. Missing credentials are reported, never replaced with fake AI output."""
import json
import urllib.request
from django.conf import settings


def embed(text: str) -> list[float] | None:
    if not settings.EMBEDDING_API_KEY:
        return None
    payload = json.dumps({'model': settings.EMBEDDING_MODEL, 'input': text}).encode()
    req = urllib.request.Request('https://api.openai.com/v1/embeddings', data=payload,
        headers={'Authorization': f'Bearer {settings.EMBEDDING_API_KEY}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as response:
        return json.loads(response.read())['data'][0]['embedding']


def complete(messages: list[dict], context: str) -> str:
    if not settings.LLM_API_KEY:
        raise RuntimeError('LLM provider is not configured; set LLM_API_KEY to enable generated answers.')
    payload = json.dumps({'model': settings.LLM_MODEL, 'messages': [
        {'role': 'system', 'content': 'Answer only from the supplied context. If it is insufficient, say so. Cite sources as [source number].'},
        *messages, {'role': 'system', 'content': f'Permitted context:\n{context}'}], 'temperature': 0.1}).encode()
    req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=payload,
        headers={'Authorization': f'Bearer {settings.LLM_API_KEY}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=45) as response:
        return json.loads(response.read())['choices'][0]['message']['content']
