import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal } from '@/components/ui/icons';
import { Conversation, Message } from '@/types/chat';
import ProductBanner from './ProductBanner';
import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import { ChatActionBar } from './ChatActionBar';
import { BuyerActionBar } from './BuyerActionBar';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: number;
  onSendMessage: (message: string) => void;
  existingContract?: any;
  isLoadingContract?: boolean;
  onContractCreated?: (isExternalTransaction: boolean) => void;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  existingContract,
  isLoadingContract = false,
  onContractCreated,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const currentCount = messages.length;
    const lastCount = lastMessageCountRef.current;

    if (currentCount > lastCount) {
      // New messages arrived - auto-scroll to bottom
      lastMessageCountRef.current = currentCount;
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else if (currentCount < lastCount || lastCount === 0) {
      // Messages were removed (conversation changed) or initial load
      lastMessageCountRef.current = currentCount;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-600 mb-2">Chọn một cuộc trò chuyện</h2>
          <p className="text-gray-500">
            Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    );
  }

  // Determine other user (seller or buyer)
  const otherUser =
    currentUserId === conversation.sellerId ? conversation.buyer : conversation.seller;

  return (
    <div className="flex-1 flex flex-col bg-[#f7f7f7] h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white p-4 mb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatarUrl || ''} alt={otherUser.fullName} />
              <AvatarFallback>{otherUser.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{otherUser.fullName}</h2>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Bar for Seller - Chốt đơn */}
      {conversation && (
        <ChatActionBar
          conversation={conversation}
          currentUserId={currentUserId}
          existingContract={existingContract}
          isLoadingContract={isLoadingContract}
          onContractCreated={onContractCreated || (() => {})}
        />
      )}

      {/* Action Bar for Buyer - Xác nhận đã nhận hàng */}
      {conversation && (
        <BuyerActionBar
          conversation={conversation}
          currentUserId={currentUserId}
          existingContract={existingContract}
          isLoadingContract={isLoadingContract}
        />
      )}

      {/* Product Banner */}
      <div className="flex-shrink-0">
        <ProductBanner post={conversation.post} />
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="py-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-8">
              <div className="text-center text-gray-500">
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs mt-1">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                />
              );
            })
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Composer */}
      <div className="flex-shrink-0">
        <ChatComposer onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
