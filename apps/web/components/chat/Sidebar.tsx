import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/chat';
import ChatItem from './ChatItem';

interface SidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
  currentUserId?: number;
}

export default function Sidebar({
  conversations,
  activeChatId,
  onChatSelect,
  currentUserId,
}: SidebarProps) {
  return (
    <div className="w-96 border-r border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Chat</h1>
        <Input placeholder="Nhập để tìm kiếm..." className="w-full" />
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-200">
          {conversations.map((conversation) => {
            // Determine other user (seller or buyer)
            const otherUser =
              currentUserId === conversation.sellerId ? conversation.buyer : conversation.seller;

            return (
              <ChatItem
                key={conversation.id}
                id={conversation.id}
                sellerName={otherUser.fullName}
                sellerAvatar={otherUser.avatarUrl || ''}
                lastMessage={conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                lastMessageTime={
                  conversation.lastMessage?.createdAt
                    ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''
                }
                isActive={activeChatId === conversation.id}
                onClick={onChatSelect}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
