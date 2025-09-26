'use client';

import React from 'react';
import Link from 'next/link';
import { User, Bookmark, Bell, Settings, LogOut } from 'lucide-react';

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  onLogout?: () => void;
}

export function UserSidebar({ isOpen, onClose, userRole, onLogout }: UserSidebarProps) {
  if (!isOpen) return null;

  const menuItems = [
    { label: 'Profile Settings', href: '/profile', icon: User, color: 'bg-blue-500' },
    { label: 'My Bookmarks', href: '#', icon: Bookmark, color: 'bg-green-500' },
    { label: 'Notifications', href: '#', icon: Bell, color: 'bg-orange-500' },
    { label: 'Settings', href: '#', icon: Settings, color: 'bg-purple-500' },
  ];

  if (userRole === 'admin') {
    menuItems.push({ label: 'Admin Dashboard', href: '#', icon: Settings, color: 'bg-red-500' });
  }

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="absolute top-16 right-4 w-96 bg-white/95 backdrop-blur-2xl border border-gray-200/40 rounded-3xl shadow-2xl animate-in slide-in-from-top-2 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 bg-gradient-to-r from-blue-500/5 via-green-500/5 to-purple-500/5 border-b border-gray-200/40">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                User Profile
              </h3>
              <p className="text-sm text-gray-600 font-medium capitalize">{userRole || 'User'}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 px-4 py-4 text-sm text-gray-700 rounded-2xl transition-all duration-300 group relative overflow-hidden"
              onClick={onClose}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInFromRight 0.3s ease-out forwards',
              }}
            >
              {/* Icon container */}
              <div className="relative p-3 rounded-xl bg-emerald-600 text-white shadow-sm group-hover:scale-110 transition-all duration-200">
                <item.icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex flex-col items-start flex-1 relative z-10">
                <span className="font-semibold text-gray-900">{item.label}</span>
                <span className="text-xs text-gray-500">
                  {item.label === 'Admin Dashboard'
                    ? 'Quản trị hệ thống'
                    : `Truy cập ${item.label.toLowerCase()}`}
                </span>
              </div>

              {/* Arrow indicator */}
              <div className="w-2 h-2 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-gray-100/50 border-t border-gray-200/40">
          <button
            className="flex items-center gap-4 px-4 py-4 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-2xl transition-all duration-300 w-full group relative overflow-hidden"
            onClick={() => {
              onLogout?.();
              onClose();
            }}
          >
            {/* Background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Icon container */}
            <div className="relative p-3 rounded-xl bg-red-500 text-white shadow-sm group-hover:scale-110 transition-all duration-200">
              <LogOut className="h-5 w-5" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="flex flex-col items-start flex-1 relative z-10">
              <span className="font-semibold group-hover:text-red-700 transition-colors duration-300">
                Logout
              </span>
              <span className="text-xs text-red-500 group-hover:text-red-600 transition-colors duration-300">
                Đăng xuất khỏi tài khoản
              </span>
            </div>

            {/* Arrow indicator */}
            <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
