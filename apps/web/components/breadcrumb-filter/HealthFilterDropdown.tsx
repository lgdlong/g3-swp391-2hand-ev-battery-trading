'use client';

import React, { useState } from 'react';

interface HealthFilterDropdownProps {
  onApply: (health: string) => void;
  onClose: () => void;
  currentHealth?: string;
}

export function HealthFilterDropdown({ onApply, onClose, currentHealth = '' }: HealthFilterDropdownProps) {
  const [selectedHealth, setSelectedHealth] = useState(currentHealth);

  const healthOptions = [
    { value: 'excellent', label: 'Xuất sắc (90-100%)' },
    { value: 'very-good', label: 'Rất tốt (80-89%)' },
    { value: 'good', label: 'Tốt (70-79%)' },
    { value: 'fair', label: 'Khá (60-69%)' },
    { value: 'poor', label: 'Kém (dưới 60%)' }
  ];

  const handleApply = () => {
    onApply(selectedHealth);
    onClose();
  };

  const handleClear = () => {
    setSelectedHealth('');
    onApply('');
    onClose();
  };

  return (
    <div className="w-80 bg-white border border-emerald-600 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Tình trạng pin</h3>

          <div className="space-y-2">
            {healthOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="health"
                  value={option.value}
                  checked={selectedHealth === option.value}
                  onChange={(e) => setSelectedHealth(e.target.value)}
                  className="w-3 h-3 text-emerald-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              onClick={handleClear}
              className="px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
