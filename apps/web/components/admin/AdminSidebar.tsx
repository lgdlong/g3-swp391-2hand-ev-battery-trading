'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Database,
  Shield,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Users',
    href: '/admin/accounts',
    icon: Users,
    badge: null
  },
  {
    name: 'Posts',
    href: '/admin/posts',
    icon: FileText,
    badge: null
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: null
  },
  {
    name: 'Database',
    href: '/admin/database',
    icon: Database,
    badge: null
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    badge: null
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    badge: null
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    badge: null
  }
];

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-50',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center px-6 py-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200',
                    'hover:bg-gray-800',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:text-white'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-800">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@admin.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
