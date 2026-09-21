"""Permission-first retrieval. The queryset is restricted before any context is built."""
from django.db.models import Q
from pgvector.django import CosineDistance
from knowledge.models import DocumentChunk
from knowledge.permissions import can_access_document
from .providers import embed


def search(user, query: str, limit=8):
    base = DocumentChunk.objects.select_related('document', 'knowledge_base').filter(
        organization_id=user.organization_id, document__status='READY')
    # Enforce KB and document permissions in Python as a defense-in-depth backstop.
    permitted = [c for c in base if can_access_document(user, c.document)]
    terms = [t for t in query.lower().split() if len(t) > 2]
    keyword = [c for c in permitted if any(t in c.text.lower() for t in terms)] if terms else []
    vector = embed(query)
    semantic = []
    if vector:
        semantic = list(base.filter(pk__in=[c.pk for c in permitted], embedding__isnull=False)
                       .annotate(distance=CosineDistance('embedding', vector)).order_by('distance')[:limit])
    out, seen = [], set()
    for chunk in semantic + keyword:
        if chunk.pk in seen: continue
        seen.add(chunk.pk)
        out.append(chunk)
        if len(out) >= limit: break
    return out, bool(vector)
