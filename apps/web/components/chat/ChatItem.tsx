import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ChatItemProps {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  firstPostImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  isActive: boolean;
  onClick: (id: string) => void;
}

export default function ChatItem({
  id,
  sellerName,
  sellerAvatar,
  firstPostImage,
  lastMessage,
  lastMessageTime,
  isActive,
  onClick,
}: ChatItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-100',
        isActive && 'bg-secondary',
      )}
      onClick={() => onClick(id)}
    >
      <div className="relative w-12 h-12">
        {/* Avatar chính */}
        <Avatar className="h-12 w-12">
          <AvatarImage src={sellerAvatar} alt={sellerName} />
          <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Avatar phụ - hình chữ nhật, đè lên góc dưới bên phải */}
        <div className="h-8 w-8 absolute -bottom-1 -right-1 border-1 border-white rounded bg-gray-300 flex items-center justify-center text-xs font-medium text-white overflow-hidden">
          {firstPostImage ? (
            <Image
              src={firstPostImage}
              alt={sellerName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={sellerAvatar}
              alt={sellerName}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

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
