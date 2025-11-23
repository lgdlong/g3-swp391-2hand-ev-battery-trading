import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm mb-6', className)}>
      <button
        onClick={() => window.location.href = '/'}
        className="hover:text-gray-700 transition-colors duration-200"
        title="Trang chủ"
      >
        <Home className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={cn(
                "font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-50",
                index === items.length - 1
                  ? "text-gray-600 bg-gray-100"
                  : "text-gray-900 hover:text-gray-700"
              )}
            >
              {item.label}
            </button>
          ) : item.href ? (
            <Link
              href={item.href}
              className={cn(
                "font-medium px-2 py-1 rounded-md transition-colors duration-200 hover:bg-gray-50",
                index === items.length - 1
                  ? "text-gray-600 bg-gray-100"
                  : "text-gray-900 hover:text-gray-700"
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "font-medium px-2 py-1 rounded-md transition-colors duration-200",
                index === items.length - 1
                  ? "text-gray-600 bg-gray-100"
                  : "text-gray-900"
              )}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
