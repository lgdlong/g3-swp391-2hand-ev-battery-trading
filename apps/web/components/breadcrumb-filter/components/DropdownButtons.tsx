'use client';

import React from 'react';

interface DropdownButtonProps {
  onClear: () => void;
  onCancel: () => void;
  onApply: () => void;
  showClearButton?: boolean;
}

export function DropdownButtons({
  onClear,
  onCancel,
  onApply,
  showClearButton = true
}: DropdownButtonProps) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2 border-t">
      {showClearButton && (
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
        >
          Xóa bộ lọc
        </button>
      )}
      <button
        onClick={onCancel}
        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
      >
        Hủy
      </button>
      <button
        onClick={onApply}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
      >
        Áp dụng
      </button>
    </div>
  );
}
