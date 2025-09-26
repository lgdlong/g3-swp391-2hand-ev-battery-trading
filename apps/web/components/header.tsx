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
        className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group"
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

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="absolute top-16 right-4 w-80 bg-slate-800 border border-white/20 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">User Profile</h3>
              <p className="text-sm text-white/70 capitalize">{userRole || 'User'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
            onClick={onClose}
          >
            <User className="h-4 w-4" />
            <span>Profile Settings</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
            onClick={onClose}
          >
            <Bookmark className="h-4 w-4" />
            <span>My Bookmarks</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
            onClick={onClose}
          >
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
            onClick={onClose}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>

          {userRole === 'admin' && (
            <Link
              href="#"
              className="flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-md transition-colors"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            className="flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors w-full"
            onClick={() => {
              onLogout?.();
              onClose();
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
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
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Mode Selector Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group flex items-center gap-2"
      >
        {currentMode && <currentMode.icon className="h-4 w-4" />}
        <span className="text-sm hidden sm:inline">{currentMode?.label}</span>
        <ChevronDown
          className={cn('h-3 w-3 transition-transform duration-300', isOpen && 'rotate-180')}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-white/20 rounded-lg shadow-2xl z-[9999]">
          <div className="p-2">
            {modes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => handleModeSelect(mode.value as 'buyer' | 'seller')}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 text-sm text-white hover:bg-white/10 rounded-md transition-colors group',
                  selectedMode === mode.value && 'bg-white/5',
                )}
              >
                <mode.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{mode.label}</span>
                  <span className="text-xs text-white/60">{mode.description}</span>
                </div>
                {selectedMode === mode.value && (
                  <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </button>
            ))}
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
          'bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold',
          sizeClasses[size],
        )}
      >
        <svg className="w-2/3 h-2/3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.67 4H14V2c0-.55-.45-1-1-1s-1 .45-1 1v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-tight">2Hand</span>
        <span className="text-xs text-muted-foreground leading-tight">EV Battery</span>
      </div>
    </div>
  );
}

// ===== NAVIGATION COMPONENT =====
interface NavigationProps {
  className?: string;
}

const navigationItems = [
  { label: 'EV', href: '/posts/ev' },
  { label: 'Battery', href: '/posts/battery' },
  { label: 'Service', href: '/service' },
];

function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-10', className)}>
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative text-sm font-medium text-white/90 hover:text-white transition-all duration-300 group px-3 py-2"
        >
          <span className="relative z-10">{item.label}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-400 group-hover:w-full transition-all duration-300"></div>
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
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <Link
            href="/posts/create"
            className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng tin</span>
          </Link>
        </Button>

        {/* Bookmark Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group relative"
        >
          <Link href="#" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">Bookmarks</span>
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </Link>
        </Button>

        {/* Notifications Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group relative"
        >
          <Link href="#" className="flex items-center gap-2">
            <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="hidden sm:inline">Notifications</span>
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">5</span>
            </div>
          </Link>
        </Button>

        {/* User Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          onClick={onUserMenuToggle}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline">User</span>
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
        className="text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300 group"
      >
        <Link href="/login" className="flex items-center gap-2">
          <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="hidden sm:inline">Login</span>
        </Link>
      </Button>

      {/* Sign Up Button */}
      <Button
        asChild
        size="sm"
        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <Link
          href="/sign-up"
          className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-300"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Up</span>
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
  const [currentTime, setCurrentTime] = useState<string>('');

  const menuItems = [
    { label: 'Dashboard Overview', href: '#', icon: '📊' },
    { label: 'Battery Management', href: '#', icon: '🔋' },
    { label: 'User Analytics', href: '#', icon: '👥' },
    { label: 'Transaction History', href: '#', icon: '📈' },
    { label: 'System Settings', href: '#', icon: '⚙️' },
  ];

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-border/40',
          'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95',
          'backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/80',
          'shadow-lg shadow-slate-900/20',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-green-500/10 before:via-transparent before:to-blue-500/10 before:opacity-50',
          'after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:opacity-30',
          'relative',
          className,
        )}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -top-2 -right-4 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-cyan-500/20 rounded-full blur-lg animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
          <div className="md:hidden border-t border-white/10 pt-4 pb-4">
            <Navigation className="flex-col space-y-4 space-x-0" />
          </div>
        </div>
      </header>

      {/* Sliding Sidebar */}
      <div
        className={cn(
          'w-full bg-slate-800 border-b border-white/20 shadow-lg transition-all duration-500 ease-in-out',
          isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden',
        )}
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Quick Access</h3>
            <p className="text-sm text-white/70">Navigate to different sections of the platform</p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all duration-300 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </span>
                <div>
                  <div className="font-medium text-white group-hover:text-green-400 transition-colors duration-300">
                    {item.label}
                  </div>
                  <div className="text-xs text-white/60">Access {item.label.toLowerCase()}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Online</span>
              </div>
              <div className="text-xs text-white/40">Last updated: {currentTime || '--:--:--'}</div>
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
