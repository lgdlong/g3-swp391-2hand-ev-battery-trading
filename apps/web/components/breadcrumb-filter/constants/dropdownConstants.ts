// Constants cho các options trong dropdown filters
export const CYCLES_OPTIONS = [
  { value: '<1000', label: 'Dưới 1,000 chu kỳ' },
  { value: '1000-2000', label: '1,000 - 2,000 chu kỳ' },
  { value: '2000-3000', label: '2,000 - 3,000 chu kỳ' },
  { value: '3000-4000', label: '3,000 - 4,000 chu kỳ' },
  { value: '>4000', label: 'Trên 4,000 chu kỳ' },
] as const;

export const CAPACITY_OPTIONS = [
  { value: '<30', label: 'Dưới 30Ah' },
  { value: '30-50', label: '30Ah - 50Ah' },
  { value: '50-80', label: '50Ah - 80Ah' },
  { value: '>80', label: 'Trên 80Ah' },
] as const;

export const ODO_KM_OPTIONS = [
  { value: '<1000', label: 'Dưới 1,000 km' },
  { value: '1000-5000', label: '1,000 - 5,000 km' },
  { value: '5000-10000', label: '5,000 - 10,000 km' },
  { value: '10000-50000', label: '10,000 - 50,000 km' },
  { value: '50000-100000', label: '50,000 - 100,000 km' },
  { value: '>100000', label: 'Trên 100,000 km' },
] as const;

// Constants cho price range (EV vehicles)
export const PRICE_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 10000000000, // 10 billion VND max for EV vehicles
  DEFAULT_MAX_PRICE: 150000000000,
  STEP: 10000000,
} as const;

// Constants cho battery price range (smaller prices)
export const BATTERY_PRICE_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 100000000, // 100 million VND max for batteries
  DEFAULT_MAX_PRICE: 100000000,
  STEP: 1000000, // 1 million VND step
} as const;

// Constants cho button labels
export const BUTTON_LABELS = {
  CLEAR_FILTER: 'Xóa bộ lọc',
  CANCEL: 'Hủy',
  APPLY: 'Áp dụng',
} as const;

// Constants cho dropdown titles
export const DROPDOWN_TITLES = {
  CYCLES: 'Số chu kỳ',
  CAPACITY: 'Dung lượng pin',
  ODO_KM: 'Số km đã đi',
  PRICE: 'Chọn khoảng giá',
  BRAND: 'Hãng xe điện',
  BATTERY_BRAND: 'Thương hiệu pin',
} as const;
