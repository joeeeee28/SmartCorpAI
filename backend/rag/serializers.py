from rest_framework import serializers
from .models import Conversation, ChatMessage

class CitationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    document = serializers.CharField()
    knowledge_base = serializers.CharField()
    text = serializers.CharField()
    chunk = serializers.IntegerField()

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ('id', 'role', 'content', 'citations', 'confidence', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    class Meta:
        model = Conversation
        fields = ('id', 'title', 'created_at', 'updated_at', 'messages')
