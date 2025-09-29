'use client';

import React, { useState, useCallback } from 'react';
import { Filter, Truck, Star, DollarSign, HardDrive, Cpu, Monitor, Zap, Palette, Settings, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbFilter } from './BreadcrumbFilter';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface FilterButtonsProps {
  className?: string;
  breadcrumbItems?: BreadcrumbItem[];
  type?: 'battery' | 'ev';
  initialCategory?: string;
  initialSubcategory?: string;
  onSubcategoryChange?: (setSubcategory: (subcategory: string) => void) => void;
}

interface FilterButtonProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  hasDropdown?: boolean;
  hasInfo?: boolean;
  onClick?: () => void;
}

function FilterButton({ label, icon, isActive, hasDropdown, hasInfo, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium',
        isActive
          ? 'border-red-500 text-red-500 bg-red-50' // Nút "Bộ lọc" - màu đỏ
          : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {hasDropdown && (
        <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
      {hasInfo && (
        <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8h.01" />
        </svg>
      )}
    </button>
  );
}

export function FilterButtons({
  className,
  breadcrumbItems = [],
  type = 'ev',
  initialCategory,
  initialSubcategory,
  onSubcategoryChange
}: FilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();

  // Breadcrumb state
  const [breadcrumbState, setBreadcrumbState] = useState<{
    items: BreadcrumbItem[];
    currentCategory: string | null;
    currentSubcategory: string | null;
  }>({
    items: [],
    currentCategory: null,
    currentSubcategory: null,
  });

  // Breadcrumb functions
  const setCategory = useCallback((category: string) => {
    setBreadcrumbState(prev => ({
      ...prev,
      currentCategory: category,
      currentSubcategory: null,
      items: [
        {
          label: category,
          onClick: () => {
            if (type === 'ev' && category === 'Xe điện') {
              router.push('/posts/ev');
            } else if (type === 'battery' && category === 'Pin EV') {
              router.push('/posts/battery');
            }
          },
        }
      ]
    }));
  }, [type, router]);

  const setSubcategory = useCallback((subcategory: string) => {
    setBreadcrumbState(prev => ({
      ...prev,
      currentSubcategory: subcategory,
      items: [
        {
          label: prev.currentCategory || 'Trang chủ',
          onClick: () => {
            if (type === 'ev' && prev.currentCategory === 'Xe điện') {
              router.push('/posts/ev');
            } else if (type === 'battery' && prev.currentCategory === 'Pin EV') {
              router.push('/posts/battery');
            }
          },
        },
        {
          label: subcategory,
        }
      ]
    }));
  }, [type, router]);

  // Initialize breadcrumb on mount
  React.useEffect(() => {
    const category = initialCategory || (type === 'ev' ? 'Xe điện' : 'Pin EV');
    setCategory(category);
    if (initialSubcategory) {
      setSubcategory(initialSubcategory);
    }
  }, [initialCategory, initialSubcategory, setCategory, setSubcategory, type]);

  // Expose setSubcategory to parent
  React.useEffect(() => {
    if (onSubcategoryChange) {
      onSubcategoryChange(setSubcategory);
    }
  }, [onSubcategoryChange, setSubcategory]);

  // Use internal breadcrumb if no external breadcrumbItems provided
  const displayBreadcrumbItems = breadcrumbItems.length > 0 ? breadcrumbItems : breadcrumbState.items;

  // Filter buttons cho EV
  const evFilterButtons = [
    {
      label: 'Bộ lọc',
      icon: <Filter className="h-4 w-4" />,
      isActive: activeFilter === 'all',
      onClick: () => setActiveFilter('all')
    },
    {
      label: 'Sẵn hàng',
      icon: <Truck className="h-4 w-4" />,
      isActive: activeFilter === 'available',
      onClick: () => setActiveFilter('available')
    },
    {
      label: 'Hàng mới về',
      icon: <Star className="h-4 w-4" />,
      isActive: activeFilter === 'new-arrivals',
      onClick: () => setActiveFilter('new-arrivals')
    },
    {
      label: 'Xem theo giá',
      icon: <DollarSign className="h-4 w-4" />,
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'price',
      onClick: () => setActiveFilter('price')
    },
    {
      label: 'Nhu cầu sử dụng',
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'usage',
      onClick: () => setActiveFilter('usage')
    },
    {
      label: 'Quãng đường di chuyển',
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'range',
      onClick: () => setActiveFilter('range')
    }
  ];

  // Filter buttons cho Battery
  const batteryFilterButtons = [
    {
      label: 'Bộ lọc',
      icon: <Filter className="h-4 w-4" />,
      isActive: activeFilter === 'all',
      onClick: () => setActiveFilter('all')
    },
    {
      label: 'Sẵn hàng',
      icon: <Truck className="h-4 w-4" />,
      isActive: activeFilter === 'available',
      onClick: () => setActiveFilter('available')
    },
    {
      label: 'Hàng mới về',
      icon: <Star className="h-4 w-4" />,
      isActive: activeFilter === 'new-arrivals',
      onClick: () => setActiveFilter('new-arrivals')
    },
    {
      label: 'Xem theo giá',
      icon: <DollarSign className="h-4 w-4" />,
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'price',
      onClick: () => setActiveFilter('price')
    },
    {
      label: 'Dung lượng pin',
      icon: <Zap className="h-4 w-4" />,
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'capacity',
      onClick: () => setActiveFilter('capacity')
    },
    {
      label: 'Tình trạng pin',
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'health',
      onClick: () => setActiveFilter('health')
    },
    {
      label: 'Số chu kỳ',
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'cycles',
      onClick: () => setActiveFilter('cycles')
    },
    {
      label: 'Thương hiệu',
      hasDropdown: true,
      hasInfo: true,
      isActive: activeFilter === 'brand',
      onClick: () => setActiveFilter('brand')
    }
  ];

  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;

  return (
    <div className={cn('w-full bg-white border-b border-gray-200', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {displayBreadcrumbItems.length > 0 && (
          <div className="mb-4 px-2">
            <BreadcrumbFilter items={displayBreadcrumbItems} />
          </div>
        )}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Chọn theo tiêu chí</h3>
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((button, index) => (
              <FilterButton
                key={index}
                label={button.label}
                icon={button.icon}
                isActive={button.isActive}
                hasDropdown={button.hasDropdown}
                hasInfo={button.hasInfo}
                onClick={button.onClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
