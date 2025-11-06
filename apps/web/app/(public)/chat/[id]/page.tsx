/**
 * 🚀 REFACTORED: Chat UI with Separated State Approach
 *
 * Key Changes:
 * 1. Uses useInfiniteConversationMessages for old messages (React Query)
 * 2. Uses newMessages state for real-time WebSocket messages
 * 3. Merges both sources in allMessages useMemo
 * 4. WebSocket only updates local state, not React Query cache
 * 5. Auto-resets newMessages when activeChatId changes
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useConversations, useInfiniteConversationMessages } from '@/hooks/useChat';
import { useAuth } from '@/lib/auth-context';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import type { Message } from '@/types/chat';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createContractBySeller,
  getContractByListingAndBuyer,
  getContractByBuyerAndListing,
} from '@/lib/api/transactionApi';
import { toast } from 'sonner';
import { ACCESS_TOKEN_KEY } from '@/config/constants';
import { chatWebSocketService } from '@/lib/websocket/chat';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { user, isLoggedIn, loading } = useAuth();

  // Use chatId from URL as the active chat ID
  const activeChatId = chatId;

  // ✨ IMPORTANT: All hooks must be called before any early returns
  // This includes useQueryClient and useQuery for contracts
  const queryClient = useQueryClient();

  // ✨ NEW: State for real-time messages from WebSocket
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  // React Query hooks - only enabled when user is logged in
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();

  // ✨ CHANGED: Use infinite query instead of regular query
  const { data: infiniteMessagesData, error: messagesError, isLoading: messagesLoading } = useInfiniteConversationMessages(
    activeChatId || '',
    50, // limit
    !!activeChatId && !!isLoggedIn && !!user,
  );

  // Get active conversation early (before early returns)
  const activeConversation = conversations.find((conv) => conv.id === activeChatId) || null;
  const isSeller = activeConversation && user?.id === activeConversation.sellerId;
  const isBuyer = activeConversation && user?.id === activeConversation.buyerId;

  // Debug: Log messages query state
  useEffect(() => {
    if (activeChatId) {
      const totalMessages = infiniteMessagesData?.pages?.reduce((sum, page) => sum + (page.messages?.length || 0), 0) || 0;
      console.log('Messages query state:', {
        activeChatId,
        isLoggedIn,
        hasUser: !!user,
        userId: user?.id,
        enabled: !!activeChatId && !!isLoggedIn && !!user,
        messagesLoading,
        messagesError: messagesError ? String(messagesError) : null,
        pagesCount: infiniteMessagesData?.pages?.length || 0,
        totalMessages,
        isSeller,
        isBuyer,
        conversationSellerId: activeConversation?.sellerId,
        conversationBuyerId: activeConversation?.buyerId,
        sampleMessages: infiniteMessagesData?.pages?.[0]?.messages?.slice(0, 3).map(m => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content.substring(0, 30),
        })) || [],
      });

      // Warn if no messages but query is enabled
      if (!messagesLoading && !messagesError && totalMessages === 0 && !!activeChatId && !!isLoggedIn && !!user) {
        console.warn('No messages found for conversation:', activeChatId);
      }
    }
  }, [activeChatId, isLoggedIn, user, messagesLoading, messagesError, infiniteMessagesData, isSeller, isBuyer, activeConversation]);
  const buyerId = activeConversation?.buyerId;
  const listingId = activeConversation?.postId;

  // For seller: get contract by listing and buyer
  // For buyer: get contract by listing (their own contract)
  // MUST be called before any early returns
  const { data: existingContract, isLoading: isLoadingContract } = useQuery({
    queryKey: ['contract', 'listing', listingId, 'buyer', buyerId],
    queryFn: async () => {
      if (isSeller && listingId && buyerId) {
        // Seller: get contract for this specific buyer
        return getContractByListingAndBuyer(listingId, buyerId);
      }
      if (isBuyer && listingId) {
        // Buyer: get their own contract for this listing
        return getContractByBuyerAndListing(listingId);
      }
      return null;
    },
    enabled: ((!!isSeller || !!isBuyer) && !!listingId && !!activeConversation && !!user) || false,
    refetchInterval: (query) => {
      // Only refetch if enabled and no contract exists yet
      if (query.state.data === null || query.state.data === undefined) {
        return 10000; // Refetch every 10 seconds if no contract
      }
      return false; // Stop refetching once contract exists
    },
  });

  // Mutation to create contract when seller confirms order
  // MUST be called before any early returns
  const createContractMutation = useMutation({
    mutationFn: ({ listingId, buyerId }: { listingId: string; buyerId: number }) =>
      createContractBySeller(listingId, buyerId),
    onSuccess: (contract) => {
      toast.success('Chốt đơn thành công! Thông báo đã được gửi đến buyer.');
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['contract', 'listing', listingId, 'buyer', buyerId] });
      queryClient.invalidateQueries({ queryKey: ['contract', 'buyer', 'listing', listingId] });
      queryClient.invalidateQueries({ queryKey: ['sellerContracts'] });
      queryClient.invalidateQueries({ queryKey: ['buyerContracts'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi chốt đơn');
    },
  });

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
    onNewMessage, // ✨ NEW: Get callback to listen for new messages
  } = useChatWebSocket();

  // ✨ NEW: Listen for WebSocket messages and update state only
  useEffect(() => {
    if (!onNewMessage || !activeChatId) return;

    const handleNewMessage = (message: Message) => {
      console.log('🚀 Received new message via WebSocket:', message);
      console.log('🚀 Active chat ID:', activeChatId);
      console.log('🚀 Message conversation ID:', message.conversationId);

      // Only add message if it belongs to the active conversation
      if (message.conversationId === activeChatId) {
        console.log('✅ Message belongs to active conversation, adding to state');
        setNewMessages((prev) => {
          // Check for duplicates
          const exists = prev.some((msg) => msg.id === message.id);
          if (exists) {
            console.log('⚠️ Duplicate message detected, skipping');
            return prev;
          }
          return [...prev, message];
        });
      } else {
        console.log('⚠️ Message belongs to different conversation, ignoring');
      }
    };

    // Set up the listener
    const cleanup = onNewMessage(handleNewMessage);

    return cleanup;
  }, [onNewMessage, activeChatId]);

  // ✨ NEW: Reset newMessages when activeChatId changes
  useEffect(() => {
    console.log('🔄 Active chat changed, resetting new messages state');
    setNewMessages([]);
  }, [activeChatId]);

  // ✨ NEW: Merge old messages (from React Query) with new messages (from state)
  const allMessages = useMemo(() => {
    // Get old messages from infinite query and flatten them
    // Backend already returns messages in chronological order (ASC), so no need to reverse
    const oldMessages = infiniteMessagesData?.pages?.flatMap((page) => page.messages || []) || [];

    // Filter new messages to only include messages for the active conversation
    const filteredNewMessages = newMessages.filter(
      (msg) => msg.conversationId === activeChatId,
    );

    // Filter new messages to avoid duplicates
    const uniqueNewMessages = filteredNewMessages.filter(
      (newMsg) => !oldMessages.some((oldMsg) => oldMsg.id === newMsg.id),
    );

    // Combine: old messages + unique new messages (both already in chronological order)
    const combined = [...oldMessages, ...uniqueNewMessages];

    console.log('📊 Messages summary:', {
      activeChatId,
      oldMessages: oldMessages.length,
      newMessages: newMessages.length,
      filteredNewMessages: filteredNewMessages.length,
      uniqueNewMessages: uniqueNewMessages.length,
      total: combined.length,
      isSeller,
      isBuyer,
      userId: user?.id,
      conversationSellerId: activeConversation?.sellerId,
      conversationBuyerId: activeConversation?.buyerId,
      oldMessagesSample: oldMessages.slice(0, 3).map(m => ({ id: m.id, senderId: m.senderId, content: m.content.substring(0, 30) })),
    });

    return combined;
  }, [infiniteMessagesData, newMessages, activeChatId, isSeller, isBuyer, user?.id, activeConversation?.sellerId, activeConversation?.buyerId]);

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
    if (activeChatId && activeChatId !== chatId) {
      leaveConversation({ conversationId: activeChatId });
    }

    // Navigate to the new conversation URL (this will update the dynamic param)
    router.push(`/chat/${chatId}`);
  };

  // Handle sending message
  const handleSendMessage = (message: string) => {
    console.log('[DEBUG] Sending message to conversation:', activeChatId);
    console.log('[DEBUG] Message content:', message);
    console.log('[DEBUG] WebSocket connected status:', isConnected);
    console.log('[DEBUG] isLoggedIn:', isLoggedIn);
    console.log('[DEBUG] user:', user?.id);

    if (!activeChatId) {
      console.warn('❌ Cannot send message: No active chat');
      toast.error('Vui lòng chọn một cuộc trò chuyện');
      return;
    }

    // Check actual connection state from service (not just hook state)
    const actualConnected = chatWebSocketService.isConnected;
    console.log('🔌 Connection check:', {
      hookState: isConnected,
      actualState: actualConnected,
    });

    if (!actualConnected) {
      console.warn('❌ WebSocket not connected, attempting to reconnect...');
      // Try to reconnect
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && isLoggedIn) {
        console.log('🔌 Reconnecting WebSocket...');
        chatWebSocketService.resetReconnectionSettings();
        chatWebSocketService.connect(token);
        // Wait a bit and try again
        setTimeout(() => {
          const stillConnected = chatWebSocketService.isConnected;
          if (stillConnected) {
            console.log('✅ WebSocket reconnected, sending message');
            wsSendMessage({
              conversationId: activeChatId,
              content: message,
            });
          } else {
            console.error('❌ WebSocket still not connected after retry');
            toast.error('Không thể kết nối. Vui lòng thử lại sau hoặc refresh trang.');
          }
        }, 2000);
      } else {
        console.error('❌ No token or not logged in');
        toast.error('Vui lòng đăng nhập lại');
      }
      return;
    }

    // If service says connected but hook state is false, update it and proceed
    if (actualConnected && !isConnected) {
      console.warn('⚠️ State mismatch: Service connected but hook state false. Proceeding anyway.');
    }

    // Send via WebSocket
    console.log('📤 Sending message via WebSocket:', {
      conversationId: activeChatId,
      content: message.substring(0, 50),
      isConnected: actualConnected,
      userId: user?.id,
    });

    try {
      wsSendMessage({
        conversationId: activeChatId,
        content: message,
      });
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  // Join conversation when activeChatId changes
  useEffect(() => {
    // Check actual connection state from service
    const actualConnected = chatWebSocketService.isConnected;

    console.log('🔌 Join conversation check:', {
      activeChatId,
      hookIsConnected: isConnected,
      actualConnected,
      willJoin: !!activeChatId && actualConnected,
    });

    if (!activeChatId) {
      console.warn('⚠️ No activeChatId, cannot join conversation');
      return;
    }

    if (!actualConnected) {
      console.warn('⚠️ WebSocket not connected, cannot join conversation. Will retry when connected.');
      // Try to connect if not connected
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token && isLoggedIn) {
        console.log('🔌 Attempting to connect WebSocket for conversation join...');
        chatWebSocketService.resetReconnectionSettings();
        chatWebSocketService.connect(token);
      }
      return;
    }

    // Join conversation room
    console.log('✅ Joining conversation room:', activeChatId);
    joinConversation({ conversationId: activeChatId });

    return () => {
      console.log('👋 Leaving conversation room:', activeChatId);
      leaveConversation({ conversationId: activeChatId });
    };
  }, [activeChatId, isConnected, isLoggedIn, joinConversation, leaveConversation]);

  // Debug: Log final state before render
  // MUST be called before any early returns
  useEffect(() => {
    if (!user || !activeChatId) return; // Only log when we have user and activeChatId
    console.log('🎯 ChatPage - Final render state:', {
      activeChatId,
      activeConversation: activeConversation?.id,
      allMessagesCount: allMessages.length,
      isSeller,
      isBuyer,
      isConnected,
      conversationsCount: conversations.length,
      infiniteMessagesDataPages: infiniteMessagesData?.pages?.length || 0,
      newMessagesCount: newMessages.length,
    });
  }, [activeChatId, activeConversation?.id, allMessages.length, isSeller, isBuyer, isConnected, conversations.length, infiniteMessagesData?.pages?.length, newMessages.length, user]);

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

  const handleContractCreated = () => {
    if (listingId && buyerId) {
      createContractMutation.mutate({ listingId, buyerId });
    }
  };

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
        messages={allMessages}
        currentUserId={user.id}
        onSendMessage={handleSendMessage}
        existingContract={existingContract}
        isLoadingContract={isLoadingContract || createContractMutation.isPending}
        onContractCreated={handleContractCreated}
      />
    </div>
  );
}
