'use client';

import React from 'react';
import { FilterButton } from '../FilterButton';
import { evFilterButtons } from '../EvFilters';
import { batteryFilterButtons } from '../BatteryFilters';

interface ButtonRendererProps {
  type: 'ev' | 'battery';
  activeFilter: string;
  handleFilterClick: (filterKey: string) => void;
  renderDropdownContent: (buttonLabel: string) => React.ReactNode;
}

export function ButtonRenderer({
  type,
  activeFilter,
  handleFilterClick,
  renderDropdownContent
}: ButtonRendererProps) {
  // Get filter buttons based on type
  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;

  // Update button states with active filter
  const buttonsWithState = filterButtons.map(button => ({
    ...button,
    isActive: button.label === 'Sẵn hàng' ? activeFilter === 'available' :
              button.label === 'Hàng mới về' ? activeFilter === 'new-arrivals' :
              button.label === 'Xem theo giá' ? activeFilter === 'price' :
              button.label === 'Hãng xe' ? activeFilter === 'brand' :
              button.label === 'Quãng đường di chuyển' ? activeFilter === 'range' :
              button.label === 'Dung lượng pin' ? activeFilter === 'capacity' :
              button.label === 'Tình trạng pin' ? activeFilter === 'health' :
              button.label === 'Số chu kỳ' ? activeFilter === 'cycles' :
              button.label === 'Thương hiệu' ? activeFilter === 'batteryBrand' : false,
    onClick: () => {
      const filterKey = button.label === 'Sẵn hàng' ? 'available' :
                       button.label === 'Hàng mới về' ? 'new-arrivals' :
                       button.label === 'Xem theo giá' ? 'price' :
                       button.label === 'Hãng xe' ? 'brand' :
                       button.label === 'Quãng đường di chuyển' ? 'range' :
                       button.label === 'Dung lượng pin' ? 'capacity' :
                       button.label === 'Tình trạng pin' ? 'health' :
                       button.label === 'Số chu kỳ' ? 'cycles' :
                       button.label === 'Thương hiệu' ? 'batteryBrand' : 'all';
      handleFilterClick(filterKey);
    }
  }));

  return (
    <div className="flex flex-wrap gap-3">
      {buttonsWithState.map((button, index) => (
        <FilterButton
          key={index}
          label={button.label}
          icon={button.icon}
          isActive={button.isActive}
          hasDropdown={button.hasDropdown}
          hasInfo={button.hasInfo}
          onClick={button.onClick}
        >
          {renderDropdownContent(button.label)}
        </FilterButton>
      ))}
    </div>
  );
}
