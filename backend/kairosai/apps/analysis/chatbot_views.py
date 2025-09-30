from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q
import json
import logging
from datetime import datetime
from typing import Dict, List

from .models import MarketReport, ChatConversation, ChatMessage
from .serializers import (
    MarketReportListSerializer, 
    ChatConversationSerializer, 
    ChatMessageSerializer,
    ChatMessageCreateSerializer
)
from ..ai_agents.chatgpt_service import ChatGPTService

User = get_user_model()
logger = logging.getLogger(__name__)

class MarketReportsAPIView(APIView):
    """API endpoint to get user's market reports for chatbot context"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all market reports for the authenticated user"""
        try:
            reports = MarketReport.objects.filter(user=request.user, status='completed')
            serializer = MarketReportListSerializer(reports, many=True)
            
            return Response({
                'reports': serializer.data,
                'count': reports.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching market reports: {str(e)}")
            return Response(
                {'error': 'Failed to fetch market reports'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatConversationsAPIView(APIView):
    """API endpoint to manage chat conversations"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all chat conversations for the user"""
        try:
            conversations = ChatConversation.objects.filter(user=request.user)
            serializer = ChatConversationSerializer(conversations, many=True)
            
            return Response({
                'conversations': serializer.data,
                'count': conversations.count()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching conversations: {str(e)}")
            return Response(
                {'error': 'Failed to fetch conversations'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        """Create a new chat conversation"""
        try:
            title = request.data.get('title', f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}")
            
            conversation = ChatConversation.objects.create(
                user=request.user,
                title=title
            )
            
            serializer = ChatConversationSerializer(conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating conversation: {str(e)}")
            return Response(
                {'error': 'Failed to create conversation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatMessageAPIView(APIView):
    """API endpoint to handle chat messages and RAG responses"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Send a message and get AI response"""
        try:
            serializer = ChatMessageCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            content = serializer.validated_data['content']
            conversation_id = serializer.validated_data.get('conversation_id')
            
            # Get or create conversation
            if conversation_id:
                try:
                    conversation = ChatConversation.objects.get(id=conversation_id, user=request.user)
                except ChatConversation.DoesNotExist:
                    return Response(
                        {'error': 'Conversation not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                conversation = ChatConversation.objects.create(
                    user=request.user,
                    title=f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                )
            
            # Save user message
            user_message = ChatMessage.objects.create(
                conversation=conversation,
                message_type='user',
                content=content
            )
            
            # Generate AI response using RAG
            ai_response, sources = self._generate_rag_response(content, request.user)
            
            # Save AI response
            ai_message = ChatMessage.objects.create(
                conversation=conversation,
                message_type='assistant',
                content=ai_response,
                sources=sources
            )
            
            # Update conversation timestamp
            conversation.updated_at = datetime.now()
            conversation.save()
            
            return Response({
                'conversation_id': conversation.id,
                'user_message': ChatMessageSerializer(user_message).data,
                'ai_message': ChatMessageSerializer(ai_message).data,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error processing chat message: {str(e)}")
            return Response(
                {'error': 'Failed to process message'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_rag_response(self, query: str, user: User) -> tuple[str, List[str]]:
        """Generate AI response using ChatGPT with RAG from user's market reports"""
        try:
            # Initialize ChatGPT service
            chatgpt_service = ChatGPTService()
            
            # Get user's market reports
            reports = MarketReport.objects.filter(user=user, status='completed')
            
            if not reports.exists():
                return (
                    "I don't have access to any market analysis reports yet. Please generate some market analysis reports first, and then I'll be able to help you analyze them and answer your questions.",
                    []
                )
            
            # Get conversation history for context
            conversation_history = self._get_conversation_history(user)
            
            # Convert reports to context format
            context_reports = []
            for report in reports:
                context_reports.append({
                    'title': f"Market Analysis: {report.company_name} expanding to {report.target_market}",
                    'company_name': report.company_name,
                    'industry': report.industry,
                    'target_market': report.target_market,
                    'summary': report.executive_summary or 'No summary available',
                    'key_insights': report.key_insights or [],
                    'scores': report.detailed_scores or {},
                    'created_at': report.created_at.isoformat() if report.created_at else 'N/A'
                })
            
            # Generate ChatGPT response with RAG context
            chatgpt_response = chatgpt_service.generate_response_with_rag(
                user_query=query,
                context_reports=context_reports,
                conversation_history=conversation_history
            )
            
            return chatgpt_response['content'], chatgpt_response['sources']
            
        except Exception as e:
            logger.error(f"Error in ChatGPT RAG response generation: {str(e)}")
            return (
                "I encountered an error while processing your question. Please try again.",
                []
            )
    
    def _get_conversation_history(self, user: User) -> List[Dict]:
        """Get recent conversation history for context"""
        try:
            # Get the most recent conversation for the user
            recent_conversation = ChatConversation.objects.filter(user=user).order_by('-updated_at').first()
            
            if not recent_conversation:
                return []
            
            # Get recent messages from the conversation
            recent_messages = ChatMessage.objects.filter(
                conversation=recent_conversation
            ).order_by('-created_at')[:10]  # Last 10 messages
            
            conversation_history = []
            for message in reversed(recent_messages):  # Reverse to get chronological order
                conversation_history.append({
                    'message_type': message.message_type,
                    'content': message.content,
                    'created_at': message.created_at.isoformat() if message.created_at else None
                })
            
            return conversation_history
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {str(e)}")
            return []
    
    def _find_relevant_reports(self, query: str, reports) -> List[MarketReport]:
        """Find reports relevant to the query (simple keyword matching for now)"""
        query_lower = query.lower()
        relevant_reports = []
        
        for report in reports:
            # Check if query mentions company, industry, or target market
            if (query_lower in report.company_name.lower() or
                query_lower in report.industry.lower() or
                query_lower in report.target_market.lower() or
                any(keyword in query_lower for keyword in ['market', 'analysis', 'report', 'opportunity', 'competition', 'revenue'])):
                relevant_reports.append(report)
        
        # If no specific matches, return the most recent reports
        if not relevant_reports:
            relevant_reports = list(reports[:3])  # Get 3 most recent reports
        
        return relevant_reports
    
    def _generate_response_from_reports(self, query: str, reports: List[MarketReport]) -> str:
        """Generate response based on relevant reports"""
        try:
            # Simple response generation - in production, use OpenAI/Anthropic API
            response_parts = []
            
            for report in reports:
                report_summary = report.get_summary_for_rag()
                
                # Generate contextual response based on report content
                if 'market opportunity' in query.lower() or 'opportunity' in query.lower():
                    market_score = report.detailed_scores.get('market_opportunity_score', 5.0)
                    response_parts.append(
                        f"**{report_summary['title']}**\n"
                        f"Market Opportunity Score: {market_score}/10\n"
                        f"Target Market: {report.target_market}\n"
                        f"Industry: {report.industry}\n\n"
                    )
                
                elif 'competition' in query.lower() or 'competitive' in query.lower():
                    competitive_intensity = report.detailed_scores.get('competitive_intensity', 'Medium')
                    response_parts.append(
                        f"**{report_summary['title']}**\n"
                        f"Competitive Intensity: {competitive_intensity}\n"
                        f"Market: {report.target_market}\n\n"
                    )
                
                elif 'revenue' in query.lower() or 'financial' in query.lower():
                    revenue_y1 = report.detailed_scores.get('revenue_potential_y1', 'N/A')
                    revenue_y3 = report.detailed_scores.get('revenue_potential_y3', 'N/A')
                    response_parts.append(
                        f"**{report_summary['title']}**\n"
                        f"Year 1 Revenue Potential: {revenue_y1}\n"
                        f"Year 3 Revenue Potential: {revenue_y3}\n"
                        f"Market: {report.target_market}\n\n"
                    )
                
                else:
                    # General response
                    response_parts.append(
                        f"**{report_summary['title']}**\n"
                        f"Summary: {report.executive_summary[:200]}...\n"
                        f"Market: {report.target_market}\n"
                        f"Industry: {report.industry}\n\n"
                    )
            
            if response_parts:
                return "Based on your market analysis reports:\n\n" + "\n".join(response_parts)
            else:
                return "I found your reports but couldn't generate a specific response. Could you ask a more specific question about your market analysis?"
                
        except Exception as e:
            logger.error(f"Error generating response from reports: {str(e)}")
            return "I encountered an error while analyzing your reports. Please try again."

class ChatHistoryAPIView(APIView):
    """API endpoint to get chat history for a conversation"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, conversation_id):
        """Get all messages for a specific conversation"""
        try:
            conversation = ChatConversation.objects.get(id=conversation_id, user=request.user)
            messages = ChatMessage.objects.filter(conversation=conversation)
            serializer = ChatMessageSerializer(messages, many=True)
            
            return Response({
                'conversation': ChatConversationSerializer(conversation).data,
                'messages': serializer.data
            }, status=status.HTTP_200_OK)
            
        except ChatConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching chat history: {str(e)}")
            return Response(
                {'error': 'Failed to fetch chat history'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
