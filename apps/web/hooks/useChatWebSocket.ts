import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatWebSocketService, type NewMessageEvent } from '@/lib/websocket/chat';
import { chatKeys } from './useChat';
// import { useAuth } from '@/lib/auth-context';
import type { Conversation, MessagesResponse } from '@/types/chat';
import { ACCESS_TOKEN_KEY } from '@/config/constants';

// Simplified WebSocket hook for basic chat functionality
export const useChatWebSocket = () => {
  const queryClient = useQueryClient();
  // const { user } = useAuth();

  // Connect to WebSocket
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;

    chatWebSocketService.connect(token);

    return () => {
      chatWebSocketService.disconnect();
    };
  }, []);

  // Handle new message events
  const handleNewMessage = useCallback(
    (message: NewMessageEvent) => {
      const { conversationId } = message;

      // Update messages cache with new message
      queryClient.setQueryData(
        [...chatKeys.messages(conversationId)],
        (old: MessagesResponse | undefined) => {
          if (!old) return old;

          // Check if message already exists (avoid duplicates)
          const exists = old.messages.find((m) => m.id === message.id);
          if (exists) return old;

          // Add new message to the end
          return {
            ...old,
            messages: [
              ...old.messages,
              {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                conversationId: message.conversationId,
                createdAt: new Date(message.createdAt),
                sender: message.sender,
              },
            ],
            total: old.total + 1,
          };
        },
      );

      // Update conversations cache with latest message
      queryClient.setQueryData(chatKeys.conversations(), (old: Conversation[] | undefined) => {
        if (!old) return old;

        return old.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: {
                  id: message.id,
                  content: message.content,
                  senderId: message.senderId,
                  conversationId: message.conversationId,
                  createdAt: new Date(message.createdAt),
                  sender: message.sender,
                },
              }
            : conv,
        );
      });
    },
    [queryClient],
  );

  // Set up event listeners
  useEffect(() => {
    chatWebSocketService.onNewMessage(handleNewMessage);

    return () => {
      chatWebSocketService.removeAllListeners();
    };
  }, [handleNewMessage]);

  // Return WebSocket service methods for components to use
  return {
    sendMessage: chatWebSocketService.sendMessage.bind(chatWebSocketService),
    joinConversation: chatWebSocketService.joinConversation.bind(chatWebSocketService),
    leaveConversation: chatWebSocketService.leaveConversation.bind(chatWebSocketService),
    isConnected: chatWebSocketService.isConnected,
  };
};
