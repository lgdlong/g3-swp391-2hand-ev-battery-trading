/**
 * 🚀 REFACTORED: Simplified WebSocket hook with callback approach
 *
 * Key Changes:
 * 1. Removed complex cache updating logic for messages
 * 2. Added onNewMessage callback mechanism for external components
 * 3. Only updates conversations cache for sidebar updates
 * 4. Cleaner separation of concerns
 */

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  chatWebSocketService,
  type NewMessageEvent,
  type SendMessagePayload,
  type JoinConversationPayload,
} from '@/lib/websocket/chat';
import { chatKeys } from './useChat';
import { useAuth } from '@/lib/auth-context';
import type { Conversation, Message } from '@/types/chat';
import { ACCESS_TOKEN_KEY } from '@/config/constants';

// Simplified WebSocket hook for basic chat functionality
export const useChatWebSocket = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();

  // 🐛 Sửa lỗi: Dùng state để theo dõi trạng thái kết nối
  const [isConnected, setIsConnected] = useState(chatWebSocketService.isConnected);

  // ✨ NEW: Store message callback for external components
  const [messageCallback, setMessageCallback] = useState<((message: Message) => void) | null>(null);

  // 🆕 State for confirmation card (Flow F)
  const [confirmationCard, setConfirmationCard] = useState<{
    contractId: string;
    actionParty?: 'BUYER' | 'SELLER';
    isFinal?: boolean;
    pdfUrl?: string;
    timestamp?: string;
  } | null>(null);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('🔌 User not logged in, disconnecting WebSocket');
      chatWebSocketService.disconnect();
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      console.warn('🔌 No access token found for WebSocket connection');
      setIsConnected(false);
      return;
    }

    // Check current connection state
    const currentState = chatWebSocketService.isConnected;
    console.log('🔌 Current WebSocket state:', {
      isConnected: currentState,
      hasToken: !!token,
      isLoggedIn,
    });

    // Only connect if not already connected to prevent duplicate connections
    if (!currentState) {
      console.log('🔌 Attempting to connect WebSocket with token:', token.substring(0, 20) + '...');

      // Reset reconnection settings when establishing new connection
      chatWebSocketService.resetReconnectionSettings();
      chatWebSocketService.connect(token);

      // Update state after a short delay to allow connection to establish
      setTimeout(() => {
        setIsConnected(chatWebSocketService.isConnected);
      }, 500);
    } else {
      console.log('🔌 WebSocket already connected, skipping connection attempt');
      setIsConnected(true);
    }

    return () => {
      // Don't disconnect on cleanup - keep connection alive during navigation
      // Only disconnect if user logs out (handled by isLoggedIn check)
      console.log('🔌 Component unmounting, keeping WebSocket connection alive');
    };
  }, [isLoggedIn]); // Depend on auth state

  const handleNewMessage = useCallback(
    (message: NewMessageEvent) => {
      const { conversationId } = message;
      console.log(`🚀 WebSocket received new message:`, {
        conversationId,
        content: message.content,
      });

      const newMessage = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        conversationId: message.conversationId,
        createdAt: new Date(message.createdAt),
        sender: message.sender,
      };

      // ✨ NEW: Call external callback instead of updating cache
      if (messageCallback) {
        messageCallback(newMessage);
      }

      // Update conversations cache only (keep this part for sidebar updates)
      // ✨ IMPROVED: Move-to-top logic for better UX and performance
      queryClient.setQueryData(chatKeys.conversations(), (old: Conversation[] | undefined) => {
        if (!old) return [];

        let updatedConversation: Conversation | undefined;

        // Lọc ra các cuộc hội thoại khác
        const otherConversations = old.filter((conv) => {
          if (conv.id === conversationId) {
            updatedConversation = {
              ...conv,
              lastMessage: newMessage,
              updatedAt: newMessage.createdAt, // Cập nhật thời gian
            };
            return false; // Loại nó ra khỏi danh sách
          }
          return true; // Giữ lại
        });

        // Nếu tìm thấy, đưa nó lên đầu mảng
        if (updatedConversation) {
          return [updatedConversation, ...otherConversations];
        }

        // Nếu không tìm thấy (lỗi hiếm), trả về y cũ
        return old;
      });
    },
    [queryClient, messageCallback],
  );

  // Set up event listeners
  useEffect(() => {
    console.log('🔌 Setting up WebSocket event listeners');

    // 🐛 Sửa lỗi: Đồng bộ state ngay lập tức với trạng thái hiện tại
    const currentConnectionState = chatWebSocketService.isConnected;
    console.log('🔌 Synchronizing connection state immediately:', currentConnectionState);
    setIsConnected(currentConnectionState);

    // ✨ NEW: Poll connection state periodically to catch missed updates
    const pollInterval = setInterval(() => {
      const actualState = chatWebSocketService.isConnected;
      if (actualState !== isConnected) {
        console.log('🔌 Connection state mismatch detected, updating:', {
          hookState: isConnected,
          actualState,
        });
        setIsConnected(actualState);
      }
    }, 1000); // Check every second

    //  Sửa lỗi: Lắng nghe sự kiện connect/disconnect để cập nhật state
    const cleanupConnect = chatWebSocketService.onConnect(() => {
      console.log('🔌 WebSocket connected - updating state');
      setIsConnected(true);
    });

    const cleanupDisconnect = chatWebSocketService.onDisconnect((reason) => {
      console.log('🔌 WebSocket disconnected - updating state. Reason:', reason);
      setIsConnected(false);

      // If disconnected due to authentication failure and reconnection is disabled,
      // log the user out to refresh the session
      if (reason === 'transport close' && !chatWebSocketService.isConnected) {
        console.warn(
          '🔌 WebSocket disconnected due to authentication issues. Consider refreshing the page.',
        );
        // Don't auto-logout as it might be disruptive. Let user manually refresh.
      }
    });

    const cleanupNewMessage = chatWebSocketService.onNewMessage(handleNewMessage);

    // 🆕 Listen for confirmation card events (Flow F)
    const socket = chatWebSocketService.getSocket();
    const handleShowConfirmationCard = (payload: {
      contractId: string;
      actionParty?: string;
      timestamp?: string;
    }) => {
      console.log('📩 Received confirmation card:', payload);
      setConfirmationCard({ ...payload, actionParty: payload.actionParty as 'BUYER' | 'SELLER' });
    };

    const handleConfirmationComplete = (payload: {
      contractId: string;
      isFinal?: boolean;
      pdfUrl?: string;
      timestamp?: string;
    }) => {
      console.log('✅ Received confirmation complete:', payload);
      setConfirmationCard(payload);
    };

    if (socket) {
      socket.on('server:show_confirmation_card', handleShowConfirmationCard);
      socket.on('server:confirmation_complete', handleConfirmationComplete);
    }

    // ⚠️ Sửa lỗi: Dùng cleanup cụ thể, không dùng removeAllListeners()
    return () => {
      console.log('🔌 Cleaning up WebSocket event listeners');
      clearInterval(pollInterval);
      cleanupConnect();
      cleanupDisconnect();
      cleanupNewMessage();

      // Cleanup confirmation card listeners
      if (socket) {
        socket.off('server:show_confirmation_card', handleShowConfirmationCard);
        socket.off('server:confirmation_complete', handleConfirmationComplete);
      }
    };
  }, [handleNewMessage, isConnected]);

  // Return WebSocket service methods for components to use
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    setMessageCallback(() => callback);
    return () => setMessageCallback(null); // Return cleanup function
  }, []);

  const sendMessage = useCallback(
    (payload: SendMessagePayload) => chatWebSocketService.sendMessage(payload),
    [],
  );

  const joinConversation = useCallback(
    (payload: JoinConversationPayload) => chatWebSocketService.joinConversation(payload),
    [],
  );

  const leaveConversation = useCallback(
    (payload: JoinConversationPayload) => chatWebSocketService.leaveConversation(payload),
    [],
  );

  const hookState = {
    sendMessage,
    joinConversation,
    leaveConversation,
    isConnected: isConnected, // Trả về state thay vì thuộc tính tĩnh
    // ✨ NEW: Provide callback mechanism for listening to new messages
    onNewMessage,
    // 🆕 Expose confirmation card state (Flow F)
    confirmationCard,
  };

  // Debug log for troubleshooting
  console.log('🔌 useChatWebSocket returning state:', {
    isConnected: hookState.isConnected,
    serviceConnected: chatWebSocketService.isConnected,
    hasConfirmationCard: !!hookState.confirmationCard,
  });

  return hookState;
};
