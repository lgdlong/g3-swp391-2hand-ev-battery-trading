import { Star, DollarSign, Zap } from 'lucide-react';
import { FILTER_LABELS } from '@/config/constants/filterConstants';

export const batteryFilterButtons = [
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
    label: FILTER_LABELS.CAPACITY,
    icon: <Zap className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
  {
    label: FILTER_LABELS.HEALTH,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
  {
    label: FILTER_LABELS.CYCLES,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
  {
    label: FILTER_LABELS.BATTERY_BRAND,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
];
