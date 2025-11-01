import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatItemProps {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export default function ChatItem({
  id,
  sellerName,
  sellerAvatar,
  lastMessage,
  lastMessageTime,
  isActive,
  onClick,
}: ChatItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50',
        isActive && 'bg-secondary',
      )}
      onClick={() => onClick(id)}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={sellerAvatar} alt={sellerName} />
        <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm truncate">{sellerName}</h3>
          <span className="text-xs text-gray-500 shrink-0">{lastMessageTime}</span>
        </div>
        <p className="text-sm text-gray-600 truncate mt-1">{lastMessage}</p>
      </div>
    </div>
  );
}
