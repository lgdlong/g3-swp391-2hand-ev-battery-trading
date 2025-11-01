'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useConversations, useConversationMessages } from '@/hooks/useChat';
import { useAuth } from '@/lib/auth-context';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { user, isLoggedIn, loading } = useAuth();

  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);

  // React Query hooks - only enabled when user is logged in
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();
  const { data: messagesData, error: messagesError } = useConversationMessages(
    activeChatId || '',
    { limit: 50 },
    !!activeChatId && !!isLoggedIn,
  );

  // Log any API errors
  useEffect(() => {
    if (conversationsError) {
      console.error('❌ Error loading conversations:', conversationsError);
    }
    if (messagesError) {
      console.error('❌ Error loading messages:', messagesError);
    }
  }, [conversationsError, messagesError]);

  // WebSocket integration
  const {
    sendMessage: wsSendMessage,
    joinConversation,
    leaveConversation,
    isConnected,
  } = useChatWebSocket();

  // Handle case where requested conversation doesn't exist
  useEffect(() => {
    if (!conversationsLoading && conversations.length > 0 && activeChatId) {
      const conversationExists = conversations.some((conv) => conv.id === activeChatId);
      if (!conversationExists) {
        console.warn(
          `❌ Conversation ${activeChatId} not found, redirecting to first available conversation`,
        );
        // Redirect to first available conversation
        const firstConversation = conversations[0];
        if (firstConversation) {
          router.replace(`/chat/${firstConversation.id}`);
        }
      }
    }
  }, [conversations, conversationsLoading, activeChatId, router]);

  // Redirect to first conversation if no specific chat is selected
  useEffect(() => {
    if (!conversationsLoading && conversations.length > 0 && !activeChatId) {
      console.log('📝 No active chat selected, redirecting to first conversation');
      const firstConversation = conversations[0];
      if (firstConversation) {
        router.replace(`/chat/${firstConversation.id}`);
      }
    }
  }, [conversations, conversationsLoading, activeChatId, router]);
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [isLoggedIn, loading, router]);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    // Leave previous conversation
    if (activeChatId) {
      leaveConversation({ conversationId: activeChatId });
    }

    setActiveChatId(chatId);
  };

  // Handle sending message
  const handleSendMessage = (message: string) => {
    console.log('[DEBUG] Sending message to conversation:', activeChatId);
    console.log('[DEBUG] Message content:', message);
    console.log('[DEBUG] WebSocket connected status:', isConnected);

    if (!activeChatId || !isConnected) {
      console.warn('❌ Cannot send message: No active chat or WebSocket not connected');
      return;
    }

    // Send via WebSocket
    wsSendMessage({
      conversationId: activeChatId,
      content: message,
    });
  };

  // Join conversation when activeChatId changes
  useEffect(() => {
    if (!activeChatId || !isConnected) return;

    // Join conversation room
    joinConversation({ conversationId: activeChatId });

    return () => {
      leaveConversation({ conversationId: activeChatId });
    };
  }, [activeChatId, isConnected, joinConversation, leaveConversation]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render chat if user data is not available
  if (!user) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Loading states
  if (conversationsLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeConversation = conversations.find((conv) => conv.id === activeChatId) || null;
  const messages = messagesData?.messages || [];

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onChatSelect={handleChatSelect}
        currentUserId={user.id}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        currentUserId={user.id}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
