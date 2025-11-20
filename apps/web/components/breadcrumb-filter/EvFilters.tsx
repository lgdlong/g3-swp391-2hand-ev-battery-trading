import { DollarSign, Car, Gauge } from 'lucide-react';
import { FILTER_LABELS } from './constants/filterConstants';

export const evFilterButtons = [
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
    label: FILTER_LABELS.ODO_KM,
    icon: <Gauge className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {},
  },
];
