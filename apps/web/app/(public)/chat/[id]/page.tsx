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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useConversations, useInfiniteConversationMessages, chatKeys } from '@/hooks/useChat';
import { useAuth } from '@/lib/auth-context';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import {
  getContractByListingAndBuyer,
  getContractByBuyerAndListing,
  createContractBySeller,
  type Contract,
} from '@/lib/api/transactionApi';
import type { Message } from '@/types/chat';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const { user, isLoggedIn, loading } = useAuth();
  const queryClient = useQueryClient();

  // Use chatId from URL as the active chat ID
  const activeChatId = chatId;

  // ✨ NEW: State for real-time messages from WebSocket
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  // React Query hooks - only enabled when user is logged in
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversations();

  // ✨ CHANGED: Use infinite query instead of regular query
  const { data: infiniteMessagesData, error: messagesError } = useInfiniteConversationMessages(
    activeChatId || '',
    50, // limit
    !!activeChatId && !!isLoggedIn,
  );

  // Get active conversation
  const activeConversation = conversations.find((conv) => conv.id === activeChatId) || null;

  // Get contract for current conversation (if exists)
  const listingId = activeConversation?.post?.id;
  const buyerId = activeConversation?.buyerId;
  const isSeller = user?.id === activeConversation?.sellerId;
  const isBuyer = user?.id === activeConversation?.buyerId;

  // Query contract - different endpoints for seller vs buyer
  const {
    data: existingContract,
    isLoading: isLoadingContract,
    error: contractError,
  } = useQuery<Contract | null>({
    queryKey: ['contract', listingId, buyerId, isSeller ? 'seller' : 'buyer'],
    queryFn: () => {
      if (!listingId) return null;
      if (isSeller && buyerId) {
        // Seller: get contract by listing and buyer
        return getContractByListingAndBuyer(listingId, buyerId);
      } else if (isBuyer) {
        // Buyer: get contract by listing (their own contract)
        return getContractByBuyerAndListing(listingId);
      }
      return null;
    },
    enabled: !!listingId && !!user && (isSeller ? !!buyerId : isBuyer),
  });

  // Mutation to create contract when seller confirms order
  const createContractMutation = useMutation({
    mutationFn: async (isExternalTransaction: boolean) => {
      if (!listingId || !buyerId) {
        throw new Error('Missing listingId or buyerId');
      }
      return createContractBySeller(listingId, buyerId, isExternalTransaction);
    },
    onSuccess: () => {
      toast.success('Đã chốt đơn thành công!');
      // Invalidate contract queries to refetch (for both seller and buyer)
      queryClient.invalidateQueries({ queryKey: ['contract', listingId] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi chốt đơn';
      toast.error(errorMessage);
      console.error('Error creating contract:', error);
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

      // ✅ FIX: Only add message if it belongs to the current conversation
      if (message.conversationId === activeChatId) {
        setNewMessages((prev) => [...prev, message]);
      } else {
        console.log(
          `⚠️ Ignoring message from different conversation. Current: ${activeChatId}, Message: ${message.conversationId}`,
        );
      }
    };

    // Set up the listener
    const cleanup = onNewMessage(handleNewMessage);

    return cleanup;
  }, [onNewMessage, activeChatId]);

  // ✨ NEW: Reset newMessages when activeChatId changes and invalidate React Query to fetch latest messages
  useEffect(() => {
    if (!activeChatId) return;
    
    console.log('🔄 Active chat changed, resetting new messages state and refetching messages');
    setNewMessages([]);
    
    // Invalidate and refetch messages from server to ensure we have all messages
    // This is important when user enters chat page - they should see all messages that were sent while they were away
    queryClient.invalidateQueries({
      queryKey: chatKeys.messages(activeChatId),
    });
  }, [activeChatId, queryClient]);

  // ✨ NEW: Merge old messages (from React Query) with new messages (from state)
  const allMessages = useMemo(() => {
    if (!activeChatId) return [];

    // Get old messages from infinite query and flatten them
    // Backend already returns messages in chronological order (ASC), so no need to reverse
    const oldMessages = infiniteMessagesData?.pages?.flatMap((page) => page.messages || []) || [];

    // ✅ FIX: Filter messages to ensure they belong to current conversation
    const filteredOldMessages = oldMessages.filter(
      (msg) => msg.conversationId === activeChatId,
    );

    // Filter new messages to avoid duplicates and ensure they belong to current conversation
    const uniqueNewMessages = newMessages.filter(
      (newMsg) =>
        newMsg.conversationId === activeChatId &&
        !filteredOldMessages.some((oldMsg) => oldMsg.id === newMsg.id),
    );

    // Combine: old messages + unique new messages (both already in chronological order)
    return [...filteredOldMessages, ...uniqueNewMessages];
  }, [infiniteMessagesData, newMessages, activeChatId]);

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


  // Handle contract creation
  const handleContractCreated = (isExternalTransaction: boolean) => {
    if (!listingId || !buyerId) {
      toast.error('Thiếu thông tin để chốt đơn');
      return;
    }
    createContractMutation.mutate(isExternalTransaction);
  };

  // Ensure user exists before rendering
  if (!user || !user.id) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        existingContract={existingContract || undefined}
        isLoadingContract={isLoadingContract || createContractMutation.isPending}
        onContractCreated={handleContractCreated}
      />
    </div>
  );
}
