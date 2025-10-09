import { Badge } from '@/components/ui/badge';
import { POST_STATUS_META } from './types';

interface PostStatusBadgeProps {
  status: string;
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const meta = POST_STATUS_META[status as keyof typeof POST_STATUS_META] || {
    label: status,
    cls: '',
  };

  return (
    <Badge
      variant="outline"
      className={`${meta.cls} transition-all duration-200 hover:scale-105 cursor-default`}
    >
      <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
      {meta.label}
    </Badge>
  );
}
