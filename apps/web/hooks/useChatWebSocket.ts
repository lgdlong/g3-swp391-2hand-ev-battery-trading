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

    // Only connect if not already connected to prevent duplicate connections
    if (!chatWebSocketService.isConnected) {
      console.log('🔌 Attempting to connect WebSocket with token:', token.substring(0, 20) + '...');

      // Reset reconnection settings when establishing new connection
      chatWebSocketService.resetReconnectionSettings();
      chatWebSocketService.connect(token);
    } else {
      console.log('🔌 WebSocket already connected, skipping connection attempt');
      setIsConnected(true);
    }

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      chatWebSocketService.disconnect();
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
      queryClient.setQueryData(chatKeys.conversations(), (old: Conversation[] | undefined) => {
        if (!old) return old;

        return old.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
            };
          }
          return conv;
        });
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

    // 🚀 Cải tiến: Periodic sync to handle edge cases
    const syncInterval = setInterval(() => {
      const realTimeState = chatWebSocketService.isConnected;
      setIsConnected((prevState) => {
        if (prevState !== realTimeState) {
          console.log('🔌 Connection state drift detected, syncing:', realTimeState);
        }
        return realTimeState;
      });
    }, 1000); // Check every second

    // 🐛 Sửa lỗi: Lắng nghe sự kiện connect/disconnect để cập nhật state
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

    // ⚠️ Sửa lỗi: Dùng cleanup cụ thể, không dùng removeAllListeners()
    return () => {
      console.log('🔌 Cleaning up WebSocket event listeners');
      clearInterval(syncInterval);
      cleanupConnect();
      cleanupDisconnect();
      cleanupNewMessage();
    };
  }, [handleNewMessage]);

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
  };

  // Debug log for troubleshooting
  console.log('🔌 useChatWebSocket returning state:', {
    isConnected: hookState.isConnected,
    serviceConnected: chatWebSocketService.isConnected,
  });

  return hookState;
};
