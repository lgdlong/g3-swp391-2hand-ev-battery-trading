'use client';

import { Car } from 'lucide-react';

export function AdminHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Car className="w-8 h-8 text-black" />
        <div>
          <h1 className="text-3xl font-bold text-black">2Hand</h1>
          <p className="text-gray-600">EV Battery</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-black">Admin</div>
        <div className="text-sm text-gray-600">Quản trị viên</div>
      </div>
    </div>
  );
}
