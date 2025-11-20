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

export const RANGE_OPTIONS = [
  { value: '<300', label: 'Dưới 300km/lần sạc' },
  { value: '300-600', label: '300km - 600km/lần sạc' },
  { value: '>600', label: 'Trên 600km/lần sạc' },
] as const;

export const ODO_KM_OPTIONS = [
  { value: '<1000', label: 'Dưới 1,000 km' },
  { value: '1000-5000', label: '1,000 - 5,000 km' },
  { value: '5000-10000', label: '5,000 - 10,000 km' },
  { value: '10000-50000', label: '10,000 - 50,000 km' },
  { value: '50000-100000', label: '50,000 - 100,000 km' },
  { value: '>100000', label: 'Trên 100,000 km' },
] as const;

export const HEALTH_OPTIONS = [
  { value: 'excellent', label: 'Xuất sắc (90-100%)' },
  { value: 'very-good', label: 'Rất tốt (80-89%)' },
  { value: 'good', label: 'Tốt (70-79%)' },
  { value: 'fair', label: 'Khá (60-69%)' },
  { value: 'poor', label: 'Kém (dưới 60%)' },
] as const;

export const BATTERY_BRAND_OPTIONS = [
  { value: 'panasonic', label: 'Panasonic' },
  { value: 'lg-chem', label: 'LG Chem' },
  { value: 'samsung-sdi', label: 'Samsung SDI' },
  { value: 'catl', label: 'CATL' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'byd', label: 'BYD' },
  { value: 'sk-innovation', label: 'SK Innovation' },
  { value: 'northvolt', label: 'Northvolt' },
  { value: 'calb', label: 'CALB' },
  { value: 'eve-energy', label: 'EVE Energy' },
] as const;

// Constants cho price range (EV vehicles)
export const PRICE_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 10000000000,
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
  RANGE: 'Quãng đường di chuyển trên 1 lần sạc',
  ODO_KM: 'Số km đã đi',
  HEALTH: 'Tình trạng pin',
  PRICE: 'Chọn khoảng giá',
  BRAND: 'Hãng xe điện',
  BATTERY_BRAND: 'Thương hiệu pin',
} as const;
