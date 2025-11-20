'use client';

import React from 'react';
import { PriceFilterDropdown } from '../PriceFilterDropdown';
import { OdoKmFilterDropdown } from '../OdoKmFilterDropdown';
import { BrandFilterDropdown } from '../BrandFilterDropdown';
import { CapacityFilterDropdown } from '../CapacityFilterDropdown';
import { CyclesFilterDropdown } from '../CyclesFilterDropdown';
import { BatteryBrandFilterDropdown } from '../BatteryBrandFilterDropdown';
import { FILTER_LABELS } from '../constants/filterConstants';

interface DropdownManagerProps {
  showPriceDropdown: boolean;
  showOdoKmDropdown: boolean;
  showBrandDropdown: boolean;
  showCapacityDropdown: boolean;
  showCyclesDropdown: boolean;
  showBatteryBrandDropdown: boolean;
  appliedFilters: any;
  setShowPriceDropdown: (show: boolean) => void;
  setShowOdoKmDropdown: (show: boolean) => void;
  setShowBrandDropdown: (show: boolean) => void;
  setShowCapacityDropdown: (show: boolean) => void;
  setShowCyclesDropdown: (show: boolean) => void;
  setShowBatteryBrandDropdown: (show: boolean) => void;
  handlePriceApply: (priceRange: { min: number; max: number }) => void;
  handleOdoKmApply: (odoKm: string) => void;
  handleBrandApply: (brandId: number | null) => void;
  handleCapacityApply: (capacity: string) => void;
  handleCyclesApply: (cycles: string) => void;
  handleBatteryBrandApply: (brand: string) => void;
  type?: 'ev' | 'battery';
}

export function DropdownManager({
  showPriceDropdown,
  showOdoKmDropdown,
  showBrandDropdown,
  showCapacityDropdown,
  showCyclesDropdown,
  showBatteryBrandDropdown,
  appliedFilters,
  setShowPriceDropdown,
  setShowOdoKmDropdown,
  setShowBrandDropdown,
  setShowCapacityDropdown,
  setShowCyclesDropdown,
  setShowBatteryBrandDropdown,
  handlePriceApply,
  handleOdoKmApply,
  handleBrandApply,
  handleCapacityApply,
  handleCyclesApply,
  handleBatteryBrandApply,
  type = 'ev',
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
            max: appliedFilters.priceMax || (type === 'battery' ? 100000000 : 1000000000),
          },
          type,
        },
      },
      [FILTER_LABELS.BRAND]: {
        show: showBrandDropdown,
        component: BrandFilterDropdown,
        props: {
          onApply: handleBrandApply,
          onClose: () => setShowBrandDropdown(false),
          currentBrandId: appliedFilters.brandId,
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
      [FILTER_LABELS.BATTERY_BRAND]: {
        show: showBatteryBrandDropdown,
        component: BatteryBrandFilterDropdown,
        props: {
          onApply: handleBatteryBrandApply,
          onClose: () => setShowBatteryBrandDropdown(false),
          currentBrand: appliedFilters.batteryBrand,
        },
      },
      [FILTER_LABELS.ODO_KM]: {
        show: showOdoKmDropdown,
        component: OdoKmFilterDropdown,
        props: {
          onApply: handleOdoKmApply,
          onClose: () => setShowOdoKmDropdown(false),
          currentOdoKm: appliedFilters.odoKm,
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
