'use client';
import React from 'react';
import { Car, Battery, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type PostType = 'ev' | 'battery';

interface PostTypeModalProps {
  showModal: boolean;
  onPostTypeSelect: (type: PostType) => void;
  onClose: () => void;
}

export default function PostTypeModal({
  showModal,
  onPostTypeSelect,
  onClose,
}: PostTypeModalProps) {
  const router = useRouter();

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Chọn loại tin đăng</h2>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">Vui lòng chọn loại sản phẩm bạn muốn đăng bán:</p>

          <div className="space-y-4">
            <button
              onClick={() => onPostTypeSelect('ev')}
              className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#048C73] hover:bg-[#048C73]/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-[#048C73]/10 transition-colors">
                  <Car className="h-8 w-8 text-gray-600 group-hover:text-[#048C73]" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Xe điện (EV)</div>
                  <div className="text-sm text-gray-600">Đăng bán xe điện, xe máy điện</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onPostTypeSelect('battery')}
              className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#048C73] hover:bg-[#048C73]/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-[#048C73]/10 transition-colors">
                  <Battery className="h-8 w-8 text-gray-600 group-hover:text-[#048C73]" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">Pin EV</div>
                  <div className="text-sm text-gray-600">Đăng bán pin xe điện, pack pin</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

