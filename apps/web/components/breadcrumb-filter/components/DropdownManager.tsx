'use client';

import React from 'react';
import { PriceFilterDropdown } from '../PriceFilterDropdown';
import { RangeFilterDropdown } from '../RangeFilterDropdown';
import { BrandFilterDropdown } from '../BrandFilterDropdown';
import { CapacityFilterDropdown } from '../CapacityFilterDropdown';
import { CyclesFilterDropdown } from '../CyclesFilterDropdown';
import { HealthFilterDropdown } from '../HealthFilterDropdown';
import { BatteryBrandFilterDropdown } from '../BatteryBrandFilterDropdown';
import { FILTER_LABELS } from '@/config/constants/filterConstants';

interface DropdownManagerProps {
  showPriceDropdown: boolean;
  showRangeDropdown: boolean;
  showBrandDropdown: boolean;
  showCapacityDropdown: boolean;
  showCyclesDropdown: boolean;
  showHealthDropdown: boolean;
  showBatteryBrandDropdown: boolean;
  appliedFilters: any;
  setShowPriceDropdown: (show: boolean) => void;
  setShowRangeDropdown: (show: boolean) => void;
  setShowBrandDropdown: (show: boolean) => void;
  setShowCapacityDropdown: (show: boolean) => void;
  setShowCyclesDropdown: (show: boolean) => void;
  setShowHealthDropdown: (show: boolean) => void;
  setShowBatteryBrandDropdown: (show: boolean) => void;
  handlePriceApply: (priceRange: { min: number; max: number }) => void;
  handleRangeApply: (range: string) => void;
  handleBrandApply: (brand: string) => void;
  handleCapacityApply: (capacity: string) => void;
  handleCyclesApply: (cycles: string) => void;
  handleHealthApply: (health: string) => void;
  handleBatteryBrandApply: (brand: string) => void;
}

export function DropdownManager({
  showPriceDropdown,
  showRangeDropdown,
  showBrandDropdown,
  showCapacityDropdown,
  showCyclesDropdown,
  showHealthDropdown,
  showBatteryBrandDropdown,
  appliedFilters,
  setShowPriceDropdown,
  setShowRangeDropdown,
  setShowBrandDropdown,
  setShowCapacityDropdown,
  setShowCyclesDropdown,
  setShowHealthDropdown,
  setShowBatteryBrandDropdown,
  handlePriceApply,
  handleRangeApply,
  handleBrandApply,
  handleCapacityApply,
  handleCyclesApply,
  handleHealthApply,
  handleBatteryBrandApply,
}: DropdownManagerProps) {
  // Helper function to render dropdown content
  const renderDropdownContent = (buttonLabel: string) => {
    const dropdownMap = {
      [FILTER_LABELS.PRICE]: {
        show: showPriceDropdown,
        component: PriceFilterDropdown,
        props: {
          onApply: handlePriceApply,
          onClose: () => setShowPriceDropdown(false),
          currentRange: {
            min: appliedFilters.priceMin || 0,
            max: appliedFilters.priceMax || 1000000000,
          },
        },
      },
      [FILTER_LABELS.BRAND]: {
        show: showBrandDropdown,
        component: BrandFilterDropdown,
        props: {
          onApply: handleBrandApply,
          onClose: () => setShowBrandDropdown(false),
          currentBrand: appliedFilters.brand,
        },
      },
      [FILTER_LABELS.CAPACITY]: {
        show: showCapacityDropdown,
        component: CapacityFilterDropdown,
        props: {
          onApply: handleCapacityApply,
          onClose: () => setShowCapacityDropdown(false),
          currentCapacity: appliedFilters.capacity,
        },
      },
      [FILTER_LABELS.CYCLES]: {
        show: showCyclesDropdown,
        component: CyclesFilterDropdown,
        props: {
          onApply: handleCyclesApply,
          onClose: () => setShowCyclesDropdown(false),
          currentCycles: appliedFilters.cycles,
        },
      },
      [FILTER_LABELS.HEALTH]: {
        show: showHealthDropdown,
        component: HealthFilterDropdown,
        props: {
          onApply: handleHealthApply,
          onClose: () => setShowHealthDropdown(false),
          currentHealth: appliedFilters.health,
        },
      },
      [FILTER_LABELS.BATTERY_BRAND]: {
        show: showBatteryBrandDropdown,
        component: BatteryBrandFilterDropdown,
        props: {
          onApply: handleBatteryBrandApply,
          onClose: () => setShowBatteryBrandDropdown(false),
          currentBrand: appliedFilters.batteryBrand,
        },
      },
      [FILTER_LABELS.RANGE]: {
        show: showRangeDropdown,
        component: RangeFilterDropdown,
        props: {
          onApply: handleRangeApply,
          onClose: () => setShowRangeDropdown(false),
          currentRange: appliedFilters.range,
        },
      },
    };

    const config = dropdownMap[buttonLabel as keyof typeof dropdownMap];
    if (config?.show) {
      const Component = config.component;
      return <Component {...(config.props as any)} />;
    }
    return null;
  };

  return { renderDropdownContent };
}
