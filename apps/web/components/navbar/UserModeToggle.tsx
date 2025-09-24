'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown, ShoppingCart, Store } from 'lucide-react';

interface UserModeToggleProps {
  className?: string;
}

export function UserModeToggle({ className }: UserModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'buyer' | 'seller'>('buyer');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modes = [
    {
      value: 'buyer',
      label: 'Người mua',
      icon: ShoppingCart,
      description: 'Tìm kiếm và mua pin EV'
    },
    {
      value: 'seller',
      label: 'Người bán',
      icon: Store,
      description: 'Bán pin EV của bạn'
    }
  ];

  const currentMode = modes.find(mode => mode.value === selectedMode);

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
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
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
                  "w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg transition-colors duration-200 group mb-2",
                  selectedMode === mode.value && "bg-emerald-100 ring-2 ring-emerald-600"
                )}
              >
                {/* Icon container */}
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  selectedMode === mode.value
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 group-hover:bg-emerald-600 group-hover:text-white"
                )}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
