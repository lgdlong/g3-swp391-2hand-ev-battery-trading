import { Filter, Truck, Star, DollarSign, Zap } from 'lucide-react';

export const batteryFilterButtons = [
  {
    label: 'Bộ lọc',
    icon: <Filter className="h-4 w-4" />,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Sẵn hàng',
    icon: <Truck className="h-4 w-4" />,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Hàng mới về',
    icon: <Star className="h-4 w-4" />,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Xem theo giá',
    icon: <DollarSign className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Dung lượng pin',
    icon: <Zap className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Tình trạng pin',
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Số chu kỳ',
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Thương hiệu',
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  }
];
