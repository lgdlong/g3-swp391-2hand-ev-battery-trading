import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { formatMessageTime } from '@/lib/utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isUnread?: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-2 mb-1 px-4 transition-all duration-300',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar - only show for other user's messages */}
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 flex-shrink-0 mb-1">
          <AvatarImage src={message.sender.avatarUrl || ''} alt={message.sender.fullName} />
          <AvatarFallback className="text-xs bg-gray-200">
            {message.sender.fullName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn('flex flex-col max-w-[65%]', isCurrentUser ? 'items-end' : 'items-start')}>
        {/* Message bubble - Messenger style */}
      <div
        className={cn(
            'rounded-2xl px-3 py-2 transition-all duration-300',
            isCurrentUser
              ? 'bg-[#0084ff] text-white rounded-tr-none'
              : 'bg-[#e4e6eb] text-gray-900 rounded-tl-none',
        )}
      >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
      </div>

        {/* Timestamp - smaller and subtle */}
        <p className={cn('text-[0.65rem] text-gray-500 mt-0.5 px-1')}>
        {formatMessageTime(message.createdAt)}
      </p>
      </div>

      {/* Spacer for current user messages */}
      {isCurrentUser && <div className="w-8 flex-shrink-0" />}
    </div>
  );
}
