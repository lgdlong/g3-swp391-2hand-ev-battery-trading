'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, LogIn, UserPlus, Bookmark, Bell, ChevronDown, Plus } from 'lucide-react';

interface UserActionsProps {
  className?: string;
  isLoggedIn?: boolean;
  userRole?: string;
  onUserMenuToggle?: () => void;
}

export function UserActions({ className, isLoggedIn = false, userRole, onUserMenuToggle }: UserActionsProps) {
  if (isLoggedIn) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {/* Post Ad Button */}
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 group rounded-xl px-4 py-2"
        >
          <Link href="#" className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline font-semibold">Đăng tin</span>
          </Link>
        </Button>

        {/* Bookmark Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 group relative rounded-xl p-2"
        >
          <Link href="#" className="flex items-center">
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

        {/* User Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 group rounded-xl px-3 py-2"
          onClick={onUserMenuToggle}
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline font-medium">User</span>
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
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900 hover:bg-[#7EF2DD] transition-colors duration-200 group rounded-xl px-4 py-2"
      >
        <Link href="/login" className="flex items-center gap-2">
          <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="hidden sm:inline font-medium">Login</span>
        </Link>
      </Button>

      {/* Sign Up Button */}
      <Button
        asChild
        size="sm"
        className="bg-[#048C73] hover:bg-[#52D967] text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 group rounded-xl px-4 py-2"
      >
        <Link href="/sign-up" className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">Sign Up</span>
        </Link>
      </Button>
    </div>
  );
}
