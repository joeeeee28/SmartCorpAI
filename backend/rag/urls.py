from django.urls import path
from .views import RagSearchView, ConversationListView, ConversationDetailView
urlpatterns = [
    path('rag/search/', RagSearchView.as_view()),
    path('chat/conversations/', ConversationListView.as_view()),
    path('chat/conversations/<int:pk>/', ConversationDetailView.as_view()),
]
