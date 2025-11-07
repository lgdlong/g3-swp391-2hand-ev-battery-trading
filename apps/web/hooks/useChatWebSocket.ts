/**
 * 🚀 REFACTORED: Simplified WebSocket hook with callback approach
 *
 * Key Changes:
 * 1. Removed complex cache updating logic for messages
 * 2. Added onNewMessage callback mechanism for external components
 * 3. Only updates conversations cache for sidebar updates
 * 4. Cleaner separation of concerns
 */

import { useEffect, useCallback, useState, useRef } from 'react';
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
import { toast } from 'sonner';

// Simplified WebSocket hook for basic chat functionality
export const useChatWebSocket = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();

  // 🐛 Sửa lỗi: Dùng state để theo dõi trạng thái kết nối
  const [isConnected, setIsConnected] = useState(chatWebSocketService.isConnected);

  // ✨ Track first connection to avoid premature disconnect
  const isFirstMountRef = useRef(true);
  const hasTriedToConnectRef = useRef(false);

  // ✨ NEW: Store message callback for external components
  const [messageCallback, setMessageCallback] = useState<((message: Message) => void) | null>(null);

  // ✅ Connect to WebSocket with delay to wait for auth state
  useEffect(() => {
    const connectWithDelay = async () => {
      // ✨ Lần đầu tiên: chờ auth sẵn sàng (isLoggedIn từ false → true)
      if (isFirstMountRef.current && !isLoggedIn) {
        console.log('🔌 Lần đầu mount: Đang chờ auth sẵn sàng...');
        return; // Chưa đến lúc, đợi isLoggedIn thay đổi
      }

      if (isFirstMountRef.current) {
        isFirstMountRef.current = false;
        console.log('🔌 Auth đã sẵn sàng, tiến hành kết nối');
        // Chờ một chút để đảm bảo token đã được lưu
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!isLoggedIn) {
        console.log('🔌 Người dùng chưa đăng nhập, ngắt kết nối WebSocket');
        chatWebSocketService.disconnect();
        setIsConnected(false);
        hasTriedToConnectRef.current = false;
        return;
      }

      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        console.warn('🔌 Không tìm thấy token truy cập để kết nối WebSocket');
        setIsConnected(false);
        return;
      }

      // Chỉ kết nối nếu chưa kết nối
      if (!chatWebSocketService.isConnected && !hasTriedToConnectRef.current) {
        hasTriedToConnectRef.current = true;
        console.log('🔌 Cố gắng kết nối WebSocket với token:', token.substring(0, 20) + '...');
        chatWebSocketService.resetReconnectionSettings();
        chatWebSocketService.connect(token);
      } else if (chatWebSocketService.isConnected) {
        console.log('🔌 WebSocket đã kết nối, bỏ qua nỗ lực kết nối');
        setIsConnected(true);
      }
    };

    connectWithDelay();

    return () => {
      console.log('🔌 Dọn dẹp kết nối WebSocket');
      chatWebSocketService.disconnect();
    };
  }, [isLoggedIn]); // Chỉ phụ thuộc vào trạng thái đăng nhập

  const handleNewMessage = useCallback(
    (message: NewMessageEvent) => {
      const { conversationId } = message;
      console.log(`🚀 WebSocket nhận tin nhắn mới:`, {
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
    console.log('🔌 Thiết lập trình nghe sự kiện WebSocket');

    // 🐛 Sửa lỗi: Đồng bộ state ngay lập tức với trạng thái hiện tại
    const currentConnectionState = chatWebSocketService.isConnected;
    console.log('🔌 Đồng bộ trạng thái kết nối ngay lập tức:', currentConnectionState);
    setIsConnected(currentConnectionState);

    //  Sửa lỗi: Lắng nghe sự kiện connect/disconnect để cập nhật state
    const cleanupConnect = chatWebSocketService.onConnect(() => {
      console.log('🔌 WebSocket đã kết nối - cập nhật trạng thái');
      setIsConnected(true);
    });

    const cleanupDisconnect = chatWebSocketService.onDisconnect((reason) => {
      setIsConnected(false);
      // setConnectionError(`WebSocket disconnected: ${reason}`);

      // ✅ Thông báo user
      toast.error('Mất kết nối chat', {
        description: `${reason}`,
        duration: 3000,
      });
    });

    const cleanupNewMessage = chatWebSocketService.onNewMessage(handleNewMessage);

    // ⚠️ Sửa lỗi: Dùng cleanup cụ thể, không dùng removeAllListeners()
    return () => {
      console.log('🔌 Dọn dẹp trình nghe sự kiện WebSocket');
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
  console.log('🔌 useChatWebSocket trả về trạng thái:', {
    isConnected: hookState.isConnected,
    serviceConnected: chatWebSocketService.isConnected,
  });

  return hookState;
};
