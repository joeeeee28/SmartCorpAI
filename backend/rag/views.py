from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from audit.log import write as audit
from .models import Conversation, ChatMessage
from .providers import complete
from .services import search
from .serializers import ConversationSerializer


def cite(chunk):
    return {'id': chunk.id, 'document': chunk.document.filename, 'knowledge_base': chunk.knowledge_base.name,
            'text': chunk.text, 'chunk': chunk.chunk_index}

class RagSearchView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        query = str(request.data.get('query', '')).strip()
        if not query or len(query) > 2000: return Response({'detail': 'query is required and must be <= 2000 characters.'}, status=400)
        chunks, semantic = search(request.user, query)
        citations = [cite(c) for c in chunks]
        audit(request, 'RAG_SEARCH', 'retrieval', 'SUCCESS', f'{len(citations)} permitted results; semantic={semantic}')
        return Response({'query': query, 'answer': None, 'citations': citations, 'confidence': None,
                         'semantic_available': semantic, 'results': citations})

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response(ConversationSerializer(Conversation.objects.filter(organization=request.user.organization, user=request.user), many=True).data)
    def post(self, request):
        title = str(request.data.get('title', 'New conversation'))[:255]
        obj = Conversation.objects.create(organization=request.user.organization, user=request.user, title=title)
        return Response(ConversationSerializer(obj).data, status=201)

class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, request, pk):
        return Conversation.objects.filter(pk=pk, organization=request.user.organization, user=request.user).first()
    def get(self, request, pk):
        obj = self.get_object(request, pk)
        return Response(ConversationSerializer(obj).data if obj else {'detail': 'Not found.'}, status=200 if obj else 404)
    @transaction.atomic
    def post(self, request, pk):
        obj = self.get_object(request, pk)
        if not obj: return Response({'detail': 'Not found.'}, status=404)
        content = str(request.data.get('content', '')).strip()
        if not content or len(content) > 10000: return Response({'detail': 'content is required and must be <= 10000 characters.'}, status=400)
        ChatMessage.objects.create(conversation=obj, role='user', content=content)
        audit(request, 'CHAT_MESSAGE', str(obj.id), 'SUCCESS', 'user message received')
        chunks, semantic = search(request.user, content)
        citations = [cite(c) for c in chunks]
        context = '\n\n'.join(f'[{i+1}] {c.text}' for i, c in enumerate(chunks))
        try:
            answer = complete([{'role': 'user', 'content': content}], context)
        except Exception as exc:
            audit(request, 'CHAT_COMPLETION', str(obj.id), 'FAILED', str(exc)[:200])
            return Response({'detail': str(exc), 'citations': citations, 'confidence': None, 'semantic_available': semantic}, status=503)
        confidence = min(0.99, 0.35 + 0.1 * len(citations)) if citations else 0.2
        msg = ChatMessage.objects.create(conversation=obj, role='assistant', content=answer, citations=citations, confidence=confidence)
        audit(request, 'CHAT_COMPLETION', str(obj.id), 'SUCCESS', f'{len(citations)} permitted citations')
        return Response({'message': {'id': msg.id, 'role': msg.role, 'content': msg.content, 'citations': citations, 'confidence': confidence, 'feedback': None}, 'semantic_available': semantic})

class ChatFeedbackView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk, message_id):
        message = ChatMessage.objects.filter(id=message_id, conversation_id=pk, conversation__user=request.user, conversation__organization=request.user.organization).first()
        if not message:
            audit(request, 'CHAT_FEEDBACK', str(message_id), 'DENIED', 'conversation ownership check failed')
            return Response({'detail': 'Not found.'}, status=404)
        feedback = request.data.get('feedback')
        if feedback not in ('up', 'down'):
            return Response({'detail': 'feedback must be up or down.'}, status=400)
        message.feedback = feedback
        message.save(update_fields=['feedback'])
        audit(request, 'CHAT_FEEDBACK', str(message.id), 'SUCCESS', f'feedback={feedback}')
        return Response({'id': message.id, 'feedback': message.feedback})
