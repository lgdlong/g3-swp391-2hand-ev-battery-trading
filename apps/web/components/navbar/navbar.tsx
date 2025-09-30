'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Logo } from './Logo';
import { Navigation } from './navigation';
import { UserActions } from './UserActions';
import { SidebarMenu } from './SidebarMenu';
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

export function Header({ className }: HeaderProps) {
  const { isLoggedIn, userRole, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const menuItems = [
    { label: 'Dashboard Overview', href: '#', icon: '📊' },
    { label: 'Battery Management', href: '#', icon: '🔋' },
    { label: 'User Analytics', href: '#', icon: '👥' },
    { label: 'Transaction History', href: '#', icon: '📈' },
    { label: 'System Settings', href: '#', icon: '⚙️' },
  ];

  // Update time on mount and every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className={cn(
        'sticky top-0 z-50 w-full',
        'bg-white',
        'shadow-lg',
        'relative overflow-visible',
        className
      )}>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Sidebar Menu + Logo + User Mode Toggle */}
            <div className="flex items-center gap-4">
              <SidebarMenu onToggle={setIsSidebarOpen} />
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

      {/* Sliding Sidebar */}
      <div
        className={cn(
          'w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 border-b border-gray-200/60 shadow-xl transition-all duration-500 ease-in-out',
          isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Quick Access</h3>
            <p className="text-sm text-gray-600 font-medium">Navigate to different sections of the platform</p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-4 p-6 bg-white/80 hover:bg-white rounded-2xl transition-all duration-300 group border border-gray-200/60 shadow-lg hover:shadow-xl backdrop-blur-sm hover:scale-105"
              >
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-green-500/20 transition-all duration-300">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Access {item.label.toLowerCase()}
                  </div>
                </div>
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200/60">
            <div className="flex items-center justify-center">
              <div className="text-xs text-gray-400 font-medium">
                Last updated: {currentTime}
              </div>
            </div>
          </div>
        </div>
      </div>

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
export { Logo, Navigation, UserActions, SidebarMenu, UserSidebar, UserModeToggle };
