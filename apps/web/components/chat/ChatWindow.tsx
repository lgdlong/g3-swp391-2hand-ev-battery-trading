import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal } from '@/components/ui/icons';
import { Conversation, Message } from '@/types/chat';
import ProductBanner from './ProductBanner';
import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: number;
  onSendMessage: (message: string) => void;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) {
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
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
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

      {/* Product Banner */}
      <div className="flex-shrink-0">
        <ProductBanner post={conversation.post} />
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 min-h-0 px-4">
        <div className="py-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.senderId === currentUserId}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Chat Composer */}
      <div className="flex-shrink-0">
        <ChatComposer onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
