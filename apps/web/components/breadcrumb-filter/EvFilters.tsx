import { Star, DollarSign, Car } from 'lucide-react';
import { FILTER_LABELS } from '@/config/constants/filterConstants';

export const evFilterButtons = [
  {
    label: FILTER_LABELS.NEW_ARRIVALS,
    icon: <Star className="h-4 w-4" />,
    isActive: false,
    onClick: () => {},
  },
  {
    label: FILTER_LABELS.PRICE,
    icon: <DollarSign className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
  {
    label: FILTER_LABELS.BRAND,
    icon: <Car className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
  {
    label: FILTER_LABELS.RANGE,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
];
