'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Bookmark, Bell, Settings, LogOut, Wallet, Plus, Clock, FileText, ShoppingBag } from 'lucide-react';
import { Account } from '@/types/account';
import Image from 'next/image';
import { isValidAvatarUrl } from '@/lib/validation/file-validation';
import { useQuery } from '@tanstack/react-query';
import { getMyWallet } from '@/lib/api/walletApi';
import { TopupModal } from '@/components/TopupModal';
import { getBuyerContracts, ContractStatus } from '@/lib/api/transactionApi';
import { Badge } from '@/components/ui/badge';

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

  // Fetch buyer contracts to count pending orders
  const { data: buyerContracts } = useQuery({
    queryKey: ['buyerContracts'],
    queryFn: () => getBuyerContracts(),
    enabled: isOpen && !!user,
    retry: 1,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Count contracts waiting for buyer confirmation
  const pendingOrdersCount = (buyerContracts || []).filter(
    (contract) => contract.status === ContractStatus.AWAITING_CONFIRMATION && !contract.buyerConfirmedAt,
  ).length;

  // Reset modal state when sidebar closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsTopupModalOpen(false);
    }
  }, [isOpen]);

  if (!isOpen && !isTopupModalOpen) return null;

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const menuItems = [
    { label: 'Hồ sơ', href: '/profile', icon: User },
    { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
    { label: 'Quản lý đơn hàng', href: '/my-orders', icon: ShoppingBag },
    { label: 'Lịch sử giao dịch', href: '/wallet', icon: Clock },
    { label: 'Thông báo', href: '/notifications', icon: Bell },
    { label: 'Cài đặt', href: '/settings', icon: Settings },
  ];

  const handleTopupClick = () => {
    onClose();
    // Delay opening modal to allow sidebar to close first
    setTimeout(() => {
      setIsTopupModalOpen(true);
    }, 100);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={onClose}
        >
          <div
            className="absolute top-16 right-4 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                  {user?.avatarUrl && isValidAvatarUrl(user.avatarUrl) ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName || 'User Avatar'}
                      width={32}
                      height={32}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.fullName || 'Account'}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="bg-gradient-to-r from-[#048C73]/5 to-[#048C73]/10 border-b border-gray-100">
              <Link
                href="/wallet"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#048C73]/15 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#048C73] flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#048C73] font-medium">Số dư coin</p>
                    <p className="text-sm font-bold text-[#048C73]">
                      {isLoadingWallet
                        ? 'Đang tải...'
                        : wallet
                          ? `${formatBalance(wallet.balance)} ₫`
                          : '0 ₫'}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={handleTopupClick}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#048C73]/15 transition-colors w-full"
              >
                <Plus className="h-4 w-4 text-gray-500" />
                <span>Nạp coin</span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => {
                const isOrdersItem = item.href === '/my-orders';
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gray-500" />
                      <span>{item.label}</span>
                    </div>
                    {isOrdersItem && pendingOrdersCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full"
                      >
                        {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Logout */}
            <button
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              onClick={() => {
                onLogout?.();
                onClose();
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Topup Modal */}
      <TopupModal isOpen={isTopupModalOpen} onClose={() => setIsTopupModalOpen(false)} />
    </>
  );
}
