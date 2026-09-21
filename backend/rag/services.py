"""Shared permission-first hybrid retrieval used by search and chat."""
from django.db.models import Q
from pgvector.django import CosineDistance
from knowledge.models import DocumentChunk, KnowledgeBase
from knowledge.permissions import is_admin, role_name
from .providers import embed


def permitted_chunks(user):
    qs = DocumentChunk.objects.select_related('document', 'knowledge_base').filter(
        organization_id=user.organization_id, document__organization_id=user.organization_id,
        document__status='READY')
    if is_admin(user):
        return qs
    role = role_name(user)
    return qs.exclude(knowledge_base__visibility=KnowledgeBase.Visibility.RESTRICTED).filter(
        Q(knowledge_base__visibility=KnowledgeBase.Visibility.ORGANIZATION) |
        Q(knowledge_base__visibility=KnowledgeBase.Visibility.DEPARTMENT, knowledge_base__department_id=user.department_id) |
        Q(knowledge_base__visibility=KnowledgeBase.Visibility.DEPARTMENT, knowledge_base__department_id__isnull=True)
    ).filter(Q(document__roles_allowed=[]) | Q(document__roles_allowed__contains=[role])).filter(
        Q(document__department_id__isnull=True) | Q(document__department_id=user.department_id)
    )


def rerank(candidates, query: str, limit: int):
    terms = {term for term in query.lower().split() if len(term) > 2}
    ranked = []
    for chunk in candidates:
        text = chunk.text.lower()
        lexical = sum(text.count(term) for term in terms)
        distance = float(getattr(chunk, 'distance', 1.0))
        # Explainable deterministic score: lexical relevance dominates, then cosine similarity.
        score = lexical * 2 + (1 - distance)
        ranked.append((score, -chunk.pk, chunk))
    return [chunk for _, _, chunk in sorted(ranked, reverse=True)[:limit]]


def search(user, query: str, limit=8):
    base = permitted_chunks(user)
    terms = [term for term in query.lower().split() if len(term) > 2]
    keyword_q = Q()
    for term in terms:
        keyword_q |= Q(text__icontains=term)
    keyword = list(base.filter(keyword_q)[:limit * 3]) if terms else []
    semantic = []
    semantic_available = False
    try:
        vector = embed(query)
        semantic = list(base.filter(embedding__isnull=False).annotate(distance=CosineDistance('embedding', vector)).order_by('distance')[:limit * 3])
        semantic_available = True
    except Exception:
        # Keyword retrieval remains available when vector provider is unavailable.
        pass
    merged = {chunk.pk: chunk for chunk in semantic + keyword}
    return rerank(list(merged.values()), query, limit), semantic_available
