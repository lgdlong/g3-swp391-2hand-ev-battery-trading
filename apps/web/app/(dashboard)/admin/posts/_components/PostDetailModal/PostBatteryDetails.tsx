import { Battery } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Post } from '@/types/api/post';

interface PostBatteryDetailsProps {
  batteryDetails?: Post['batteryDetails'];
}

const chemistryLabels: Record<string, string> = {
  LFP: 'Lithium Iron Phosphate (LFP)',
  NMC: 'Lithium Nickel Manganese Cobalt Oxide (NMC)',
  NCA: 'Lithium Nickel Cobalt Aluminum Oxide (NCA)',
  LMO: 'Lithium Manganese Oxide (LMO)',
  LCO: 'Lithium Cobalt Oxide (LCO)',
  OTHER: 'Khác',
};

const originLabels: Record<string, string> = {
  NOI_DIA: 'Nội địa',
  NHAP_KHAU: 'Nhập khẩu',
};

export function PostBatteryDetails({ batteryDetails }: PostBatteryDetailsProps) {
  if (!batteryDetails) return null;

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Battery className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết pin</h3>
            <p className="text-sm text-gray-600">Thông số kỹ thuật pin EV</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Thông tin cơ bản</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Điện áp:</span>
                  <span className="font-medium">
                    {batteryDetails.voltageV ? `${batteryDetails.voltageV} V` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dung lượng:</span>
                  <span className="font-medium">
                    {batteryDetails.capacityAh ? `${batteryDetails.capacityAh} Ah` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nguồn gốc:</span>
                  <span className="font-medium">
                    {batteryDetails.origin ? originLabels[batteryDetails.origin] || 'N/A' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trọng lượng:</span>
                  <span className="font-medium">
                    {batteryDetails.weightKg ? `${batteryDetails.weightKg} kg` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Hiệu suất</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian sạc:</span>
                  <span className="font-medium">
                    {batteryDetails.chargeTimeHours
                      ? `${batteryDetails.chargeTimeHours} giờ`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chu kỳ sử dụng:</span>
                  <span className="font-medium">
                    {batteryDetails.cycleLife ? `${batteryDetails.cycleLife} chu kỳ` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tầm hoạt động:</span>
                  <span className="font-medium">
                    {batteryDetails.rangeKm ? `${batteryDetails.rangeKm} km` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Công nghệ</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hóa học pin:</span>
                  <span className="font-medium text-xs">
                    {batteryDetails.chemistry
                      ? chemistryLabels[batteryDetails.chemistry] || 'N/A'
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {batteryDetails.compatibleNotes && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Ghi chú tương thích</h4>
            <p className="text-sm text-gray-600">{batteryDetails.compatibleNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
