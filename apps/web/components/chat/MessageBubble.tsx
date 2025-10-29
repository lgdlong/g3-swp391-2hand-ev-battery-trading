import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: {
    id: string;
    sender: string;
    text: string;
  };
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={cn('flex mb-4', isCurrentUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-900',
        )}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
}
