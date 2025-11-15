'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Bookmark, Bell, Settings, LogOut, Wallet, Plus, FileText } from 'lucide-react';
import { Account } from '@/types/account';
import Image from 'next/image';
import { isValidAvatarUrl } from '@/lib/validation/file-validation';
import { useQuery } from '@tanstack/react-query';
import { getMyWallet } from '@/lib/api/walletApi';
import { TopupModal } from '@/components/TopupModal';

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Account | null;
  onLogout?: () => void;
}

export function UserSidebar({ isOpen, onClose, user, onLogout }: UserSidebarProps) {
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // Fetch wallet data
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: getMyWallet,
    enabled: isOpen && !!user,
  });

  // Reset modal state when sidebar closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsTopupModalOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-80 transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* User Profile Section */}
          <div className="border-b p-6">
            <button onClick={onClose} className="mb-4 text-gray-600 hover:text-gray-800">
              ✕
            </button>

            <div className="flex items-start space-x-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-200">
                {user?.avatarUrl && isValidAvatarUrl(user.avatarUrl) ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.fullName || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Wallet Balance */}
            {wallet && (
              <div className="mt-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Số dư ví</p>
                    <p className="text-lg font-bold text-primary">
                      {isLoadingWallet
                        ? '...'
                        : `${Number(wallet.balance).toLocaleString('vi-VN')} ₫`}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTopupModalOpen(true)}
                    className="flex items-center space-x-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nạp</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <User className="h-5 w-5" />
                <span>Trang cá nhân</span>
              </Link>

              <Link
                href="/my-posts"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-5 w-5" />
                <span>Bài đăng của tôi</span>
              </Link>

              <Link
                href="/bookmarks"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Bookmark className="h-5 w-5" />
                <span>Đã lưu</span>
              </Link>

              <Link
                href="/wallet"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Wallet className="h-5 w-5" />
                <span>Ví của tôi</span>
              </Link>

              <Link
                href="/notifications"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Bell className="h-5 w-5" />
                <span>Thông báo</span>
              </Link>

              <Link
                href="/settings"
                onClick={onClose}
                className="flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
                <span>Cài đặt</span>
              </Link>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="border-t p-4">
            <button
              onClick={() => {
                onLogout?.();
                onClose();
              }}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* TopupModal */}
      <TopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} />
    </>
  );
}
