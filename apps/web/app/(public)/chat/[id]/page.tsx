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
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messagesData } = useConversationMessages(
    activeChatId || '',
    { limit: 50 },
    !!activeChatId && !!isLoggedIn,
  );

  // WebSocket integration
  const {
    sendMessage: wsSendMessage,
    joinConversation,
    leaveConversation,
    isConnected,
  } = useChatWebSocket();

  // Redirect to login if not authenticated
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
    if (!activeChatId || !isConnected) return;

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

  // Transform conversations for Sidebar component
  const transformedChats = conversations.map((conv) => ({
    id: conv.id,
    sellerName: user?.id === conv.sellerId ? conv.buyer.fullName : conv.seller.fullName,
    sellerAvatar: 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=User',
    lastMessage: conv.lastMessage?.content || 'Chưa có tin nhắn',
    lastMessageTime: conv.lastMessage?.createdAt
      ? new Date(conv.lastMessage.createdAt).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
    product: {
      image: conv.post.images?.[0] || 'https://placehold.co/600x400/EFEFEF/AAAAAA?text=Product',
      title: conv.post.title,
      price: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(conv.post.price),
    },
    messages:
      messagesData?.messages?.map((msg) => ({
        id: msg.id,
        sender: msg.senderId === user?.id ? 'user' : 'seller',
        text: msg.content,
      })) || [],
  }));

  const activeTransformedChat = transformedChats.find((chat) => chat.id === activeChatId) || null;

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      <Sidebar
        chats={transformedChats}
        activeChatId={activeChatId}
        onChatSelect={handleChatSelect}
      />
      <ChatWindow chat={activeTransformedChat} onSendMessage={handleSendMessage} />
    </div>
  );
}
