from django.urls import path
from .views import RagSearchView, ConversationListView, ConversationDetailView, ChatFeedbackView
urlpatterns = [
    path('rag/search/', RagSearchView.as_view()),
    path('chat/conversations/', ConversationListView.as_view()),
    path('chat/conversations/<int:pk>/', ConversationDetailView.as_view()),
    path('chat/conversations/<int:pk>/messages/<int:message_id>/feedback/', ChatFeedbackView.as_view()),
]
