import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatWebSocketService, type NewMessageEvent } from '@/lib/websocket/chat';
import { chatKeys } from './useChat';
import { useAuth } from '@/lib/auth-context';
import type { Conversation, MessagesResponse } from '@/types/chat';
import { ACCESS_TOKEN_KEY } from '@/config/constants';

// Simplified WebSocket hook for basic chat functionality
export const useChatWebSocket = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();

  // 🐛 Sửa lỗi: Dùng state để theo dõi trạng thái kết nối
  const [isConnected, setIsConnected] = useState(chatWebSocketService.isConnected);

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

  // 🚀 Cải tiến: Logic "move-to-top"
  const handleNewMessage = useCallback(
    (message: NewMessageEvent) => {
      const { conversationId } = message;

      // Update messages cache
      queryClient.setQueryData(
        [...chatKeys.messages(conversationId)],
        (old: MessagesResponse | undefined) => {
          if (!old) return old;
          const exists = old.messages.find((m) => m.id === message.id);
          if (exists) return old;

          const newMessage = {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            conversationId: message.conversationId,
            createdAt: new Date(message.createdAt),
            sender: message.sender,
          };

          return {
            ...old,
            messages: [...old.messages, newMessage],
            total: old.total + 1,
          };
        },
      );

      // Update conversations cache (with move-to-top)
      queryClient.setQueryData(chatKeys.conversations(), (old: Conversation[] | undefined) => {
        if (!old) return old;

        let updatedConversation: Conversation | undefined;
        const otherConversations = old.filter((conv) => {
          if (conv.id === conversationId) {
            updatedConversation = {
              ...conv,
              lastMessage: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                conversationId: message.conversationId,
                createdAt: new Date(message.createdAt),
                sender: message.sender,
              },
              updatedAt: new Date(message.createdAt), // Cập nhật thời gian
            };
            return false;
          }
          return true;
        });

        if (updatedConversation) {
          // Di chuyển conversation có tin nhắn mới lên đầu
          return [updatedConversation, ...otherConversations];
        }
        return old;
      });
    },
    [queryClient],
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
  const hookState = {
    sendMessage: chatWebSocketService.sendMessage.bind(chatWebSocketService),
    joinConversation: chatWebSocketService.joinConversation.bind(chatWebSocketService),
    leaveConversation: chatWebSocketService.leaveConversation.bind(chatWebSocketService),
    isConnected: isConnected, // Trả về state thay vì thuộc tính tĩnh
  };

  // Debug log for troubleshooting
  console.log('🔌 useChatWebSocket returning state:', {
    isConnected: hookState.isConnected,
    serviceConnected: chatWebSocketService.isConnected,
  });

  return hookState;
};
