import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { formatMessageTime } from '@/lib/utils/format';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={cn('flex flex-col mb-6', isCurrentUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-900',
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      <p className="text-[0.7rem] text-gray-500 mt-1 px-1">
        {formatMessageTime(message.createdAt)}
      </p>
    </div>
  );
}
