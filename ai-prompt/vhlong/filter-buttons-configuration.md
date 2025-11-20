# Filter Buttons Configuration - Q&A

## Question: Configure Filter Buttons for EV and Battery Sections

**Prompt:**
Tôi cần định nghĩa các filter buttons cho từng loại (EV và Battery) với các tiêu chí lọc khác nhau. Làm thế nào để cấu hình các filter buttons này?

**Answer:**

### 1. EV Filter Buttons Configuration

```typescript
// apps/web/components/breadcrumb-filter/EvFilters.tsx
import { DollarSign, Car } from 'lucide-react';
import { FILTER_LABELS } from './constants/filterConstants';

export const evFilterButtons = [
  {
    label: FILTER_LABELS.PRICE,
    icon: <DollarSign className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: FILTER_LABELS.BRAND,
    icon: <Car className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: FILTER_LABELS.RANGE,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  }
];
```

**EV Filters Include:**
- ✅ **Price** (Giá) - Filter theo khoảng giá
- ✅ **Brand** (Hãng xe) - Filter theo thương hiệu xe điện
- ✅ **Range** (Quãng đường) - Filter theo quãng đường di chuyển trên 1 lần sạc

### 2. Battery Filter Buttons Configuration

```typescript
// apps/web/components/breadcrumb-filter/BatteryFilters.tsx
import { DollarSign, Zap } from 'lucide-react';
import { FILTER_LABELS } from './constants/filterConstants';

export const batteryFilterButtons = [
  {
    label: FILTER_LABELS.PRICE,
    icon: <DollarSign className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: FILTER_LABELS.CAPACITY,
    icon: <Zap className="h-4 w-4" />,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: FILTER_LABELS.HEALTH,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: FILTER_LABELS.CYCLES,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  },
  {
    label: FILTER_LABELS.BATTERY_BRAND,
    hasDropdown: true,
    hasInfo: true,
    isActive: false,
    onClick: () => {}
  }
];
```

**Battery Filters Include:**
- ✅ **Price** (Giá) - Filter theo khoảng giá
- ✅ **Capacity** (Dung lượng pin) - Filter theo dung lượng (kWh)
- ✅ **Health** (Tình trạng pin) - Filter theo tình trạng pin (excellent, very-good, good, fair, poor)
- ✅ **Cycles** (Số chu kỳ) - Filter theo số chu kỳ sạc/xả
- ✅ **Battery Brand** (Thương hiệu pin) - Filter theo thương hiệu pin (Panasonic, LG Chem, Samsung SDI, etc.)

### 3. Filter Constants

```typescript
// apps/web/components/breadcrumb-filter/constants/filterConstants.ts
// Filter constants để tránh hardcode labels
export const FILTER_LABELS = {
  NEW_ARRIVALS: 'Hàng mới về',
  PRICE: 'Xem theo giá',
  BRAND: 'Hãng xe',
  RANGE: 'Quãng đường di chuyển trên 1 lần sạc',
  CAPACITY: 'Dung lượng pin',
  HEALTH: 'Tình trạng pin',
  CYCLES: 'Số chu kỳ',
  BATTERY_BRAND: 'Thương hiệu'
} as const;

export const FILTER_KEYS = {
  NEW_ARRIVALS: 'new-arrivals',
  PRICE: 'price',
  BRAND: 'brand',
  RANGE: 'range',
  CAPACITY: 'capacity',
  HEALTH: 'health',
  CYCLES: 'cycles',
  BATTERY_BRAND: 'batteryBrand'
} as const;

// Mapping từ label sang filter key
export const LABEL_TO_FILTER_KEY: Record<string, string> = {
  [FILTER_LABELS.NEW_ARRIVALS]: FILTER_KEYS.NEW_ARRIVALS,
  [FILTER_LABELS.PRICE]: FILTER_KEYS.PRICE,
  [FILTER_LABELS.BRAND]: FILTER_KEYS.BRAND,
  [FILTER_LABELS.RANGE]: FILTER_KEYS.RANGE,
  [FILTER_LABELS.CAPACITY]: FILTER_KEYS.CAPACITY,
  [FILTER_LABELS.HEALTH]: FILTER_KEYS.HEALTH,
  [FILTER_LABELS.CYCLES]: FILTER_KEYS.CYCLES,
  [FILTER_LABELS.BATTERY_BRAND]: FILTER_KEYS.BATTERY_BRAND
};
```

### 4. Usage in ButtonRenderer

```typescript
// apps/web/components/breadcrumb-filter/components/ButtonRenderer.tsx
import { evFilterButtons } from '../EvFilters';
import { batteryFilterButtons } from '../BatteryFilters';

export function ButtonRenderer({ type, appliedFilters, handleFilterClick, renderDropdownContent }) {
  // Get filter buttons based on type
  const filterButtons = type === 'battery' ? batteryFilterButtons : evFilterButtons;
  
  // Render buttons with state
  // ...
}
```

### Key Features:
- ✅ **Type-based Configuration**: Khác nhau cho EV và Battery
- ✅ **Icon Support**: Mỗi filter có icon riêng
- ✅ **Constants-based**: Sử dụng constants để tránh hardcode
- ✅ **Extensible**: Dễ dàng thêm filter mới
- ✅ **Mapping System**: Mapping từ label sang filter key
- ✅ **Consistent Structure**: Tất cả buttons có cùng structure

### Adding New Filter:

1. Thêm label vào `FILTER_LABELS` trong `filterConstants.ts`
2. Thêm key vào `FILTER_KEYS`
3. Thêm mapping vào `LABEL_TO_FILTER_KEY`
4. Thêm button config vào `evFilterButtons` hoặc `batteryFilterButtons`
5. Tạo dropdown component tương ứng
6. Thêm handler vào `useFilterHandlers`
7. Thêm vào `DropdownManager`

