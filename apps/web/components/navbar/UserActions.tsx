'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Bookmark, Bell, ChevronDown } from 'lucide-react';
import { Account } from '@/types/account';
import { isValidAvatarUrl } from '@/lib/validation/file-validation';

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
  if (isLoggedIn) {
    return (
      <div className={cn('flex items-center gap-8', className)}>
        <div className="flex gap-3">
          {/* Bookmark Button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 group relative rounded-xl p-2"
          >
            <Link href="/bookmarks" className="flex items-center">
              <Bookmark className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </Link>
          </Button>

          {/* Notifications Button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hover:bg-[#7EF2DD] transition-colors duration-200 group relative rounded-xl p-2"
          >
            <Link href="#" className="flex items-center">
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {/* Notification badge */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs text-white font-bold">5</span>
              </div>
            </Link>
          </Button>
        </div>

        {/* Post Ad Button */}
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 group rounded-full px-5 py-2 h-10 min-h-[40px] text-sm"
        >
          <Link
            href="/posts/create"
            className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
          >
            <span className="hidden sm:inline font-semibold">Đăng tin</span>
          </Link>
        </Button>

        {/* User Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 group rounded-xl px-3 py-2"
          onClick={onUserMenuToggle}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 bg-emerald-600">
            {user?.avatarUrl && isValidAvatarUrl(user.avatarUrl) ? (
              <Image
                src={user.avatarUrl}
                alt={user.fullName || 'User Avatar'}
                width={32}
                height={32}
                className="w-8 h-8 object-cover rounded-full"
              />
            ) : (
              <User className="h-4 w-4 text-white" />
            )}
          </div>
          <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
        </Button>
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
