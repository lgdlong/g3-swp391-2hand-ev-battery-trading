'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { User, Bookmark, Bell, ChevronDown, MessageCircle } from 'lucide-react';
import { Account } from '@/types/account';
import { isValidAvatarUrl } from '@/lib/validation/file-validation';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chatApi';
import { useRouter } from 'next/navigation';

interface UserActionsProps {
  className?: string;
  isLoggedIn?: boolean;
  user?: Account | null;
  onUserMenuToggle?: () => void;
}

export function UserActions({
  className,
  isLoggedIn = false,
  user,
  onUserMenuToggle,
}: UserActionsProps) {
  const router = useRouter();
  // Fetch unread message count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadMessageCount'],
    queryFn: () => chatApi.getUnreadMessageCount(),
    enabled: isLoggedIn && !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  if (isLoggedIn) {
    return (
      <div className={cn('flex items-center gap-2 sm:gap-3 flex-wrap', className)}>
        {/* User-specific action buttons - Only show for authenticated users with valid user data */}
        {user && (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Bookmark Button */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 group relative rounded-full p-2 h-9 w-9"
            >
              <Link href="/bookmarks" className="flex items-center justify-center">
                <Bookmark className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}

        {/* View My Posts Button - Only show for authenticated users with valid user data */}
        {user && (
          <>
            <Button
              asChild
              size="sm"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 hover:border-emerald-400 shadow-sm hover:shadow-md transition-colors duration-200 group rounded-full px-3 sm:px-5 py-2 h-9 sm:h-10 text-xs sm:text-sm whitespace-nowrap"
            >
              <Link
                href="/my-posts"
                className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
              >
                <span className="hidden sm:inline font-semibold">Quản lý tin</span>
                <span className="sm:hidden font-semibold">Tin</span>
              </Link>
            </Button>
          </>
        )}

        {/* Post Ad Button - Only show for authenticated users with valid user data */}
        {user && (
          <Button
            asChild
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 group rounded-full px-3 sm:px-5 py-2 h-9 sm:h-10 text-xs sm:text-sm whitespace-nowrap"
          >
            <Link
              href="/posts/create"
              className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
            >
              <span className="hidden sm:inline font-semibold">Đăng tin</span>
              <span className="sm:hidden font-semibold">Đăng</span>
            </Link>
          </Button>
        )}

        {/* User Menu Button - Only show for authenticated users with valid user data */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 group rounded-xl px-2 sm:px-3 py-2 h-9 sm:h-10"
            onClick={onUserMenuToggle}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 bg-emerald-600">
              {user.avatarUrl && isValidAvatarUrl(user.avatarUrl) ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName || 'User Avatar'}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              )}
            </div>
            <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300 hidden sm:block" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Login Button */}
      <Button
        asChild
        size="sm"
        className="bg-emerald-700 text-white rounded-full px-5 py-2 h-10 min-h-[40px] text-sm"
      >
        <Link href="/login" className="flex items-center gap-2 w-full h-full justify-center">
          <span className="hidden sm:inline font-semibold">Đăng nhập</span>
        </Link>
      </Button>
    </div>
  );
}
