'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useProvinces, useDistricts, useWards } from '@/hooks/useGeo';

export default function GeoForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [provinceCode, setProvinceCode] = useState<string>('');
  const [districtCode, setDistrictCode] = useState<string>('');
  const [wardCode, setWardCode] = useState<string>('');
  const [specificAddress, setSpecificAddress] = useState('');

  const provincesQ = useProvinces();

  const handleSubmit = () => {
    console.log('Address submitted:', {
      provinceCode,
      districtCode,
      wardCode,
      specificAddress
    });
    // TODO: Implement address submission logic
    setIsOpen(false);
  };
  const districtsQ = useDistricts(provinceCode || undefined);
  const wardsQ = useWards(districtCode || undefined);

  const provinces = provincesQ.data ?? [];
  const districts = districtsQ.data ?? [];
  const wards = wardsQ.data ?? [];

  if (!isOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Open Address Form
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium text-gray-900">Địa chỉ</h2>
          <div className="w-6" />
        </div>

        {/* Form Content */}
        <div className="p-4 space-y-4">
          {/* Province/City */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tỉnh, thành phố *</label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                value={provinceCode}
                onChange={(e) => {
                  setProvinceCode(e.target.value);
                  setDistrictCode('');
                  setWardCode('');
                }}
              >
                <option value="">-- Chọn tỉnh --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
              {provinceCode && (
                <button
                  onClick={() => {
                    setProvinceCode('');
                    setDistrictCode('');
                    setWardCode('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* District */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quận, huyện, thị xã *</label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={districtCode}
                disabled={!provinceCode || districtsQ.isLoading}
                onChange={(e) => {
                  setDistrictCode(e.target.value);
                  setWardCode('');
                }}
              >
                <option value="">-- Chọn quận/huyện --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
              {districtCode && (
                <button
                  onClick={() => {
                    setDistrictCode('');
                    setWardCode('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Ward */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phường, xã, thị trấn *</label>
            <div className="relative">
              <select
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={wardCode}
                disabled={!districtCode || wardsQ.isLoading}
                onChange={(e) => setWardCode(e.target.value)}
              >
                <option value="">-- Chọn phường/xã --</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
              {wardCode && (
                <button
                  onClick={() => setWardCode('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Specific Address */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Địa chỉ cụ thể"
              className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={specificAddress}
              onChange={(e) => setSpecificAddress(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            XONG
          </button>
        </div>
      </div>
    </div>
  );
}
