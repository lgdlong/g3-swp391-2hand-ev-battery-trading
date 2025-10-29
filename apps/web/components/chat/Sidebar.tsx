import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatItem from './ChatItem';

interface ChatData {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  product: {
    image: string;
    title: string;
    price: string;
  };
  messages: Array<{
    id: string;
    sender: string;
    text: string;
  }>;
}

interface SidebarProps {
  chats: ChatData[];
  activeChatId: string | null;
  onChatSelect: (id: string) => void;
}

export default function Sidebar({ chats, activeChatId, onChatSelect }: SidebarProps) {
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
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              id={chat.id}
              sellerName={chat.sellerName}
              sellerAvatar={chat.sellerAvatar}
              lastMessage={chat.lastMessage}
              lastMessageTime={chat.lastMessageTime}
              isActive={activeChatId === chat.id}
              onClick={onChatSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
