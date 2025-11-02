import { Badge } from '@/components/ui/badge';
import { BadgeCheckIcon } from 'lucide-react';

interface VerificationBadgeProps {
  className?: string;
}

export function VerificationBadge({ className = '' }: VerificationBadgeProps) {
  return (
    <Badge variant="secondary" className={`bg-blue-500 text-white dark:bg-blue-600 ${className}`}>
      <BadgeCheckIcon className="h-4 w-4 mr-1" />
      Đã kiểm định
    </Badge>
  );
}
