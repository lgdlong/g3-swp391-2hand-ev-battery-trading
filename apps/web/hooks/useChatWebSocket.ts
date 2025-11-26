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

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (!isLoggedIn) {
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

    // Only connect if not already connected to prevent duplicate connections
    if (!currentState) {
      // Reset reconnection settings when establishing new connection
      chatWebSocketService.resetReconnectionSettings();
      chatWebSocketService.connect(token);

      // Update state after a short delay to allow connection to establish
      setTimeout(() => {
        setIsConnected(chatWebSocketService.isConnected);
      }, 500);
    } else {
      setIsConnected(true);
    }

    return () => {
      // Don't disconnect on cleanup - keep connection alive during navigation
      // Only disconnect if user logs out (handled by isLoggedIn check)
    };
  }, [isLoggedIn]); // Depend on auth state

  const handleNewMessage = useCallback(
    (message: NewMessageEvent) => {
      const { conversationId } = message;

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
    // Đồng bộ state ngay lập tức với trạng thái hiện tại
    const currentConnectionState = chatWebSocketService.isConnected;
    setIsConnected(currentConnectionState);

    // Poll connection state periodically to catch missed updates
    const pollInterval = setInterval(() => {
      const actualState = chatWebSocketService.isConnected;
      if (actualState !== isConnected) {
        setIsConnected(actualState);
      }
    }, 1000); // Check every second

    // Lắng nghe sự kiện connect/disconnect để cập nhật state
    const cleanupConnect = chatWebSocketService.onConnect(() => {
      setIsConnected(true);
    });

    const cleanupDisconnect = chatWebSocketService.onDisconnect((reason) => {
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

    return () => {
      clearInterval(pollInterval);
      cleanupConnect();
      cleanupDisconnect();
      cleanupNewMessage();
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
    // Provide callback mechanism for listening to new messages
    onNewMessage,
  };
  return hookState;
};
