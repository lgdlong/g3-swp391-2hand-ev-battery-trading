import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, MapPin, Send } from '@/components/ui/icons';

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
}

export default function ChatComposer({ onSendMessage }: ChatComposerProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Paperclip className="h-4 w-4" />
          <span className="ml-1 text-sm">Đính kèm</span>
        </Button>
        <Button variant="ghost" size="sm">
          <MapPin className="h-4 w-4" />
          <span className="ml-1 text-sm">Địa chỉ</span>
        </Button>
      </div>

      <div className="flex items-end gap-2 mt-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button onClick={handleSend} size="sm" className="mb-1">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
