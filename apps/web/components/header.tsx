'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  User,
  LogIn,
  UserPlus,
  Menu,
  Bookmark,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  ToggleLeft,
  ToggleRight,
  ShoppingCart,
  Store,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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

// ===== SIDEBAR MENU COMPONENT =====
interface SidebarMenuProps {
  className?: string;
  onToggle?: (isOpen: boolean) => void;
}

function SidebarMenu({ className, onToggle }: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard Overview', href: '#', icon: '📊' },
    { label: 'Battery Management', href: '#', icon: '🔋' },
    { label: 'User Analytics', href: '#', icon: '👥' },
    { label: 'Transaction History', href: '#', icon: '📈' },
    { label: 'System Settings', href: '#', icon: '⚙️' },
  ];

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-600 hover:text-gray-900 hover:bg-[#7EF2DD] transition-colors duration-200 group rounded-xl"
        onMouseEnter={() => handleToggle(true)}
        onMouseLeave={() => handleToggle(false)}
      >
        <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
      </Button>
    </div>
  );
}

// ===== USER SIDEBAR COMPONENT =====
interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  onLogout?: () => void;
}

function UserSidebar({ isOpen, onClose, userRole, onLogout }: UserSidebarProps) {
  if (!isOpen) return null;

  const menuItems = [
    { label: 'Profile Settings', href: '#', icon: User, color: 'bg-blue-500' },
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
              {/* Background effect removed */}

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

// ===== USER MODE TOGGLE COMPONENT =====
interface UserModeToggleProps {
  className?: string;
}

function UserModeToggle({ className }: UserModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'buyer' | 'seller'>('buyer');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modes = [
    {
      value: 'buyer',
      label: 'Người mua',
      icon: ShoppingCart,
      description: 'Tìm kiếm và mua pin EV',
    },
    {
      value: 'seller',
      label: 'Người bán',
      icon: Store,
      description: 'Bán pin EV của bạn',
    },
  ];

  const currentMode = modes.find((mode) => mode.value === selectedMode);

  const handleModeSelect = (mode: 'buyer' | 'seller') => {
    setSelectedMode(mode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative z-[99999]', className)} ref={dropdownRef}>
      {/* Mode Selector Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors duration-200 group flex items-center gap-2 rounded-xl px-3 py-2"
      >
        {currentMode && <currentMode.icon className="h-4 w-4" />}
        <span className="text-sm hidden sm:inline">{currentMode?.label}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-300', isOpen && 'rotate-180')}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-emerald-600 rounded-xl shadow-lg z-[99999] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-emerald-100 border-b border-emerald-600">
            <h3 className="text-sm font-bold text-gray-800">Chọn chế độ</h3>
            <p className="text-xs text-gray-600">Chọn vai trò của bạn trên nền tảng</p>
          </div>

          <div className="p-4">
            {modes.map((mode, index) => (
              <button
                key={mode.value}
                onClick={() => handleModeSelect(mode.value as 'buyer' | 'seller')}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200 group mb-2',
                  selectedMode === mode.value && 'bg-emerald-100 ring-2 ring-emerald-600',
                )}
              >
                {/* Icon container */}
                <div
                  className={cn(
                    'p-2 rounded-lg transition-colors duration-200',
                    selectedMode === mode.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 group-hover:bg-emerald-600 group-hover:text-white',
                  )}
                >
                  <mode.icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex flex-col items-start flex-1">
                  <span className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200">
                    {mode.label}
                  </span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                    {mode.description}
                  </span>
                </div>

                {/* Selection indicator */}
                {selectedMode === mode.value && (
                  <div className="w-2 h-2 bg-[#048C73] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-[#3DC9D9]">
            <div className="flex items-center justify-center text-xs text-gray-600">
              <span>Chế độ đã được lưu tự động</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== LOGO COMPONENT =====
interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Battery Icon */}
      <div
        className={cn(
          'bg-[#048C73] rounded-xl flex items-center justify-center text-white font-bold shadow-sm',
          'hover:shadow-md transition-all duration-200 hover:scale-105',
          sizeClasses[size],
        )}
      >
        <svg className="w-2/3 h-2/3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.67 4H14V2c0-.55-.45-1-1-1s-1 .45-1 1v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="font-bold text-xl leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          2Hand
        </span>
        <span className="text-xs text-gray-500 leading-tight font-medium">EV Battery</span>
      </div>
    </div>
  );
}

// ===== NAVIGATION COMPONENT =====
interface NavigationProps {
  className?: string;
}

const navigationItems = [
  { label: 'Brands', href: '#' },
  { label: 'Battery', href: '#' },
  { label: 'Service', href: '#' },
];

function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-10', className)}>
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all duration-300 group px-4 py-3 rounded-xl"
        >
          <span className="relative z-10">{item.label}</span>
          <div className="absolute inset-0 bg-[#7EF2DD] rounded-xl opacity-0 group-hover:opacity-100 transition-colors duration-200"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#048C73] group-hover:w-3/4 transition-all duration-200 rounded-full"></div>
        </Link>
      ))}
    </nav>
  );
}

// ===== USER ACTIONS COMPONENT =====
interface UserActionsProps {
  className?: string;
  isLoggedIn?: boolean;
  userRole?: string;
  onUserMenuToggle?: () => void;
}

function UserActions({
  className,
  isLoggedIn = false,
  userRole,
  onUserMenuToggle,
}: UserActionsProps) {
  if (isLoggedIn) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {/* Post Ad Button */}
        <Button
          asChild
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm hover:shadow-md transition-colors duration-200 group rounded-xl px-4 py-2"
        >
          <Link
            href="#"
            className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
          >
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
        <Link
          href="/sign-up"
          className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline font-semibold">Sign Up</span>
        </Link>
      </Button>
    </div>
  );
}

// ===== MAIN HEADER COMPONENT =====
interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { isLoggedIn, userRole, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard Overview', href: '#', icon: '📊' },
    { label: 'Battery Management', href: '#', icon: '🔋' },
    { label: 'User Analytics', href: '#', icon: '👥' },
    { label: 'Transaction History', href: '#', icon: '📈' },
    { label: 'System Settings', href: '#', icon: '⚙️' },
  ];

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
            {/* Left: Sidebar Menu + Logo + User Mode Toggle */}
            <div className="flex items-center gap-4">
              <SidebarMenu onToggle={setIsSidebarOpen} />
              <Link href="/" className="flex items-center group">
                <Logo
                  size="md"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
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
          isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden',
        )}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Quick Access
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Navigate to different sections of the platform
            </p>
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
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
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
                Last updated: {new Date().toLocaleTimeString()}
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
