import { Filter, Truck, Star, DollarSign } from 'lucide-react';

export const evFilterButtons = [
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
    label: 'Nhu cầu sử dụng',
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: 'Quãng đường di chuyển',
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  }
];
