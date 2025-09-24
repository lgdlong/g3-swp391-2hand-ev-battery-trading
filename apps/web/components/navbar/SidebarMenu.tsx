'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface SidebarMenuProps {
  className?: string;
  onToggle?: (isOpen: boolean) => void;
}

export function SidebarMenu({ className, onToggle }: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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
