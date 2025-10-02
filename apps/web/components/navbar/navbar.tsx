'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Logo } from './Logo';
import { Navigation } from './navigation';
import { UserActions } from './UserActions';
import { UserSidebar } from './UserSidebar';
import { UserModeToggle } from './UserModeToggle';

// Add custom CSS animations
const style = `
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = style;
  document.head.appendChild(styleSheet);
}

// ===== MAIN HEADER COMPONENT =====
interface HeaderProps {
  className?: string;
}

export function Navbar({ className }: HeaderProps) {
  const { isLoggedIn, userRole, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full',
          'bg-white',
          'shadow-lg',
          'relative overflow-visible',
          className,
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo + User Mode Toggle */}
            <div className="flex items-center gap-4">
              <Logo size="md" className="group-hover:scale-105 transition-transform duration-300" />
              <UserModeToggle />
            </div>

            {/* Center: Navigation */}
            <div className="hidden md:flex md:items-center md:justify-center md:flex-1 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              <Navigation />
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center">
              <UserActions
                isLoggedIn={isLoggedIn}
                userRole={userRole || undefined}
                onUserMenuToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
            <Navigation className="flex-col space-y-4 space-x-0" />
          </div>
        </div>
      </header>

      {/* User Sidebar Overlay */}
      <UserSidebar
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        userRole={userRole || undefined}
        onLogout={logout}
      />
    </>
  );
}

// Export individual components for potential reuse
export { Logo, Navigation, UserActions, UserSidebar, UserModeToggle };
