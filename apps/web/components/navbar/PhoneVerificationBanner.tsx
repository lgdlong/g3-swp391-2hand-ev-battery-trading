'use client';

import { X, AlertCircle, Phone } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function PhoneVerificationBanner() {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Refresh user data every 3 seconds to check if phone was added
  useEffect(() => {
    if (!isLoggedIn || !user || isDismissed || user.phone) {
      return;
    }

    const interval = setInterval(() => {
      refreshUser();
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoggedIn, user, isDismissed, refreshUser]);

  // Only show if user is logged in and doesn't have phone
  if (!isLoggedIn || !user || isDismissed || user.phone) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-900 font-medium">
              Hãy thêm số điện thoại để dễ dàng trao đổi hơn
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Số điện thoại giúp người mua liên hệ với bạn nhanh chóng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
          >
            <Phone className="h-4 w-4" />
            <span>Thêm ngay</span>
          </Link>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-amber-200 rounded-md transition-colors duration-200"
            title="Đóng thông báo"
          >
            <X className="h-4 w-4 text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
